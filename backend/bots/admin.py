from django.contrib import admin
from .models import Bot

@admin.register(Bot)
class BotAdmin(admin.ModelAdmin):
    list_display  = ["name", "user", "model", "language", "is_active", "created_at"]
    list_filter   = ["model", "language", "is_active"]
    search_fields = ["name", "user__email"]
    readonly_fields = ["widget_key", "created_at", "updated_at"]