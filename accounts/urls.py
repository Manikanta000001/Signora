from django.urls import path

from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    DeveloperOAuthCallbackView,
    DeveloperOAuthStartView,
    DeveloperSignupView,
    DeveloperLoginView,
    DeveloperProfileView,
    DeveloperOAuthExchangeView,
)


urlpatterns = [
    path("profile/", DeveloperProfileView.as_view(), name="developer-profile"),
    path("oauth/exchange/", DeveloperOAuthExchangeView.as_view(), name="developer-oauth-exchange"),
    path(
        "signup/",
        DeveloperSignupView.as_view(),
        name="developer-signup"
    ),

    path(
        "login/",
        DeveloperLoginView.as_view(),
        name="developer-login"
    ),

    path(
        "token/refresh/",
        TokenRefreshView.as_view(),
        name="token-refresh"
    ),

    path(
        "oauth/<str:provider>/start/",
        DeveloperOAuthStartView.as_view(),
        name="developer-oauth-start"
    ),

    path(
        "oauth/<str:provider>/callback/",
        DeveloperOAuthCallbackView.as_view(),
        name="developer-oauth-callback"
    ),
]
