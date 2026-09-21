from rest_framework import status
from rest_framework.test import APITestCase
from django.test import override_settings
from unittest.mock import patch
from urllib.parse import parse_qs, urlparse

from .models import User


class DeveloperAccountTests(APITestCase):
    def test_signup_and_login(self):
        signup = self.client.post(
            "/api/v1/accounts/signup/",
            {"username": "developer", "email": "developer@example.com", "password": "safe-password-123"},
            format="json",
        )
        self.assertEqual(signup.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", signup.data)
        self.assertIn("refresh", signup.data)

        login = self.client.post(
            "/api/v1/accounts/login/",
            {"email": "developer@example.com", "password": "safe-password-123"},
            format="json",
        )
        self.assertEqual(login.status_code, status.HTTP_200_OK)
        self.assertIn("access", login.data)
        self.assertEqual(login.data["user"]["email"], "developer@example.com")

        refreshed = self.client.post("/api/v1/accounts/token/refresh/", {"refresh": login.data["refresh"]}, format="json")
        self.assertEqual(refreshed.status_code, status.HTTP_200_OK)

    def test_duplicate_email_and_invalid_password_are_rejected(self):
        self.client.post(
            "/api/v1/accounts/signup/",
            {"username": "developer", "email": "developer@example.com", "password": "safe-password-123"},
            format="json",
        )
        duplicate = self.client.post(
            "/api/v1/accounts/signup/",
            {"username": "another", "email": "developer@example.com", "password": "safe-password-123"},
            format="json",
        )
        self.assertEqual(duplicate.status_code, status.HTTP_400_BAD_REQUEST)
        invalid_login = self.client.post(
            "/api/v1/accounts/login/", {"email": "developer@example.com", "password": "wrong"}, format="json"
        )
        self.assertEqual(invalid_login.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_developer_can_update_profile(self):
        user = User.objects.create_user("developer", "developer@example.com", "safe-password-123")
        self.client.force_authenticate(user)
        response = self.client.patch("/api/v1/accounts/profile/", {"username": "updated"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["user"]["username"], "updated")

    @override_settings(GOOGLE_OAUTH_CLIENT_ID="google-client", GOOGLE_OAUTH_CLIENT_SECRET="google-secret")
    @patch("accounts.views.fetch_developer_oauth_identity", return_value=("oauth@example.com", "OAuth Developer"))
    def test_google_oauth_creates_developer_and_returns_developer_tokens(self, identity):
        start = self.client.get("/api/v1/accounts/oauth/google/start/")
        self.assertEqual(start.status_code, status.HTTP_200_OK)
        query = parse_qs(urlparse(start.data["authorization_url"]).query)
        self.assertEqual(query["redirect_uri"], ["http://localhost:8000/api/v1/accounts/oauth/google/callback/"])

        state = query["state"][0]
        callback = self.client.get(f"/api/v1/accounts/oauth/google/callback/?code=test-code&state={state}")
        self.assertEqual(callback.status_code, status.HTTP_302_FOUND)
        exchange_code = parse_qs(urlparse(callback["Location"]).query)["exchange"][0]
        exchange = self.client.post("/api/v1/accounts/oauth/exchange/", {"code": exchange_code}, format="json")
        self.assertEqual(exchange.status_code, status.HTTP_200_OK)
        self.assertIn("access", exchange.data)
        self.assertEqual(exchange.data["user"]["provider"], "google")
        self.assertEqual(User.objects.get(email="oauth@example.com").first_name, "OAuth Developer")
        identity.assert_called_once_with("google", "test-code")

        replay = self.client.get(f"/api/v1/accounts/oauth/google/callback/?code=test-code&state={state}")
        self.assertEqual(replay.status_code, status.HTTP_400_BAD_REQUEST)

    @override_settings(
        GITHUB_DEVELOPER_CLIENT_ID="developer-github-client",
        GITHUB_DEVELOPER_CLIENT_SECRET="developer-github-secret",
    )
    @patch("accounts.views.fetch_developer_oauth_identity", return_value=("github@example.com", "GitHub Developer"))
    def test_github_oauth_uses_developer_credentials(self, identity):
        start = self.client.get("/api/v1/accounts/oauth/github/start/")
        self.assertEqual(start.status_code, status.HTTP_200_OK)
        query = parse_qs(urlparse(start.data["authorization_url"]).query)
        self.assertEqual(query["client_id"], ["developer-github-client"])
        self.assertEqual(query["redirect_uri"], ["http://localhost:8000/api/v1/accounts/oauth/github/callback/"])

        callback = self.client.get(
            f"/api/v1/accounts/oauth/github/callback/?code=test-code&state={query['state'][0]}"
        )
        self.assertEqual(callback.status_code, status.HTTP_302_FOUND)
        self.assertEqual(User.objects.filter(email="github@example.com").count(), 1)
        identity.assert_called_once_with("github", "test-code")

    @override_settings(GOOGLE_OAUTH_CLIENT_ID="google-client", GOOGLE_OAUTH_CLIENT_SECRET="google-secret")
    def test_oauth_denial_and_missing_code_are_handled_cleanly(self):
        start = self.client.get("/api/v1/accounts/oauth/google/start/")
        state = parse_qs(urlparse(start.data["authorization_url"]).query)["state"][0]
        denied = self.client.get(f"/api/v1/accounts/oauth/google/callback/?error=access_denied&state={state}")
        self.assertEqual(denied.status_code, status.HTTP_400_BAD_REQUEST)

        start = self.client.get("/api/v1/accounts/oauth/google/start/")
        state = parse_qs(urlparse(start.data["authorization_url"]).query)["state"][0]
        missing_code = self.client.get(f"/api/v1/accounts/oauth/google/callback/?state={state}")
        self.assertEqual(missing_code.status_code, status.HTTP_400_BAD_REQUEST)
