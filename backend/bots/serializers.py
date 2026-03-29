from rest_framework import serializers
from .models import Bot


class BotSerializer(serializers.ModelSerializer):
    widget_snippet = serializers.SerializerMethodField()

    class Meta:
        model  = Bot
        fields = [
            "id", "name", "model", "system_prompt",
            "language", "color", "logo", "widget_key",
            "is_active", "created_at", "widget_snippet"
        ]
        read_only_fields = ["id", "widget_key", "created_at", "widget_snippet"]

    def get_widget_snippet(self, obj):
        # ✅ Code JS à copier-coller sur n'importe quel site
        return f'<script src="http://localhost:8000/widget.js" data-bot="{obj.widget_key}"></script>'