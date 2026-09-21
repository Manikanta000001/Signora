import hashlib
import secrets
from django.utils import timezone

from .models import APIKey


def generate_api_key(application):
    """
    Generate a secure API key for an application.
    """

    environment_prefix = (
        "live"
        if application.environment == "production"
        else "test"
    )

    random_secret = secrets.token_urlsafe(32)

    raw_key = (
        f"ak_{environment_prefix}_{random_secret}"
    )

    key_prefix = raw_key[:12]

    key_hash = hashlib.sha256(
        raw_key.encode()
    ).hexdigest()

    api_key = APIKey.objects.create(
        application=application,
        name="Default API Key",
        key_prefix=key_prefix,
        key_hash=key_hash,
    )

    return api_key, raw_key


def get_application_for_api_key(raw_key):
    """Return the active application associated with an API key, if valid."""
    if not raw_key:
        return None

    key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
    api_key = (
        APIKey.objects.select_related("application")
        .filter(key_hash=key_hash, revoked=False)
        .first()
    )
    if not api_key:
        return None

    api_key.last_used_at = timezone.now()
    api_key.save(update_fields=["last_used_at"])
    return api_key.application
