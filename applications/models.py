import uuid
from django.conf import settings
from django.db import models


class Application(models.Model):

    ENVIRONMENT_CHOICES = [
        ("development", "Development"),
        ("production", "Production"),
    ]

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="applications"
    )

    name = models.CharField(max_length=100)

    website_url = models.URLField(
        blank=True,
        null=True
    )

    environment = models.CharField(
        max_length=20,
        choices=ENVIRONMENT_CHOICES,
        default="development"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return self.name
    
class APIKey(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    application = models.ForeignKey(
        Application,
        on_delete=models.CASCADE,
        related_name="api_keys"
    )

    name = models.CharField(
        max_length=100
    )

    key_prefix = models.CharField(
        max_length=20
    )

    key_hash = models.CharField(
        max_length=255,
        unique=True
    )

    last_used_at = models.DateTimeField(
        blank=True,
        null=True
    )

    revoked = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.name