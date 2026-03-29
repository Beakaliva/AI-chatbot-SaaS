from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404

from bots.models import Bot
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer
from .utils import get_ai_response


class StartConversationView(APIView):
    """
    Démarre une nouvelle conversation via widget_key.
    Accessible sans authentification (visiteurs du site client).
    """
    permission_classes = [AllowAny]

    def post(self, request, widget_key):
        bot  = get_object_or_404(Bot, widget_key=widget_key, is_active=True)
        conv = Conversation.objects.create(bot=bot)
        return Response(ConversationSerializer(conv).data, status=status.HTTP_201_CREATED)


class SendMessageView(APIView):
    """
    Envoie un message et reçoit la réponse de l'IA.
    Accessible sans authentification (visiteurs).
    """
    permission_classes = [AllowAny]

    def post(self, request, conversation_id):
        conv         = get_object_or_404(Conversation, id=conversation_id)
        user_message = request.data.get("message", "").strip()

        if not user_message:
            return Response(
                {"error": "Le message ne peut pas être vide."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ✅ Sauvegarder le message utilisateur
        Message.objects.create(
            conversation = conv,
            role         = "user",
            content      = user_message
        )

        # ✅ Appeler l'IA (Claude ou GPT)
        try:
            ai_reply = get_ai_response(conv.bot, conv, user_message)
        except Exception as e:
            return Response(
                {"error": f"Erreur IA : {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # ✅ Sauvegarder la réponse de l'IA
        assistant_msg = Message.objects.create(
            conversation = conv,
            role         = "assistant",
            content      = ai_reply
        )

        return Response(MessageSerializer(assistant_msg).data, status=status.HTTP_200_OK)


class FeedbackView(APIView):
    """Enregistre le feedback 👍 / 👎 sur un message."""
    permission_classes = [AllowAny]

    def patch(self, request, message_id):
        msg      = get_object_or_404(Message, id=message_id)
        feedback = request.data.get("feedback")

        if feedback not in ["like", "dislike"]:
            return Response(
                {"error": "Feedback invalide. Utilisez 'like' ou 'dislike'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        msg.feedback = feedback
        msg.save()
        return Response({"message": "Feedback enregistré.", "feedback": feedback})


class ConversationHistoryView(APIView):
    """Historique des conversations d'un bot (dashboard client)."""
    permission_classes = [IsAuthenticated]

    def get(self, request, bot_id):
        bot   = get_object_or_404(Bot, id=bot_id, user=request.user)
        convs = Conversation.objects.filter(bot=bot)
        return Response(ConversationSerializer(convs, many=True).data)