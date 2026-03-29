from django.contrib import admin
from .models import Document

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display  = ["filename", "bot", "status", "created_at"]
    list_filter   = ["status"]
    search_fields = ["filename", "bot__name"]
    readonly_fields = ["content", "created_at"]