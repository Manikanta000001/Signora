import uuid
from django.db import models
from applications.models import Application


class EndUser(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    application = models.ForeignKey(
        Application,
        on_delete=models.CASCADE,
        related_name="users"
    )

    email = models.EmailField()

    name = models.CharField(
        max_length=150,
        blank=True
    )

    is_active = models.BooleanField(
        default=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    last_login_at = models.DateTimeField(
        blank=True,
        null=True
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["application", "email"],
                name="unique_user_per_application"
            )
        ]

    def __str__(self):
        return self.email
    
class OTP(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    user = models.ForeignKey(
        EndUser,
        on_delete=models.CASCADE,
        related_name="otps"
    )

    code_hash = models.CharField(
        max_length=128
    )

    expires_at = models.DateTimeField()

    attempts = models.PositiveIntegerField(
        default=0
    )

    is_used = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )


class AuthenticationActivity(models.Model):
    EVENT_CHOICES = [
        ("otp_sent", "OTP sent"),
        ("otp_verified", "OTP verified"),
        ("otp_failed", "OTP verification failed"),
        ("oauth_succeeded", "OAuth login succeeded"),
        ("oauth_failed", "OAuth login failed"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name="authentication_activities")
    user = models.ForeignKey(EndUser, on_delete=models.SET_NULL, null=True, blank=True, related_name="authentication_activities")
    event = models.CharField(max_length=32, choices=EVENT_CHOICES)
    detail = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return f"{self.application}: {self.event}"


class OAuthState(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name="oauth_states")
    provider = models.CharField(max_length=16)
    nonce = models.CharField(max_length=64, unique=True)
    expires_at = models.DateTimeField()
    used_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class OAuthLoginExchange(models.Model):
    """Short-lived, single-use handoff from provider callback to the SPA."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name="oauth_login_exchanges")
    user = models.ForeignKey(EndUser, on_delete=models.CASCADE, related_name="oauth_login_exchanges")
    provider = models.CharField(max_length=16)
    code_hash = models.CharField(max_length=64, unique=True)
    expires_at = models.DateTimeField()
    used_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
