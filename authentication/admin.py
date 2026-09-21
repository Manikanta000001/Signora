from django.contrib import admin
from .models import AuthenticationActivity, EndUser, OTP


@admin.register(EndUser)
class EndUserAdmin(admin.ModelAdmin):
    list_display = (
        "email",
        "name",
        "application",
        "is_active",
        "last_login_at",
        "created_at",
    )

    list_filter = (
        "is_active",
        "created_at",
    )

    search_fields = (
        "email",
        "name",
        "application__name",
    )


@admin.register(OTP)
class OTPAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "expires_at",
        "attempts",
        "is_used",
        "created_at",
    )

    list_filter = (
        "is_used",
        "created_at",
    )

    search_fields = (
        "user__email",
    )

    readonly_fields = (
        "code_hash",
        "created_at",
    )


@admin.register(AuthenticationActivity)
class AuthenticationActivityAdmin(admin.ModelAdmin):
    list_display = ("application", "user", "event", "created_at")
    list_filter = ("event", "created_at")
    search_fields = ("application__name", "user__email", "detail")
    readonly_fields = ("application", "user", "event", "detail", "created_at")
