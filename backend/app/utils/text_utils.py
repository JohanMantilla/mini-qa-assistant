import re

def clean_text(text: str) -> str:

    text = text.replace('\n', ' ').replace('\r', ' ').replace('\t', ' ')
    text = re.sub(r'[^\w\s.,;:!?¿¡\-()áéíóúñÁÉÍÓÚÑüÜ]', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()