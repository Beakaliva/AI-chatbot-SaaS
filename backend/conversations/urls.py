from django.urls import path
from .views import (
    StartConversationView,
    SendMessageView,
    FeedbackView,
    ConversationHistoryView
)

urlpatterns = [
    # Widget (sans auth)
    path("start/<uuid:widget_key>/",       StartConversationView.as_view()),
    path("chat/<uuid:conversation_id>/",   SendMessageView.as_view()),
    path("feedback/<uuid:message_id>/",    FeedbackView.as_view()),

    # Dashboard (avec auth)
    path("history/<uuid:bot_id>/",         ConversationHistoryView.as_view()),
]