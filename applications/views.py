from datetime import timedelta

from django.db.models import Count, Q
from django.db.models.functions import TruncDate
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import APIKey, Application
from .serializers import APIKeySerializer, ApplicationSerializer, CreateAPIKeySerializer
from .services import generate_api_key
from authentication.models import AuthenticationActivity, EndUser


SUCCESS_EVENTS = ("otp_verified", "oauth_succeeded")
FAILED_EVENTS = ("otp_failed", "oauth_failed")
EVENT_TITLES = {
    "otp_sent": "OTP sent",
    "otp_verified": "OTP verification successful",
    "otp_failed": "OTP verification failed",
    "oauth_succeeded": "OAuth authentication successful",
    "oauth_failed": "OAuth authentication failed",
}


class DashboardSummaryView(APIView):
    """Return only the authenticated developer's real dashboard data."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        applications = Application.objects.filter(owner=request.user)
        activities = AuthenticationActivity.objects.filter(application__owner=request.user)
        today = timezone.localdate()
        start_day = today - timedelta(days=6)
        weekly_activity = activities.filter(created_at__date__gte=start_day)

        daily_counts = {
            row["day"]: row
            for row in (
                weekly_activity.annotate(day=TruncDate("created_at"))
                .values("day")
                .annotate(
                    success=Count("id", filter=Q(event__in=SUCCESS_EVENTS)),
                    failed=Count("id", filter=Q(event__in=FAILED_EVENTS)),
                )
            )
        }
        chart = []
        for offset in range(7):
            day = start_day + timedelta(days=offset)
            counts = daily_counts.get(day, {})
            chart.append(
                {
                    "date": day.isoformat(),
                    "label": day.strftime("%a"),
                    "success": counts.get("success", 0),
                    "failed": counts.get("failed", 0),
                }
            )

        recent_activities = activities.select_related("user")[:4]
        return Response(
            {
                "success": True,
                "metrics": {
                    "applications": applications.count(),
                    "active_users": EndUser.objects.filter(
                        application__owner=request.user, is_active=True
                    ).count(),
                    "successful_auth": activities.filter(event__in=SUCCESS_EVENTS).count(),
                    "otp_verifications": activities.filter(event="otp_verified").count(),
                },
                "chart": chart,
                "activity": [
                    {
                        "id": str(activity.id),
                        "event": activity.event,
                        "status": "success" if activity.event in SUCCESS_EVENTS or activity.event == "otp_sent" else "failed",
                        "title": EVENT_TITLES[activity.event],
                        "user": activity.user.email if activity.user else activity.detail or "Unknown user",
                        "created_at": activity.created_at.isoformat(),
                    }
                    for activity in recent_activities
                ],
            }
        )


class ApplicationListCreateView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        applications = Application.objects.filter(owner=request.user).order_by("-created_at")
        return Response({"success": True, "applications": ApplicationSerializer(applications, many=True).data})

    def post(self, request):
        serializer = ApplicationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        application = serializer.save(owner=request.user)
        return Response(
            {"success": True, "message": "Application created successfully.", "application": ApplicationSerializer(application).data},
            status=status.HTTP_201_CREATED,
        )


class ApplicationDetailView(APIView):

    permission_classes = [IsAuthenticated]

    def get_object(self, request, application_id):
        return Application.objects.filter(id=application_id, owner=request.user).first()

    def get(self, request, application_id):
        application = self.get_object(request, application_id)
        if not application:
            return Response({"success": False, "message": "Application not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response({"success": True, "application": ApplicationSerializer(application).data})

    def patch(self, request, application_id):
        application = self.get_object(request, application_id)
        if not application:
            return Response({"success": False, "message": "Application not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = ApplicationSerializer(application, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"success": True, "application": serializer.data})

    def delete(self, request, application_id):
        application = self.get_object(request, application_id)
        if not application:
            return Response({"success": False, "message": "Application not found."}, status=status.HTTP_404_NOT_FOUND)
        application.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ApplicationUsersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, application_id):
        application = Application.objects.filter(id=application_id, owner=request.user).first()
        if not application:
            return Response({"success": False, "message": "Application not found."}, status=status.HTTP_404_NOT_FOUND)

        users = EndUser.objects.filter(application=application).order_by("-created_at")
        return Response({
            "success": True,
            "users": [
                {
                    "id": str(user.id), "name": user.name, "email": user.email,
                    "is_active": user.is_active, "created_at": user.created_at,
                    "last_login_at": user.last_login_at,
                }
                for user in users
            ],
        })


class ApplicationActivityView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, application_id):
        application = Application.objects.filter(id=application_id, owner=request.user).first()
        if not application:
            return Response({"success": False, "message": "Application not found."}, status=status.HTTP_404_NOT_FOUND)

        activities = AuthenticationActivity.objects.filter(application=application).select_related("user")
        return Response({
            "success": True,
            "activity": [
                {
                    "id": str(activity.id), "event": activity.event,
                    "status": "success" if activity.event in SUCCESS_EVENTS or activity.event == "otp_sent" else "failed",
                    "title": EVENT_TITLES[activity.event],
                    "user": activity.user.email if activity.user else activity.detail or "Unknown user",
                    "created_at": activity.created_at,
                }
                for activity in activities
            ],
        })


class CreateAPIKeyView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, application_id):
        serializer = CreateAPIKeySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        application = Application.objects.filter(id=application_id, owner=request.user).first()
        if not application:
            return Response(
                {"success": False, "message": "Application not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        api_key, raw_key = generate_api_key(application)
        api_key.name = serializer.validated_data["name"]
        api_key.save(update_fields=["name"])

        return Response(
            {
                "success": True,
                "message": "API key created successfully.",
                "api_key": {
                    "id": str(api_key.id),
                    "name": api_key.name,
                    "key": raw_key,
                    "key_prefix": api_key.key_prefix,
                    "created_at": api_key.created_at,
                },
            },
            status=status.HTTP_201_CREATED,
        )

    def get(self, request, application_id):
        application = Application.objects.filter(id=application_id, owner=request.user).first()
        if not application:
            return Response({"success": False, "message": "Application not found."}, status=status.HTTP_404_NOT_FOUND)
        keys = application.api_keys.order_by("-created_at")
        return Response({"success": True, "api_keys": APIKeySerializer(keys, many=True).data})


class APIKeyDetailView(APIView):

    permission_classes = [IsAuthenticated]

    def delete(self, request, application_id, key_id):
        api_key = APIKey.objects.filter(
            id=key_id, application_id=application_id, application__owner=request.user
        ).first()
        if not api_key:
            return Response({"success": False, "message": "API key not found."}, status=status.HTTP_404_NOT_FOUND)
        api_key.revoked = True
        api_key.save(update_fields=["revoked"])
        return Response(status=status.HTTP_204_NO_CONTENT)
