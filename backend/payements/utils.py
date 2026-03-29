from datetime import timedelta
from django.utils import timezone


# ✅ Prix des plans
PLAN_PRICES = {
    "pro":      {"usd": 9.99,  "gnf": 85000},
    "business": {"usd": 29.99, "gnf": 255000},
}

# ✅ Durée des plans (en jours)
PLAN_DURATION = {
    "pro":      30,
    "business": 30,
}


def get_expiry_date(plan):
    days = PLAN_DURATION.get(plan, 30)
    return timezone.now() + timedelta(days=days)


def activate_user_plan(user, plan):
    """Met à jour le plan de l'utilisateur."""
    user.plan = plan
    user.save()