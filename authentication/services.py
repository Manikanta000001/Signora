import hashlib
import hmac
import secrets
from datetime import timedelta
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from urllib.error import HTTPError
import json

import jwt
from django.conf import settings
from django.core import signing
from django.utils import timezone

import requests
from django.template.loader import render_to_string

from .models import AuthenticationActivity, EndUser, OTP, OAuthLoginExchange, OAuthState


def generate_otp():
    return f"{secrets.randbelow(1000000):06d}"


def hash_otp(otp):
    return hashlib.sha256(
        otp.encode()
    ).hexdigest()


def log_activity(application, event, user=None, detail=""):
    return AuthenticationActivity.objects.create(
        application=application, user=user, event=event, detail=detail[:255]
    )


def issue_end_user_tokens(user):
    """Issue tokens distinct from developer JWTs and bound to one application."""
    now = timezone.now()
    common_claims = {
        "sub": str(user.id),
        "application_id": str(user.application_id),
        "email": user.email,
        "iss": settings.END_USER_TOKEN_ISSUER,
        "aud": settings.END_USER_TOKEN_AUDIENCE,
        "iat": now,
    }
    access = jwt.encode(
        {**common_claims, "type": "access", "exp": now + settings.END_USER_ACCESS_TOKEN_LIFETIME},
        settings.END_USER_TOKEN_SECRET,
        algorithm="HS256",
    )
    refresh = jwt.encode(
        {**common_claims, "type": "refresh", "exp": now + settings.END_USER_REFRESH_TOKEN_LIFETIME},
        settings.END_USER_TOKEN_SECRET,
        algorithm="HS256",
    )
    return {"access": access, "refresh": refresh, "token_type": "Bearer"}


def refresh_end_user_access_token(refresh_token):
    claims = jwt.decode(
        refresh_token,
        settings.END_USER_TOKEN_SECRET,
        algorithms=["HS256"],
        issuer=settings.END_USER_TOKEN_ISSUER,
        audience=settings.END_USER_TOKEN_AUDIENCE,
    )
    if claims.get("type") != "refresh":
        raise jwt.InvalidTokenError("Expected a refresh token.")
    user = EndUser.objects.select_related("application").filter(
        id=claims.get("sub"), application_id=claims.get("application_id"), is_active=True
    ).first()
    if not user:
        raise jwt.InvalidTokenError("User is unavailable.")
    return issue_end_user_tokens(user)


OAUTH_PROVIDERS = {
    "google": {
        "authorize_url": "https://accounts.google.com/o/oauth2/v2/auth",
        "token_url": "https://oauth2.googleapis.com/token",
        "identity_url": "https://openidconnect.googleapis.com/v1/userinfo",
        "client_id_setting": "GOOGLE_OAUTH_CLIENT_ID",
        "client_secret_setting": "GOOGLE_OAUTH_CLIENT_SECRET",
        "scope": "openid email profile",
    },
    "github": {
        "authorize_url": "https://github.com/login/oauth/authorize",
        "token_url": "https://github.com/login/oauth/access_token",
        "identity_url": "https://api.github.com/user",
        "emails_url": "https://api.github.com/user/emails",
        "client_id_setting": "GITHUB_OAUTH_CLIENT_ID",
        "client_secret_setting": "GITHUB_OAUTH_CLIENT_SECRET",
        "scope": "read:user user:email",
    },
}


def create_oauth_authorization_url(application, provider):
    config = OAUTH_PROVIDERS[provider]
    client_id = getattr(settings, config["client_id_setting"])
    if not client_id:
        raise ValueError(f"{provider.title()} OAuth is not configured.")
    nonce = secrets.token_urlsafe(32)
    OAuthState.objects.create(
        application=application,
        provider=provider,
        nonce=nonce,
        expires_at=timezone.now() + timedelta(minutes=settings.OAUTH_STATE_LIFETIME_MINUTES),
    )
    state = signing.dumps({"provider": provider, "nonce": nonce}, salt="authenticator.oauth")
    query = urlencode({
        "client_id": client_id,
        "redirect_uri": settings.OAUTH_CALLBACK_URL.format(provider=provider),
        "response_type": "code",
        "scope": config["scope"],
        "state": state,
    })
    return f"{config['authorize_url']}?{query}"


def consume_oauth_state(provider, state):
    payload = signing.loads(
        state, salt="authenticator.oauth", max_age=settings.OAUTH_STATE_LIFETIME_MINUTES * 60
    )
    if payload.get("provider") != provider:
        raise signing.BadSignature("Provider does not match state.")
    oauth_state = OAuthState.objects.select_related("application").filter(
        provider=provider, nonce=payload.get("nonce"), used_at__isnull=True, expires_at__gt=timezone.now()
    ).first()
    if not oauth_state:
        raise signing.BadSignature("OAuth state is invalid or already used.")
    oauth_state.used_at = timezone.now()
    oauth_state.save(update_fields=["used_at"])
    return oauth_state.application


