import re
from unittest.mock import patch
from urllib.parse import parse_qs, urlparse

from django.core import mail
from django.test import override_settings
from django.utils import timezone
from datetime import timedelta
import jwt
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from applications.models import Application
from applications.services import generate_api_key
from .models import EndUser
from .services import issue_end_user_tokens
from .models import AuthenticationActivity, OTP


class OTPAPITests(APITestCase):
    def setUp(self):
        owner = User.objects.create_user("developer", "developer@example.com", "safe-password-123")
        self.application = Application.objects.create(owner=owner, name="Storefront")
        _, self.raw_key = generate_api_key(self.application)
        self.headers = {"HTTP_X_API_KEY": self.raw_key}

    def test_send_and_verify_otp_for_the_calling_application(self):
        sent = self.client.post(
            "/api/v1/auth/otp/send/",
            {"email": "customer@example.com", "name": "Customer"},
            format="json",
            **self.headers,
        )
        self.assertEqual(sent.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1)
        otp = re.search(r"\b(\d{6})\b", mail.outbox[0].body).group(1)

        verified = self.client.post(
            "/api/v1/auth/otp/verify/",
            {"email": "customer@example.com", "otp": otp},
            format="json",
            **self.headers,
        )
        self.assertEqual(verified.status_code, status.HTTP_200_OK)
        self.assertEqual(verified.data["user"]["name"], "Customer")
        self.assertIsNotNone(EndUser.objects.get(email="customer@example.com").last_login_at)

    def test_otp_endpoint_rejects_missing_api_key(self):
        response = self.client.post("/api/v1/auth/otp/send/", {"email": "customer@example.com"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @override_settings(OTP_RESEND_SECONDS=0)
    def test_same_user_is_reused_and_isolated_per_application(self):
        payload = {"email": "alex@example.com", "name": "Alex"}
        self.client.post("/api/v1/auth/otp/send/", payload, format="json", **self.headers)
        self.client.post("/api/v1/auth/otp/send/", payload, format="json", **self.headers)
        self.assertEqual(EndUser.objects.filter(application=self.application, email=payload["email"]).count(), 1)
        self.assertEqual(OTP.objects.filter(user__application=self.application).count(), 2)
        self.assertTrue(OTP.objects.filter(user__application=self.application).order_by("created_at")[0].is_used)

        owner = User.objects.create_user("other", "other@example.com", "safe-password-123")
        other_application = Application.objects.create(owner=owner, name="Other")
        _, other_key = generate_api_key(other_application)
        self.client.post("/api/v1/auth/otp/send/", payload, format="json", HTTP_X_API_KEY=other_key)
        self.assertEqual(EndUser.objects.filter(email=payload["email"]).count(), 2)

    def test_invalid_otp_logs_failure_and_used_otp_cannot_be_reused(self):
        self.client.post("/api/v1/auth/otp/send/", {"email": "alex@example.com"}, format="json", **self.headers)
        incorrect = self.client.post(
            "/api/v1/auth/otp/verify/", {"email": "alex@example.com", "otp": "000000"}, format="json", **self.headers
        )
        self.assertEqual(incorrect.status_code, status.HTTP_400_BAD_REQUEST)
        otp = re.search(r"\b(\d{6})\b", mail.outbox[0].body).group(1)
        verified = self.client.post(
            "/api/v1/auth/otp/verify/", {"email": "alex@example.com", "otp": otp}, format="json", **self.headers
        )
        self.assertEqual(verified.status_code, status.HTTP_200_OK)
        self.assertIn("access", verified.data["tokens"])
        reused = self.client.post(
            "/api/v1/auth/otp/verify/", {"email": "alex@example.com", "otp": otp}, format="json", **self.headers
        )
        self.assertEqual(reused.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue(AuthenticationActivity.objects.filter(event="otp_failed").exists())

    def test_end_user_refresh_does_not_use_developer_authentication(self):
        self.client.post("/api/v1/auth/otp/send/", {"email": "alex@example.com"}, format="json", **self.headers)
        otp = re.search(r"\b(\d{6})\b", mail.outbox[0].body).group(1)
        verified = self.client.post(
            "/api/v1/auth/otp/verify/", {"email": "alex@example.com", "otp": otp}, format="json", **self.headers
        )
        refreshed = self.client.post("/api/v1/auth/token/refresh/", {"refresh": verified.data["tokens"]["refresh"]}, format="json")
        self.assertEqual(refreshed.status_code, status.HTTP_200_OK)
        self.assertIn("access", refreshed.data["tokens"])

    def test_introspection_validates_end_user_access_token_and_application_scope(self):
        user = EndUser.objects.create(application=self.application, email="customer@example.com", name="Customer")
        access = issue_end_user_tokens(user)["access"]
        valid = self.client.post("/api/v1/auth/introspect/", {"token": access}, format="json", **self.headers)
        self.assertEqual(valid.status_code, status.HTTP_200_OK)
        self.assertTrue(valid.data["active"])
        self.assertEqual(valid.data["user"]["email"], user.email)

        refresh = issue_end_user_tokens(user)["refresh"]
        self.assertFalse(self.client.post("/api/v1/auth/introspect/", {"token": refresh}, format="json", **self.headers).data["active"])
        self.assertFalse(self.client.post("/api/v1/auth/introspect/", {"token": "not-a-token"}, format="json", **self.headers).data["active"])

        owner = User.objects.create_user("other", "other@example.com", "safe-password-123")
        other_app = Application.objects.create(owner=owner, name="Other")
        _, other_key = generate_api_key(other_app)
        self.assertFalse(self.client.post("/api/v1/auth/introspect/", {"token": access}, format="json", HTTP_X_API_KEY=other_key).data["active"])

    def test_introspection_rejects_invalid_claims_and_inactive_users(self):
        user = EndUser.objects.create(application=self.application, email="customer@example.com")
        claims = {"sub": str(user.id), "application_id": str(self.application.id), "email": user.email,
                  "iss": "wrong", "aud": "wrong", "type": "access", "exp": timezone.now() + timedelta(minutes=5)}
        invalid = jwt.encode(claims, "wrong-secret", algorithm="HS256")
        self.assertFalse(self.client.post("/api/v1/auth/introspect/", {"token": invalid}, format="json", **self.headers).data["active"])
        user.is_active = False
        user.save(update_fields=["is_active"])
        access = issue_end_user_tokens(user)["access"]
        self.assertFalse(self.client.post("/api/v1/auth/introspect/", {"token": access}, format="json", **self.headers).data["active"])
        self.assertEqual(self.client.post("/api/v1/auth/introspect/", {"token": access}, format="json").status_code, status.HTTP_401_UNAUTHORIZED)

    @override_settings(GOOGLE_OAUTH_CLIENT_ID="test-client", GOOGLE_OAUTH_CLIENT_SECRET="test-secret")
    @patch("authentication.views.fetch_oauth_identity", return_value=("alex@example.com", "Alex"))
    def test_google_callback_uses_one_time_application_bound_state(self, identity):
        start = self.client.get("/api/v1/auth/oauth/google/start/", **self.headers)
        self.assertEqual(start.status_code, status.HTTP_200_OK)
        state = parse_qs(urlparse(start.data["authorization_url"]).query)["state"][0]
        callback = self.client.get(f"/api/v1/auth/oauth/google/callback/?code=test-code&state={state}")
        self.assertEqual(callback.status_code, status.HTTP_302_FOUND)
        self.assertEqual(EndUser.objects.get(email="alex@example.com").application, self.application)
        exchange_code = parse_qs(urlparse(callback["Location"]).query)["exchange"][0]
        exchanged = self.client.post("/api/v1/auth/oauth/exchange/", {"code": exchange_code}, format="json")
        self.assertEqual(exchanged.status_code, status.HTTP_200_OK)
        self.assertIn("access", exchanged.data["tokens"])
        replay = self.client.get(f"/api/v1/auth/oauth/google/callback/?code=test-code&state={state}")
        self.assertEqual(replay.status_code, status.HTTP_400_BAD_REQUEST)
        identity.assert_called_once_with("google", "test-code")
