from rest_framework.views import APIView

from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from django.conf import settings
from django.core.mail import send_mail
from django.shortcuts import redirect
from django.utils import timezone
from datetime import timedelta
import jwt
import logging


from .models import EndUser, OTP


from .serializers import (
    SendOTPSerializer,
    EndUserTokenRefreshSerializer,
    VerifyOTPSerializer,
    TokenIntrospectionSerializer,
    OAuthExchangeSerializer,
)

from .services import (
    OAUTH_PROVIDERS,
    consume_oauth_state,
    create_otp,
    create_oauth_authorization_url,
    fetch_oauth_identity,
    issue_end_user_tokens,
    log_activity,
    refresh_end_user_access_token,
    verify_otp,
    create_oauth_login_exchange,
    consume_oauth_login_exchange,
)
from applications.services import get_application_for_api_key


logger = logging.getLogger(__name__)


def application_from_request(request):
    """Authenticate a client application using its X-API-Key header."""
    return get_application_for_api_key(request.headers.get("X-API-Key"))


class SendOTPView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = SendOTPSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        application = application_from_request(request)
        if not application:
            return Response(
                {"success": False, "message": "A valid X-API-Key header is required."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        email = serializer.validated_data["email"]
        name = serializer.validated_data.get("name", "")

        user, created = EndUser.objects.get_or_create(
            application=application, email=email, defaults={"name": name}
        )
        if name and not created and user.name != name:
            user.name = name
            user.save(update_fields=["name"])
        if not user.is_active:
            return Response({"success": False, "message": "User is inactive."}, status=status.HTTP_403_FORBIDDEN)

        resend_after = timezone.now() - timedelta(seconds=settings.OTP_RESEND_SECONDS)
        if OTP.objects.filter(user=user, is_used=False, created_at__gte=resend_after).exists():
            return Response(
                {"success": False, "message": "Please wait before requesting another code."},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        otp, otp_code = create_otp(user)

        send_mail(
            subject="Your verification code",
            message=f"Your verification code is {otp_code}. It expires in 5 minutes.",
            from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@localhost"),
            recipient_list=[email],
            fail_silently=False,
        )
        log_activity(application, "otp_sent", user)

        return Response(
            {
                "success": True,
                "message": "OTP generated successfully."
            },
            status=status.HTTP_200_OK
        )

class VerifyOTPView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = VerifyOTPSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        application = application_from_request(request)
        if not application:
            return Response(
                {"success": False, "message": "A valid X-API-Key header is required."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        email = serializer.validated_data["email"]
        otp_code = serializer.validated_data["otp"]

        user = EndUser.objects.filter(
            application=application,
            email=email,
            is_active=True
        ).first()

        if not user:
            log_activity(application, "otp_failed", detail="Unknown or inactive end user")
            return Response(
                {
                    "success": False,
                    "message": "User not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        verified, message = verify_otp(
            user,
            otp_code
        )

        if not verified:
            log_activity(application, "otp_failed", user, message)
            return Response(
                {
                    "success": False,
                    "message": message
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        log_activity(application, "otp_verified", user)

        return Response(
            {
                "success": True,
                "message": message,
                "user": {
                    "id": str(user.id),
                    "email": user.email,
                    "name": user.name
                },
                "tokens": issue_end_user_tokens(user),
            },
            status=status.HTTP_200_OK
        )


class EndUserTokenRefreshView(APIView):
    """Refresh an end-user token without involving the developer JWT system."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = EndUserTokenRefreshSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            tokens = refresh_end_user_access_token(serializer.validated_data["refresh"])
        except jwt.PyJWTError:
            return Response(
                {"success": False, "message": "Invalid or expired refresh token."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        return Response({"success": True, "tokens": tokens})


class TokenIntrospectionView(APIView):
    """Return 200/active=false for bad end-user tokens to avoid token detail leaks."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = TokenIntrospectionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        application = application_from_request(request)
        if not application:
            return Response({"active": False, "message": "A valid X-API-Key header is required."}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            claims = jwt.decode(
                serializer.validated_data["token"], settings.END_USER_TOKEN_SECRET,
                algorithms=["HS256"], issuer=settings.END_USER_TOKEN_ISSUER,
                audience=settings.END_USER_TOKEN_AUDIENCE,
            )
            if claims.get("type") != "access" or claims.get("application_id") != str(application.id):
                raise jwt.InvalidTokenError("Incompatible access token.")
            user = EndUser.objects.filter(
                id=claims.get("sub"), application=application, is_active=True
            ).first()
            if not user:
                raise jwt.InvalidTokenError("Unavailable user.")
        except jwt.PyJWTError:
            return Response({"active": False, "message": "Invalid or expired access token."})
        return Response({"active": True, "user": {
            "id": str(user.id), "email": user.email, "name": user.name,
            "application_id": str(application.id),
        }})


class OAuthExchangeView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = OAuthExchangeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        exchange = consume_oauth_login_exchange(serializer.validated_data["code"])
        if not exchange:
            return Response({"success": False, "message": "Invalid or expired OAuth exchange."}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"success": True, "user": {
            "id": str(exchange.user.id), "email": exchange.user.email, "name": exchange.user.name,
            "application_id": str(exchange.application.id),
        }, "tokens": issue_end_user_tokens(exchange.user)})


class OAuthStartView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, provider):
        if provider not in OAUTH_PROVIDERS:
            return Response({"success": False, "message": "Unsupported OAuth provider."}, status=status.HTTP_404_NOT_FOUND)
        application = application_from_request(request)
        if not application:
            return Response({"success": False, "message": "Invalid API key."}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            authorization_url = create_oauth_authorization_url(application, provider)
        except ValueError as error:
            return Response({"success": False, "message": str(error)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        return Response({"success": True, "authorization_url": authorization_url})


class OAuthCallbackView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, provider):
        # Check provider
        if provider not in OAUTH_PROVIDERS:
            return Response(
                {
                    "success": False,
                    "message": "Unsupported OAuth provider."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # Get OAuth state
        state = request.query_params.get("state", "")

        try:
            application = consume_oauth_state(provider, state)
        except Exception:
            logger.exception("OAuth state validation failed")

            return Response(
                {
                    "success": False,
                    "message": "Invalid or expired OAuth state."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if Google/GitHub returned an OAuth error
        oauth_error = request.query_params.get("error")

        if oauth_error:
            log_activity(
                application,
                "oauth_failed",
                detail=f"Provider returned error: {oauth_error}",
            )

            return Response(
                {
                    "success": False,
                    "message": "OAuth authorization was not completed."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Authorization code must exist
        code = request.query_params.get("code")

        if not code:
            log_activity(
                application,
                "oauth_failed",
                detail="Missing authorization code",
            )

            return Response(
                {
                    "success": False,
                    "message": "Authorization code is missing."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Exchange OAuth code for provider identity
        try:
            email, name = fetch_oauth_identity(
                provider,
                code,
            )

            user, created = EndUser.objects.get_or_create(
                application=application,
                email=email,
                defaults={
                    "name": name,
                },
            )

            # Update name if provider gives a newer name
            if name and user.name != name:
                user.name = name
                user.save(update_fields=["name"])

            # Check whether user is active
            if not user.is_active:
                log_activity(
                    application,
                    "oauth_failed",
                    user,
                    "Inactive end user",
                )

                return Response(
                    {
                        "success": False,
                        "message": "Authentication failed."
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

            # Update last login
            user.last_login_at = timezone.now()
            user.save(update_fields=["last_login_at"])

            # Log successful authentication
            log_activity(
                application,
                "oauth_succeeded",
                user,
            )

        except Exception as error:
            logger.exception(
                "OAuth identity exchange failed for %s",
                provider,
            )

            log_activity(
                application,
                "oauth_failed",
                detail="Provider identity exchange failed",
            )

            return Response(
                {
                    "success": False,
                    "message": "OAuth authentication failed."
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        exchange_code = create_oauth_login_exchange(application, user, provider)
        return redirect(f"{settings.END_USER_OAUTH_FRONTEND_URL}?exchange={exchange_code}")
