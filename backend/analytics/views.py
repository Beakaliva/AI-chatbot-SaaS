from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta

from bots.models import Bot
from conversations.models import Conversation, Message


class BotStatsView(APIView):
    """Stats complètes d'un bot spécifique."""
    permission_classes = [IsAuthenticated]

    def get(self, request, bot_id):
        bot  = get_object_or_404(Bot, id=bot_id, user=request.user)
        now  = timezone.now()
        last_30_days = now - timedelta(days=30)
        last_7_days  = now - timedelta(days=7)

        # ✅ Conversations
        total_convs  = Conversation.objects.filter(bot=bot).count()
        convs_30days = Conversation.objects.filter(bot=bot, created_at__gte=last_30_days).count()
        convs_7days  = Conversation.objects.filter(bot=bot, created_at__gte=last_7_days).count()

        # ✅ Messages
        total_messages = Message.objects.filter(conversation__bot=bot).count()
        user_messages  = Message.objects.filter(conversation__bot=bot, role="user").count()
        ai_messages    = Message.objects.filter(conversation__bot=bot, role="assistant").count()

        # ✅ Feedbacks
        likes    = Message.objects.filter(conversation__bot=bot, feedback="like").count()
        dislikes = Message.objects.filter(conversation__bot=bot, feedback="dislike").count()

        # ✅ Conversations par jour (7 derniers jours)
        daily_stats = []
        for i in range(6, -1, -1):
            day       = now - timedelta(days=i)
            day_start = day.replace(hour=0, minute=0, second=0)
            day_end   = day.replace(hour=23, minute=59, second=59)
            count     = Conversation.objects.filter(
                bot        = bot,
                created_at__range = [day_start, day_end]
            ).count()
            daily_stats.append({
                "date":  day.strftime("%d/%m"),
                "count": count
            })

        return Response({
            "bot": {
                "id":    str(bot.id),
                "name":  bot.name,
                "model": bot.model,
            },
            "conversations": {
                "total":     total_convs,
                "last_30d":  convs_30days,
                "last_7d":   convs_7days,
                "daily":     daily_stats,
            },
            "messages": {
                "total":     total_messages,
                "from_user": user_messages,
                "from_ai":   ai_messages,
            },
            "feedback": {
                "likes":      likes,
                "dislikes":   dislikes,
                "score":      round((likes / (likes + dislikes) * 100), 1) if (likes + dislikes) > 0 else None,
            }
        })


class GlobalStatsView(APIView):
    """Stats globales de tous les bots d'un utilisateur."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        bots = Bot.objects.filter(user=request.user)

        total_bots  = bots.count()
        active_bots = bots.filter(is_active=True).count()

        total_convs    = Conversation.objects.filter(bot__user=request.user).count()
        total_messages = Message.objects.filter(conversation__bot__user=request.user).count()
        total_likes    = Message.objects.filter(conversation__bot__user=request.user, feedback="like").count()
        total_dislikes = Message.objects.filter(conversation__bot__user=request.user, feedback="dislike").count()
        total_docs     = sum(bot.documents.filter(status="done").count() for bot in bots)

        # ✅ Stats par bot
        bots_summary = []
        for bot in bots:
            convs = Conversation.objects.filter(bot=bot).count()
            msgs  = Message.objects.filter(conversation__bot=bot).count()
            bots_summary.append({
                "id":            str(bot.id),
                "name":          bot.name,
                "model":         bot.model,
                "is_active":     bot.is_active,
                "conversations": convs,
                "messages":      msgs,
            })

        return Response({
            "plan": request.user.plan,
            "bots": {
                "total":  total_bots,
                "active": active_bots,
                "limit":  {"free": 1, "pro": 5, "business": 999}.get(request.user.plan),
            },
            "conversations":  total_convs,
            "messages":       total_messages,
            "documents":      total_docs,
            "feedback": {
                "likes":    total_likes,
                "dislikes": total_dislikes,
            },
            "bots_summary": bots_summary,
        })