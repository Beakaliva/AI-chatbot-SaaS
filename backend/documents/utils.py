import pdfplumber

import requests
from bs4 import BeautifulSoup

def extract_text_from_url(url: str, max_chars: int = 5000) -> str:
    """Scrape un site web et extrait le texte."""
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (compatible; ChatFlow/1.0)"
        }
        res  = requests.get(url, headers=headers, timeout=10)
        res.raise_for_status()

        soup = BeautifulSoup(res.content, "html.parser")

        # Supprimer scripts, styles, nav, footer
        for tag in soup(["script", "style", "nav", "footer", "header", "aside"]):
            tag.decompose()

        # Extraire le texte propre
        text = soup.get_text(separator="\n", strip=True)

        # Nettoyer les lignes vides multiples
        lines = [l.strip() for l in text.splitlines() if l.strip()]
        text  = "\n".join(lines)

        return text[:max_chars]

    except Exception as e:
        raise ValueError(f"Impossible de scraper {url} : {str(e)}")


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