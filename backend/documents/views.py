from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from bots.models import Bot
from .models import Document
from .serializers import DocumentSerializer, DocumentUploadSerializer
from .utils import extract_text_from_pdf


class DocumentListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get_bot(self, request, bot_id):
        return get_object_or_404(Bot, id=bot_id, user=request.user)

    def get(self, request, bot_id):
        """Liste tous les documents d'un bot."""
        bot  = self.get_bot(request, bot_id)
        docs = Document.objects.filter(bot=bot)
        return Response(DocumentSerializer(docs, many=True).data)

    def post(self, request, bot_id):
        """Upload un PDF et extrait son texte automatiquement."""
        bot        = self.get_bot(request, bot_id)
        serializer = DocumentUploadSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        file     = serializer.validated_data["file"]
        filename = file.name

        # ✅ Créer le document en base
        doc = Document.objects.create(
            bot      = bot,
            filename = filename,
            file     = file,
            status   = "processing"
        )

        # ✅ Extraire le texte du PDF
        try:
            text       = extract_text_from_pdf(doc.file.path)
            doc.content = text
            doc.status  = "done"
        except Exception as e:
            doc.status = "error"
            doc.save()
            return Response(
                {"error": f"Extraction échouée : {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        doc.save()
        return Response(DocumentSerializer(doc).data, status=status.HTTP_201_CREATED)


class DocumentDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, bot_id, doc_id):
        bot = get_object_or_404(Bot, id=bot_id, user=request.user)
        doc = get_object_or_404(Document, id=doc_id, bot=bot)
        doc.file.delete(save=False)  # ✅ supprime aussi le fichier physique
        doc.delete()
        return Response({"message": "Document supprimé."}, status=status.HTTP_204_NO_CONTENT)