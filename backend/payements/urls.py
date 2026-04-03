from django.urls import path
from .views import (
    StripeCheckoutView,
    StripeWebhookView,
    OrangeMoneyInitView,
    OrangeMoneyConfirmView,
    PayDunyaCheckoutView,
    PayDunyaCallbackView,
    CinetPayCheckoutView,
    CinetPayNotifyView,
    SubscriptionHistoryView,
)

urlpatterns = [
    # Stripe
    path("stripe/checkout/",               StripeCheckoutView.as_view()),
    path("stripe/webhook/",                StripeWebhookView.as_view()),

    # Orange Money
    path("orange/init/",                   OrangeMoneyInitView.as_view()),
    path("orange/confirm/<uuid:sub_id>/",  OrangeMoneyConfirmView.as_view()),

    # PayDunya
    path("paydunya/checkout/",             PayDunyaCheckoutView.as_view()),
    path("paydunya/callback/",             PayDunyaCallbackView.as_view()),

    # CinetPay
    path("cinetpay/checkout/",             CinetPayCheckoutView.as_view()),
    path("cinetpay/notify/",               CinetPayNotifyView.as_view()),

    # Historique
    path("history/",                       SubscriptionHistoryView.as_view()),
]
