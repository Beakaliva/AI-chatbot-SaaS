from django.contrib import admin
from .models import Subscription

@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display  = ["user", "plan", "status", "provider", "amount", "currency", "expires_at"]
    list_filter   = ["plan", "status", "provider"]
    search_fields = ["user__email", "provider_ref"]
    readonly_fields = ["created_at", "started_at"]