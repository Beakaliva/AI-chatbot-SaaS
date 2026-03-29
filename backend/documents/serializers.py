from rest_framework import serializers
from .models import Document


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Document
        fields = ["id", "filename", "file", "status", "created_at"]
        read_only_fields = ["id", "filename", "status", "content", "created_at"]


class DocumentUploadSerializer(serializers.Serializer):
    file = serializers.FileField()

    def validate_file(self, value):
        if not value.name.endswith(".pdf"):
            raise serializers.ValidationError("Seuls les fichiers PDF sont acceptés.")
        if value.size > 10 * 1024 * 1024:  # 10 MB max
            raise serializers.ValidationError("Fichier trop volumineux. Maximum 10 MB.")
        return value