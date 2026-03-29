from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404

from .models import Bot
from .serializers import BotSerializer

class BotListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        bots = Bot.objects.filter(user=request.user)
        return Response(BotSerializer(bots, many=True).data)

    def post(self, request):
        # ✅ Vérifier la limite selon le plan
        plan  = request.user.plan
        count = Bot.objects.filter(user=request.user).count()

        limits = {"free": 1, "pro": 5, "business": 999}
        if count >= limits.get(plan, 1):
            return Response(
                {"error": f"Limite atteinte pour le plan {plan}. Passez à un plan supérieur."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = BotSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BotDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_bot(self, request, bot_id):
        return get_object_or_404(Bot, id=bot_id, user=request.user)

    def get(self, request, bot_id):
        bot = self.get_bot(request, bot_id)
        return Response(BotSerializer(bot).data)

    def patch(self, request, bot_id):
        bot = self.get_bot(request, bot_id)
        serializer = BotSerializer(bot, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, bot_id):
        bot = self.get_bot(request, bot_id)
        bot.delete()
        return Response({"message": "Bot supprimé avec succès."}, status=status.HTTP_204_NO_CONTENT)

class BotPublicView(APIView):
    """Vue publique pour le widget — pas d'auth requise."""
    permission_classes = [AllowAny]

    def get(self, request, widget_key):
        bot = get_object_or_404(Bot, widget_key=widget_key, is_active=True)
        return Response({
            "name":  bot.name,
            "model": bot.model,
            "color": bot.color,
            "language": bot.language,
        })
        
