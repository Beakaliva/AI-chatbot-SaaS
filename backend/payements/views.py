import os
import uuid
import hmac
import hashlib
import requests
import stripe
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import Subscription
from .utils import PLAN_PRICES, get_expiry_date, activate_user_plan

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")


# ─────────────────────────────────────────────
#  STRIPE
# ─────────────────────────────────────────────

class StripeCheckoutView(APIView):
    """Crée une session de paiement Stripe."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        plan = request.data.get("plan")

        if plan not in PLAN_PRICES:
            return Response(
                {"error": "Plan invalide. Choisissez 'pro' ou 'business'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        price_usd = PLAN_PRICES[plan]["usd"]

        try:
            session = stripe.checkout.Session.create(
                payment_method_types = ["card"],
                mode                 = "payment",
                customer_email       = request.user.email,
                line_items           = [{
                    "price_data": {
                        "currency":     "usd",
                        "unit_amount":  int(price_usd * 100),
                        "product_data": {
                            "name": f"ChatFlow — Plan {plan.capitalize()}",
                        },
                    },
                    "quantity": 1,
                }],
                metadata = {
                    "user_id": str(request.user.id),
                    "plan":    plan,
                },
                success_url = os.getenv("FRONTEND_URL") + "/dashboard?payment=success",
                cancel_url  = os.getenv("FRONTEND_URL") + "/pricing?payment=canceled",
            )

            Subscription.objects.create(
                user         = request.user,
                plan         = plan,
                status       = "pending",
                provider     = "stripe",
                provider_ref = session.id,
                amount       = price_usd,
                currency     = "USD",
            )

            return Response({"checkout_url": session.url})

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class StripeWebhookView(APIView):
    """Webhook Stripe — appelé automatiquement après paiement."""
    permission_classes = [AllowAny]

    def post(self, request):
        payload    = request.body
        sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")
        secret     = os.getenv("STRIPE_WEBHOOK_SECRET")

        try:
            event = stripe.Webhook.construct_event(payload, sig_header, secret)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        if event["type"] == "checkout.session.completed":
            session = event["data"]["object"]
            plan    = session["metadata"]["plan"]

            sub = Subscription.objects.filter(provider_ref=session["id"]).first()
            if sub:
                sub.status     = "active"
                sub.started_at = timezone.now()
                sub.expires_at = get_expiry_date(plan)
                sub.save()
                activate_user_plan(sub.user, plan)

        return Response({"status": "ok"})


# ─────────────────────────────────────────────
#  ORANGE MONEY
# ─────────────────────────────────────────────

class OrangeMoneyInitView(APIView):
    """Initialise un paiement Orange Money."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        plan  = request.data.get("plan")
        phone = request.data.get("phone")

        if plan not in PLAN_PRICES:
            return Response({"error": "Plan invalide."}, status=status.HTTP_400_BAD_REQUEST)

        if not phone:
            return Response(
                {"error": "Numéro de téléphone Orange Money requis."},
                status=status.HTTP_400_BAD_REQUEST
            )

        amount_gnf = PLAN_PRICES[plan]["gnf"]

        sub = Subscription.objects.create(
            user     = request.user,
            plan     = plan,
            status   = "pending",
            provider = "orange_money",
            amount   = amount_gnf,
            currency = "GNF",
        )

        return Response({
            "message":     "Veuillez effectuer le paiement Orange Money.",
            "amount":      f"{amount_gnf} GNF",
            "plan":        plan,
            "reference":   str(sub.id),
            "instruction": f"Envoyez {amount_gnf} GNF au +224 XXX XXX XXX avec la référence {str(sub.id)[:8].upper()}",
        })


class OrangeMoneyConfirmView(APIView):
    """Confirme manuellement un paiement Orange Money."""
    permission_classes = [IsAuthenticated]

    def post(self, request, sub_id):
        sub = get_object_or_404(
            Subscription,
            id       = sub_id,
            user     = request.user,
            provider = "orange_money",
            status   = "pending"
        )

        sub.status       = "active"
        sub.provider_ref = request.data.get("provider_ref", "")
        sub.started_at   = timezone.now()
        sub.expires_at   = get_expiry_date(sub.plan)
        sub.save()
        activate_user_plan(request.user, sub.plan)

        return Response({
            "message":    f"Paiement confirmé ! Plan {sub.plan.capitalize()} activé.",
            "expires_at": sub.expires_at,
        })


# ─────────────────────────────────────────────
#  PAYDUNYA
# ─────────────────────────────────────────────

PAYDUNYA_BASE = "https://app.paydunya.com/api/v1"

def _paydunya_headers():
    return {
        "PAYDUNYA-MASTER-KEY": os.getenv("PAYDUNYA_MASTER_KEY", ""),
        "PAYDUNYA-PRIVATE-KEY": os.getenv("PAYDUNYA_PRIVATE_KEY", ""),
        "PAYDUNYA-TOKEN": os.getenv("PAYDUNYA_TOKEN", ""),
        "Content-Type": "application/json",
    }


