from django.urls import path
from .views import DocumentListCreateView, DocumentDeleteView, URLScrapeView

urlpatterns = [
    path("<uuid:bot_id>/",              DocumentListCreateView.as_view()),  # GET / POST
    path("<uuid:bot_id>/<uuid:doc_id>/", DocumentDeleteView.as_view()),     # DELETE
    path("<uuid:bot_id>/scrape/",        URLScrapeView.as_view()),  # ✅ nouveau
]