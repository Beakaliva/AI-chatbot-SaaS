from django.urls import path
from .views import BotStatsView, GlobalStatsView

urlpatterns = [
    path("",              GlobalStatsView.as_view()),       # Stats globales
    path("<uuid:bot_id>/", BotStatsView.as_view()),         # Stats d'un bot
]