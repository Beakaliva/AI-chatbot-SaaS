import uuid
from django.db import models
from django.conf import settings


class Subscription(models.Model):

    PLAN_CHOICES = [
        ("free",     "Free"),
        ("pro",      "Pro"),
        ("business", "Business"),
    ]

    STATUS_CHOICES = [
        ("active",   "Actif"),
        ("expired",  "Expiré"),
        ("canceled", "Annulé"),
        ("pending",  "En attente"),
    ]

    PROVIDER_CHOICES = [
        ("stripe",       "Stripe"),
        ("orange_money", "Orange Money"),
        ("paydunya",     "PayDunya"),
        ("cinetpay",     "CinetPay"),
    ]

    id               = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user             = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="subscriptions")
    plan             = models.CharField(max_length=20, choices=PLAN_CHOICES)
    status           = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    provider         = models.CharField(max_length=20, choices=PROVIDER_CHOICES)
    provider_ref     = models.CharField(max_length=255, blank=True)  # ID Stripe ou ref Orange Money
    amount           = models.DecimalField(max_digits=10, decimal_places=2)
    currency         = models.CharField(max_length=10, default="USD")
    started_at       = models.DateTimeField(null=True, blank=True)
    expires_at       = models.DateTimeField(null=True, blank=True)
    created_at       = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.email} → {self.plan} ({self.status})"