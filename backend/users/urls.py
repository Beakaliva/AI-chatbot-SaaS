from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, MeView

urlpatterns = [
    path("register/", RegisterView.as_view()),   # POST → créer un compte
    path("login/",    TokenObtainPairView.as_view()),  # POST → obtenir access + refresh
    path("refresh/",  TokenRefreshView.as_view()),     # POST → renouveler le token
    path("me/",       MeView.as_view()),               # GET/PATCH → profil connecté
]