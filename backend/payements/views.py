import os
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
                payement_method_types = ["card"],
                mode                 = "payement",
                customer_email       = request.user.email,
                line_items           = [{
                    "price_data": {
                        "currency":     "usd",
                        "unit_amount":  int(price_usd * 100),  # en centimes
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
                success_url = os.getenv("FRONTEND_URL") + "/dashboard?payement=success",
                cancel_url  = os.getenv("FRONTEND_URL") + "/pricing?payement=canceled",
            )

            # ✅ Créer l'abonnement en attente
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
            session  = event["data"]["object"]
            user_id  = session["metadata"]["user_id"]
            plan     = session["metadata"]["plan"]

            # ✅ Activer l'abonnement
            sub = Subscription.objects.filter(
                provider_ref = session["id"]
            ).first()

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
        phone = request.data.get("phone")  # ex: 622000000

        if plan not in PLAN_PRICES:
            return Response(
                {"error": "Plan invalide."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not phone:
            return Response(
                {"error": "Numéro de téléphone Orange Money requis."},
                status=status.HTTP_400_BAD_REQUEST
            )

        amount_gnf = PLAN_PRICES[plan]["gnf"]

        # ✅ Créer l'abonnement en attente
        sub = Subscription.objects.create(
            user     = request.user,
            plan     = plan,
            status   = "pending",
            provider = "orange_money",
            amount   = amount_gnf,
            currency = "GNF",
        )

        # ℹ️ Ici tu intègres l'API Orange Money Guinée
        # Pour l'instant on retourne les infos de paiement manuel
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

        provider_ref = request.data.get("provider_ref", "")  # code de transaction OM

        sub.status       = "active"
        sub.provider_ref = provider_ref
        sub.started_at   = timezone.now()
        sub.expires_at   = get_expiry_date(sub.plan)
        sub.save()

        activate_user_plan(request.user, sub.plan)

        return Response({
            "message": f"Paiement confirmé ! Plan {sub.plan.capitalize()} activé.",
            "expires_at": sub.expires_at,
        })


# ─────────────────────────────────────────────
#  HISTORIQUE
# ─────────────────────────────────────────────

class SubscriptionHistoryView(APIView):
    """Historique des abonnements de l'utilisateur."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        subs = Subscription.objects.filter(user=request.user)
        data = [{
            "id":           str(s.id),
            "plan":         s.plan,
            "status":       s.status,
            "provider":     s.provider,
            "amount":       str(s.amount),
            "currency":     s.currency,
            "started_at":   s.started_at,
            "expires_at":   s.expires_at,
            "created_at":   s.created_at,
        } for s in subs]
        return Response(data)