def _json_request(url, data=None, headers=None):
    request = Request(
        url,
        data=data,
        headers=headers or {},
    )

    try:
        with urlopen(request, timeout=10) as response:
            return json.loads(response.read().decode("utf-8"))

    except HTTPError as error:
        # Provider error bodies may contain sensitive context; never print them.
        raise ValueError("OAuth provider request failed.") from error


def fetch_oauth_identity(provider, code):
    """Exchange an OAuth authorization code and return the verified email/name."""

    config = OAUTH_PROVIDERS[provider]

    client_id = getattr(settings, config["client_id_setting"])
    client_secret = getattr(settings, config["client_secret_setting"])

    if not client_id or not client_secret:
        raise ValueError(f"{provider.title()} OAuth is not configured.")

    # Exchange authorization code for access token
    token_data = _json_request(
        config["token_url"],
        urlencode({
            "client_id": client_id,
            "client_secret": client_secret,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": settings.OAUTH_CALLBACK_URL.format(
                provider=provider
            ),
        }).encode(),
        {
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
        },
    )

    access_token = token_data.get("access_token")

    if not access_token:
        raise ValueError("Provider did not return an access token.")

    # Use access token to fetch the user's profile
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json",
    }

    profile = _json_request(
        config["identity_url"],
        headers=headers,
    )

    # Google
    if provider == "google":
        email = profile.get("email")

        if not email or not profile.get("email_verified"):
            raise ValueError(
                "Google did not provide a verified email address."
            )

        return email, profile.get("name", "")

    # GitHub
    emails = _json_request(
        config["emails_url"],
        headers=headers,
    )

    verified_email = next(
        (
            item["email"]
            for item in emails
            if item.get("primary") and item.get("verified")
        ),
        None,
    )

    if not verified_email:
        raise ValueError(
            "GitHub did not provide a verified primary email address."
        )

    return (
        verified_email,
        profile.get("name") or profile.get("login", ""),
    )

def send_otp_email(email, otp_code, application_name):
    html_content = render_to_string(
        "authentication/otp_email.html",
        {
            "otp": otp_code,
            "application_name": application_name,
        },
    )

    payload = {
        "sender": {
            "name": settings.BREVO_SENDER_NAME,
            "email": settings.BREVO_SENDER_EMAIL,
        },
        "to": [
            {
                "email": email,
            }
        ],
        "subject": f"Signora Auth Passcode - {application_name}",
        "htmlContent": html_content,
    }

    response = requests.post(
        "https://api.brevo.com/v3/smtp/email",
        headers={
            "accept": "application/json",
            "api-key": settings.BREVO_API_KEY,
            "content-type": "application/json",
        },
        json=payload,
        timeout=10,
    )

    response.raise_for_status()

def create_otp(user):
    otp_code = generate_otp()

    OTP.objects.filter(
        user=user,
        is_used=False
    ).update(is_used=True)

    otp = OTP.objects.create(
        user=user,
        code_hash=hash_otp(otp_code),
        expires_at=timezone.now() + timedelta(minutes=settings.OTP_LIFETIME_MINUTES)
    )

    return otp, otp_code


def verify_otp(user, otp_code):
    otp = (
        OTP.objects
        .filter(
            user=user,
            is_used=False
        )
        .order_by("-created_at")
        .first()
    )

    if not otp:
        return False, "No active OTP found."

    if timezone.now() > otp.expires_at:
        return False, "OTP has expired."

    if otp.attempts >= 5:
        return False, "Too many attempts."

    otp.attempts += 1
    otp.save(update_fields=["attempts"])

    if not hmac.compare_digest(hash_otp(otp_code), otp.code_hash):
        return False, "Invalid OTP."

    otp.is_used = True
    otp.save(update_fields=["is_used"])

    user.last_login_at = timezone.now()
    user.save(update_fields=["last_login_at"])

    return True, "OTP verified successfully."


def create_oauth_login_exchange(application, user, provider):
    code = secrets.token_urlsafe(32)
    OAuthLoginExchange.objects.create(
        application=application, user=user, provider=provider,
        code_hash=hashlib.sha256(code.encode()).hexdigest(),
        expires_at=timezone.now() + timedelta(minutes=2),
    )
    return code


def consume_oauth_login_exchange(code):
    if not code:
        return None
    exchange = OAuthLoginExchange.objects.select_related("user", "application").filter(
        code_hash=hashlib.sha256(code.encode()).hexdigest(), used_at__isnull=True,
        expires_at__gt=timezone.now(),
    ).first()
    if not exchange or not exchange.user.is_active:
        return None
    exchange.used_at = timezone.now()
    exchange.save(update_fields=["used_at"])
    return exchange
