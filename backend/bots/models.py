import uuid
from django.db import models
from django.conf import settings

class Bot(models.Model):

    MODEL_CHOICES = [
        ("claude", "Claude (Anthropic)"),
        ("gpt",    "GPT (OpenAI)"),
    ]

    LANG_CHOICES = [
        ("fr", "Français"),
        ("en", "English"),
        ("so", "Soussou"),
        ("pu", "Pular"),
        ("ma", "Malinké"),
    ]

    id            = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user          = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="bots")
    name          = models.CharField(max_length=100)
    model         = models.CharField(max_length=20, choices=MODEL_CHOICES, default="claude")
    system_prompt = models.TextField(blank=True, default="Tu es un assistant utile et professionnel.")
    language      = models.CharField(max_length=5, choices=LANG_CHOICES, default="fr")
    color         = models.CharField(max_length=7, default="#6366f1")   # couleur hex
    logo          = models.ImageField(upload_to="bot_logos/", null=True, blank=True)
    widget_key    = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    is_active     = models.BooleanField(default=True)
    created_at    = models.DateTimeField(auto_now_add=True)
    updated_at    = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.user.email})"