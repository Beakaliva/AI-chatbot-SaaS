from django.contrib import admin
from .models import Conversation, Message


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display  = ["session_id", "bot", "created_at"]
    list_filter   = ["bot"]
    search_fields = ["session_id", "bot__name"]
    readonly_fields = ["session_id", "created_at"]


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display  = ["role", "content", "feedback", "created_at"]
    list_filter   = ["role", "feedback"]
    readonly_fields = ["created_at"]