import uuid
from django.db import models
from bots.models import Bot


class Document(models.Model):

    STATUS_CHOICES = [
        ("pending",    "En attente"),
        ("processing", "En cours"),
        ("done",       "Traité"),
        ("error",      "Erreur"),
    ]

    SOURCE_CHOICES = [
        ("pdf", "PDF"),
        ("url", "Site Web"),
    ]

    id         = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    bot        = models.ForeignKey(Bot, on_delete=models.CASCADE, related_name="documents")
    filename   = models.CharField(max_length=255)
    file       = models.FileField(upload_to="documents/")
    content    = models.TextField(blank=True)   # ✅ texte extrait du PDF
    status     = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)
    source   = models.CharField(max_length=10, choices=SOURCE_CHOICES, default="pdf")
    source_url = models.URLField(blank=True, null=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.filename} → {self.bot.name}"