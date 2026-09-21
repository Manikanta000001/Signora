from django.contrib import admin
from .models import Application, APIKey


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "owner",
        "environment",
        "created_at",
        "updated_at",
    )

    list_filter = (
        "environment",
        "created_at",
    )

    search_fields = (
        "name",
        "owner__username",
        "owner__email",
    )


@admin.register(APIKey)
class APIKeyAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "application",
        "key_prefix",
        "revoked",
        "last_used_at",
        "created_at",
    )

    list_filter = (
        "revoked",
        "created_at",
    )

    search_fields = (
        "name",
        "key_prefix",
        "application__name",
    )

    readonly_fields = (
        "key_hash",
        "last_used_at",
        "created_at",
    )