import json
import hashlib
import secrets
from datetime import timedelta
from urllib.error import HTTPError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from django.conf import settings
from django.core import signing
from django.db import transaction
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken

from .models import DeveloperOAuthExchange, DeveloperOAuthState, User


DEVELOPER_OAUTH_PROVIDERS = {
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
        "client_id_setting": "GITHUB_DEVELOPER_CLIENT_ID",
        "client_secret_setting": "GITHUB_DEVELOPER_CLIENT_SECRET",
        "scope": "read:user user:email",
    },
}


def _provider_config(provider):
    try:
        return DEVELOPER_OAUTH_PROVIDERS[provider]
    except KeyError as error:
        raise ValueError("Unsupported OAuth provider.") from error


def _callback_url(provider):
    return settings.DEVELOPER_OAUTH_CALLBACK_URL.format(provider=provider)


def create_developer_oauth_authorization_url(provider):
    config = _provider_config(provider)
    client_id = getattr(settings, config["client_id_setting"])
    if not client_id:
        raise ValueError(f"{provider.title()} developer OAuth is not configured.")

    nonce = secrets.token_urlsafe(32)
    DeveloperOAuthState.objects.create(
        provider=provider,
        nonce=nonce,
        expires_at=timezone.now() + timedelta(minutes=settings.OAUTH_STATE_LIFETIME_MINUTES),
    )
    state = signing.dumps(
        {"provider": provider, "nonce": nonce}, salt="accounts.developer-oauth"
    )
    query = urlencode(
        {
            "client_id": client_id,
            "redirect_uri": _callback_url(provider),
            "response_type": "code",
            "scope": config["scope"],
            "state": state,
        }
    )
    return f"{config['authorize_url']}?{query}"


def consume_developer_oauth_state(provider, state):
    payload = signing.loads(
        state,
        salt="accounts.developer-oauth",
        max_age=settings.OAUTH_STATE_LIFETIME_MINUTES * 60,
    )
    if payload.get("provider") != provider:
        raise signing.BadSignature("Provider does not match state.")

    with transaction.atomic():
        oauth_state = DeveloperOAuthState.objects.select_for_update().filter(
            provider=provider,
            nonce=payload.get("nonce"),
            used_at__isnull=True,
            expires_at__gt=timezone.now(),
        ).first()
        if not oauth_state:
            raise signing.BadSignature("OAuth state is invalid or already used.")
        oauth_state.used_at = timezone.now()
        oauth_state.save(update_fields=["used_at"])


def _json_request(url, data=None, headers=None):
    request = Request(url, data=data, headers=headers or {})
    try:
        with urlopen(request, timeout=10) as response:
            return json.loads(response.read().decode("utf-8"))
    except (HTTPError, OSError, json.JSONDecodeError) as error:
        raise ValueError("OAuth provider request failed.") from error


def fetch_developer_oauth_identity(provider, code):
    """Exchange an authorization code for a provider-verified email and name."""
    config = _provider_config(provider)
    client_id = getattr(settings, config["client_id_setting"])
    client_secret = getattr(settings, config["client_secret_setting"])
    if not client_id or not client_secret:
        raise ValueError(f"{provider.title()} developer OAuth is not configured.")

    token_data = _json_request(
        config["token_url"],
        urlencode(
            {
                "client_id": client_id,
                "client_secret": client_secret,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": _callback_url(provider),
            }
        ).encode(),
        {"Accept": "application/json", "Content-Type": "application/x-www-form-urlencoded"},
    )
    access_token = token_data.get("access_token")
    if not access_token:
        raise ValueError("Provider did not return an access token.")

    headers = {"Authorization": f"Bearer {access_token}", "Accept": "application/json"}
    profile = _json_request(config["identity_url"], headers=headers)
    if provider == "google":
        email = profile.get("email")
        if not email or not profile.get("email_verified"):
            raise ValueError("Google did not provide a verified email address.")
        return email, profile.get("name", "")

    emails = _json_request(config["emails_url"], headers=headers)
    email = next(
        (item["email"] for item in emails if item.get("primary") and item.get("verified")),
        None,
    )
    if not email:
        raise ValueError("GitHub did not provide a verified primary email address.")
    return email, profile.get("name") or profile.get("login", "")


def get_or_create_developer_oauth_user(email, name):
    user = User.objects.filter(email__iexact=email).first()
    if user:
        return user

    base_username = (email.partition("@")[0] or "developer")[:140]
    username = base_username
    while User.objects.filter(username=username).exists():
        username = f"{base_username[:139]}-{secrets.token_hex(4)}"

    user = User(username=username, email=email)
    if name:
        user.first_name = name[:150]
    user.set_unusable_password()
    user.save()
    return user


def create_developer_oauth_exchange(user, provider):
    code = secrets.token_urlsafe(32)
    DeveloperOAuthExchange.objects.create(
        user=user, provider=provider, code_hash=hashlib.sha256(code.encode()).hexdigest(),
        expires_at=timezone.now() + timedelta(minutes=2),
    )
    return code


def consume_developer_oauth_exchange(code):
    if not code:
        return None
    exchange = DeveloperOAuthExchange.objects.select_related("user").filter(
        code_hash=hashlib.sha256(code.encode()).hexdigest(), used_at__isnull=True,
        expires_at__gt=timezone.now(), user__is_active=True,
    ).first()
    if not exchange:
        return None
    exchange.used_at = timezone.now()
    exchange.save(update_fields=["used_at"])
    return exchange


def issue_developer_tokens(user):
    refresh = RefreshToken.for_user(user)
    return {"access": str(refresh.access_token), "refresh": str(refresh), "token_type": "Bearer"}
