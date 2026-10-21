from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, OneTimePasscode, Invitation


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User

    list_display = ("email_address", "first_name", "last_name", "phone_number", "is_active", "is_verified", "is_staff", "is_superuser")
    list_filter = ("is_active", "is_verified", "is_staff", "is_superuser")

    search_fields = ("first_name", "last_name", "email_address", "phone_number")

    ordering = ("email_address",)

    fieldsets = (
        (None, {"fields": ("first_name", "last_name", "email_address", "password", "phone_number", "profile_picture")}),
        ("Permissions", {"fields": ("is_active", "is_verified", "is_staff", "is_superuser", "groups", "user_permissions")}),
    )

    readonly_fields = ("last_login", "email_address")

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("first_name", "last_name", "email_address", "phone_number", "profile_picture", "password1", "password2", "is_staff", "is_superuser", "is_verified", "is_active"),
            },
        ),
    )

admin.site.register(Invitation)
admin.site.register(OneTimePasscode)