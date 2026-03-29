import pdfplumber


def extract_text_from_pdf(file_path):
    """Extrait tout le texte d'un fichier PDF page par page."""
    text = ""
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        raise ValueError(f"Erreur lors de l'extraction PDF : {str(e)}")
    return text.strip()


def truncate_context(text, max_chars=3000):
    """Limite le texte injecté dans le prompt IA."""
    if len(text) > max_chars:
        return text[:max_chars] + "\n...[texte tronqué]"
    return text