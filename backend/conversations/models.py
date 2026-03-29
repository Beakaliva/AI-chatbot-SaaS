import uuid
from django.db import models
from bots.models import Bot


class Conversation(models.Model):
    id         = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    bot        = models.ForeignKey(Bot, on_delete=models.CASCADE, related_name="conversations")
    session_id = models.UUIDField(default=uuid.uuid4, editable=False)  # visiteur unique
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Conv {self.session_id} → {self.bot.name}"


class Message(models.Model):

    ROLE_CHOICES = [
        ("user",      "Utilisateur"),
        ("assistant", "Assistant"),
    ]

    FEEDBACK_CHOICES = [
        ("like",    "👍"),
        ("dislike", "👎"),
        (None,      "Aucun"),
    ]

    id           = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name="messages")
    role         = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content      = models.TextField()
    feedback     = models.CharField(max_length=10, null=True, blank=True, choices=FEEDBACK_CHOICES)
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"[{self.role}] {self.content[:50]}"