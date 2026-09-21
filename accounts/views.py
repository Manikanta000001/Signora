from django.conf import settings
from django.shortcuts import redirect
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework_simplejwt.views import TokenObtainPairView

from .services import (
    DEVELOPER_OAUTH_PROVIDERS,
    consume_developer_oauth_state,
    create_developer_oauth_authorization_url,
    fetch_developer_oauth_identity,
    get_or_create_developer_oauth_user,
    issue_developer_tokens,
    create_developer_oauth_exchange,
    consume_developer_oauth_exchange,
)
from .serializers import DeveloperSignupSerializer, DeveloperTokenObtainPairSerializer
from .models import User

class DeveloperLoginView(TokenObtainPairView):
    serializer_class = DeveloperTokenObtainPairSerializer


class DeveloperProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"success": True, "user": developer_user_payload(request.user)})

    def patch(self, request):
        username = request.data.get("username", "").strip()
        if not username:
            return Response({"success": False, "message": "A developer name is required."}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(username=username).exclude(id=request.user.id).exists():
            return Response({"success": False, "message": "That developer name is already in use."}, status=status.HTTP_400_BAD_REQUEST)
        request.user.username = username
        request.user.save(update_fields=["username"])
        return Response({"success": True, "user": developer_user_payload(request.user)})


def developer_user_payload(user):
    return {"id": user.id, "username": user.username, "email": user.email, "provider": user.auth_provider}


class DeveloperOAuthExchangeView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        exchange = consume_developer_oauth_exchange(request.data.get("code", ""))
        if not exchange:
            return Response({"success": False, "message": "Invalid or expired OAuth exchange."}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"success": True, "user": developer_user_payload(exchange.user), **issue_developer_tokens(exchange.user)})


class DeveloperSignupView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = DeveloperSignupSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        user = serializer.save()
        tokens = issue_developer_tokens(user)

        return Response(
            {
                "success": True,
                "message": "Developer account created successfully.",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "provider": "password",
                },
                "access": tokens["access"],
                "refresh": tokens["refresh"],
            },
            status=status.HTTP_201_CREATED
        )


class DeveloperOAuthStartView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, provider):
        if provider not in DEVELOPER_OAUTH_PROVIDERS:
            return Response({"success": False, "message": "Unsupported OAuth provider."}, status=status.HTTP_404_NOT_FOUND)
        try:
            authorization_url = create_developer_oauth_authorization_url(provider)
        except ValueError as error:
            return Response({"success": False, "message": str(error)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        return Response({"success": True, "authorization_url": authorization_url})


class DeveloperOAuthCallbackView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, provider):
        if provider not in DEVELOPER_OAUTH_PROVIDERS:
            return Response({"success": False, "message": "Unsupported OAuth provider."}, status=status.HTTP_404_NOT_FOUND)

        try:
            consume_developer_oauth_state(provider, request.query_params.get("state", ""))
        except Exception:
            return Response({"success": False, "message": "Invalid or expired OAuth state."}, status=status.HTTP_400_BAD_REQUEST)

        if request.query_params.get("error"):
            return Response({"success": False, "message": "OAuth authorization was not completed."}, status=status.HTTP_400_BAD_REQUEST)
        code = request.query_params.get("code")
        if not code:
            return Response({"success": False, "message": "Authorization code is missing."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            email, name = fetch_developer_oauth_identity(provider, code)
            user = get_or_create_developer_oauth_user(email, name)
            if user.auth_provider != provider:
                user.auth_provider = provider
                user.save(update_fields=["auth_provider"])
        except Exception:
            return Response({"success": False, "message": "OAuth authentication failed."}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_active:
            return Response({"success": False, "message": "Authentication failed."}, status=status.HTTP_403_FORBIDDEN)

        exchange_code = create_developer_oauth_exchange(user, provider)
        return redirect(f"{settings.DEVELOPER_OAUTH_FRONTEND_URL}oauth/developer-callback?exchange={exchange_code}")
