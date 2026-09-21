from django.urls import path

from .views import (
    SendOTPView,
    EndUserTokenRefreshView,
    OAuthCallbackView,
    OAuthStartView,
    VerifyOTPView,
    TokenIntrospectionView,
    OAuthExchangeView,
)


urlpatterns = [
    path(
        "otp/send/",
        SendOTPView.as_view(),
        name="send-otp"
    ),

    path(
        "otp/verify/",
        VerifyOTPView.as_view(),
        name="verify-otp"
    ),
    path("token/refresh/", EndUserTokenRefreshView.as_view(), name="end-user-token-refresh"),
    path("introspect/", TokenIntrospectionView.as_view(), name="token-introspect"),
    path("oauth/exchange/", OAuthExchangeView.as_view(), name="oauth-exchange"),
    path("oauth/<str:provider>/start/", OAuthStartView.as_view(), name="oauth-start"),
    path("oauth/<str:provider>/callback/", OAuthCallbackView.as_view(), name="oauth-callback"),
]
