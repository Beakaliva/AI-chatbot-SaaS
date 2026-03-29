from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display  = ["email", "name", "plan", "is_active", "created_at"]
    list_filter   = ["plan", "is_active"]
    search_fields = ["email", "name"]
    ordering      = ["-created_at"]

    # ✅ api_key en readonly car editable=False
    readonly_fields = ["api_key", "created_at"]

    fieldsets = (
        (None,          {"fields": ("email", "password")}),
        ("Infos",       {"fields": ("name", "plan", "api_key")}),  # ✅ OK car readonly
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser")}),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields":  ("email", "name", "password1", "password2"),
        }),
    )