class PayDunyaCheckoutView(APIView):
    """Crée une facture de paiement PayDunya."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        plan = request.data.get("plan")

        if plan not in PLAN_PRICES:
            return Response({"error": "Plan invalide."}, status=status.HTTP_400_BAD_REQUEST)

        amount_gnf = PLAN_PRICES[plan]["gnf"]
        frontend   = os.getenv("FRONTEND_URL", "http://localhost:3000")

        sub = Subscription.objects.create(
            user     = request.user,
            plan     = plan,
            status   = "pending",
            provider = "paydunya",
            amount   = amount_gnf,
            currency = "GNF",
        )

        payload = {
            "invoice": {
                "total_amount": amount_gnf,
                "description":  f"ChatFlow — Plan {plan.capitalize()}",
            },
            "store": {
                "name": "ChatFlow",
            },
            "actions": {
                "cancel_url":  f"{frontend}/pricing?payment=canceled",
                "return_url":  f"{frontend}/dashboard?payment=success",
                "callback_url": os.getenv("BACKEND_URL", "http://localhost:8000") + "/api/payments/paydunya/callback/",
            },
            "custom_data": {
                "sub_id": str(sub.id),
                "plan":   plan,
            },
        }

        try:
            res  = requests.post(f"{PAYDUNYA_BASE}/checkout-invoice/create", json=payload, headers=_paydunya_headers(), timeout=10)
            data = res.json()

            if data.get("response_code") == "00":
                sub.provider_ref = data["token"]
                sub.save()
                return Response({"checkout_url": data["response_text"]})
            else:
                sub.delete()
                return Response({"error": data.get("response_text", "Erreur PayDunya.")}, status=status.HTTP_502_BAD_GATEWAY)

        except Exception as e:
            sub.delete()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PayDunyaCallbackView(APIView):
    """Callback PayDunya après paiement."""
    permission_classes = [AllowAny]

    def post(self, request):
        data   = request.data
        token  = data.get("data", {}).get("invoice", {}).get("token")
        status_val = data.get("data", {}).get("invoice", {}).get("status")

        if token and status_val == "completed":
            sub = Subscription.objects.filter(provider_ref=token, provider="paydunya").first()
            if sub and sub.status == "pending":
                sub.status     = "active"
                sub.started_at = timezone.now()
                sub.expires_at = get_expiry_date(sub.plan)
                sub.save()
                activate_user_plan(sub.user, sub.plan)

        return Response({"status": "ok"})


# ─────────────────────────────────────────────
#  CINETPAY
# ─────────────────────────────────────────────

CINETPAY_BASE = "https://api-checkout.cinetpay.com/v2"


class CinetPayCheckoutView(APIView):
    """Crée un lien de paiement CinetPay."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        plan = request.data.get("plan")

        if plan not in PLAN_PRICES:
            return Response({"error": "Plan invalide."}, status=status.HTTP_400_BAD_REQUEST)

        amount_gnf  = PLAN_PRICES[plan]["gnf"]
        frontend    = os.getenv("FRONTEND_URL", "http://localhost:3000")
        transaction_id = str(uuid.uuid4()).replace("-", "")[:20].upper()

        sub = Subscription.objects.create(
            user         = request.user,
            plan         = plan,
            status       = "pending",
            provider     = "cinetpay",
            provider_ref = transaction_id,
            amount       = amount_gnf,
            currency     = "GNF",
        )

        payload = {
            "apikey":         os.getenv("CINETPAY_API_KEY", ""),
            "site_id":        os.getenv("CINETPAY_SITE_ID", ""),
            "transaction_id": transaction_id,
            "amount":         amount_gnf,
            "currency":       "GNF",
            "description":    f"ChatFlow — Plan {plan.capitalize()}",
            "return_url":     f"{frontend}/dashboard?payment=success",
            "notify_url":     os.getenv("BACKEND_URL", "http://localhost:8000") + "/api/payments/cinetpay/notify/",
            "customer_name":  request.user.name,
            "customer_email": request.user.email,
        }

        try:
            res  = requests.post(f"{CINETPAY_BASE}/payment", json=payload, timeout=10)
            data = res.json()

            if data.get("code") == "201":
                return Response({"checkout_url": data["data"]["payment_url"]})
            else:
                sub.delete()
                return Response({"error": data.get("message", "Erreur CinetPay.")}, status=status.HTTP_502_BAD_GATEWAY)

        except Exception as e:
            sub.delete()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CinetPayNotifyView(APIView):
    """Notification CinetPay après paiement."""
    permission_classes = [AllowAny]

    def post(self, request):
        transaction_id = request.data.get("cpm_trans_id")
        status_val     = request.data.get("cpm_result")

        if transaction_id and status_val == "00":
            sub = Subscription.objects.filter(provider_ref=transaction_id, provider="cinetpay").first()
            if sub and sub.status == "pending":
                sub.status     = "active"
                sub.started_at = timezone.now()
                sub.expires_at = get_expiry_date(sub.plan)
                sub.save()
                activate_user_plan(sub.user, sub.plan)

        return Response({"status": "ok"})


# ─────────────────────────────────────────────
#  HISTORIQUE
# ─────────────────────────────────────────────

class SubscriptionHistoryView(APIView):
    """Historique des abonnements de l'utilisateur."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        subs = Subscription.objects.filter(user=request.user)
        data = [{
            "id":         str(s.id),
            "plan":       s.plan,
            "status":     s.status,
            "provider":   s.provider,
            "amount":     str(s.amount),
            "currency":   s.currency,
            "started_at": s.started_at,
            "expires_at": s.expires_at,
            "created_at": s.created_at,
        } for s in subs]
        return Response(data)
