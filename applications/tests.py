from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from .models import APIKey, Application
from authentication.models import AuthenticationActivity, EndUser


class ApplicationAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user("developer", "developer@example.com", "safe-password-123")
        self.client.force_authenticate(self.user)

    def test_create_application_and_key_then_revoke_key(self):
        created = self.client.post(
            "/api/v1/applications/", {"name": "Storefront", "environment": "development"}, format="json"
        )
        self.assertEqual(created.status_code, status.HTTP_201_CREATED)
        app_id = created.data["application"]["id"]

        key_response = self.client.post(
            f"/api/v1/applications/{app_id}/api-keys/", {"name": "Web client"}, format="json"
        )
        self.assertEqual(key_response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(key_response.data["api_key"]["key"].startswith("ak_test_"))
        key = APIKey.objects.get(id=key_response.data["api_key"]["id"])

        revoked = self.client.delete(f"/api/v1/applications/{app_id}/api-keys/{key.id}/")
        self.assertEqual(revoked.status_code, status.HTTP_204_NO_CONTENT)
        key.refresh_from_db()
        self.assertTrue(key.revoked)

    def test_developer_cannot_access_another_developers_application(self):
        other = User.objects.create_user("other", "other@example.com", "safe-password-123")
        application = Application.objects.create(owner=other, name="Private")
        response = self.client.get(f"/api/v1/applications/{application.id}/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(self.client.patch(
            f"/api/v1/applications/{application.id}/", {"name": "Changed"}, format="json"
        ).status_code, status.HTTP_404_NOT_FOUND)

    def test_dashboard_summary_contains_only_the_developers_real_data(self):
        application = Application.objects.create(owner=self.user, name="Storefront")
        active_user = EndUser.objects.create(application=application, email="active@example.com")
        EndUser.objects.create(application=application, email="inactive@example.com", is_active=False)
        AuthenticationActivity.objects.create(
            application=application, user=active_user, event="otp_verified"
        )
        AuthenticationActivity.objects.create(
            application=application, user=active_user, event="oauth_succeeded"
        )
        AuthenticationActivity.objects.create(
            application=application, user=active_user, event="otp_failed"
        )

        other = User.objects.create_user("other", "other@example.com", "safe-password-123")
        other_application = Application.objects.create(owner=other, name="Private")
        AuthenticationActivity.objects.create(application=other_application, event="otp_verified")

        response = self.client.get("/api/v1/applications/dashboard/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["metrics"], {
            "applications": 1,
            "active_users": 1,
            "successful_auth": 2,
            "otp_verifications": 1,
        })
        self.assertEqual(len(response.data["chart"]), 7)
        self.assertEqual(len(response.data["activity"]), 3)

    def test_application_users_and_activity_are_owner_scoped(self):
        application = Application.objects.create(owner=self.user, name="Storefront")
        end_user = EndUser.objects.create(application=application, email="customer@example.com")
        AuthenticationActivity.objects.create(application=application, user=end_user, event="otp_verified")

        users = self.client.get(f"/api/v1/applications/{application.id}/users/")
        activity = self.client.get(f"/api/v1/applications/{application.id}/activity/")

        self.assertEqual(users.status_code, status.HTTP_200_OK)
        self.assertEqual(users.data["users"][0]["email"], "customer@example.com")
        self.assertEqual(activity.status_code, status.HTTP_200_OK)
        self.assertEqual(activity.data["activity"][0]["event"], "otp_verified")

        other = User.objects.create_user("other", "other@example.com", "safe-password-123")
        private_application = Application.objects.create(owner=other, name="Private")
        self.assertEqual(
            self.client.get(f"/api/v1/applications/{private_application.id}/users/").status_code,
            status.HTTP_404_NOT_FOUND,
        )
