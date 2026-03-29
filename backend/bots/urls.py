from django.urls import path
from .views import BotListCreateView, BotDetailView, BotPublicView  

urlpatterns = [
    path("",          BotListCreateView.as_view()),  # GET liste / POST créer
    path("<uuid:bot_id>/", BotDetailView.as_view()), # GET / PATCH / DELETE un bot
    path("public/<uuid:widget_key>/", BotPublicView.as_view()), # ✅ nouveau
]