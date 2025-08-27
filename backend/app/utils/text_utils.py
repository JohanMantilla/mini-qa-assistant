import re
from typing import List

def clean_text(text: str) -> str:
    text = text.replace('\n', ' ').replace('\r', ' ').replace('\t', ' ')
    text = re.sub(r'[^\w\s.,;:!?¿¡\-()áéíóúñÁÉÍÓÚÑüÜ]', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def split_into_chunks(text: str, chunk_size: int = 500, overlap: int = 150) -> List[str]:

    if not text:
        return []

    sentence_pattern = re.compile(r'(?<=[.!?])\s+')
    sentences = sentence_pattern.split(text)
    chunks = []
    current_chunk = ""
    i = 0

    while i < len(sentences):
        sentence = sentences[i].strip()
        if not sentence:
            i += 1
            continue

        if len(current_chunk) + len(sentence) + 1 > chunk_size:
            if current_chunk:
                chunks.append(current_chunk.strip())
            if overlap > 0 and chunks:
                overlap_sentences = []
                chunk_sentences = sentence_pattern.split(chunks[-1])
                total = 0
                for s in reversed(chunk_sentences):
                    total += len(s) + 1
                    overlap_sentences.insert(0, s)
                    if total >= overlap:
                        break
                current_chunk = " ".join(overlap_sentences)
            else:
                current_chunk = ""
        if current_chunk:
            current_chunk += " " + sentence
        else:
            current_chunk = sentence
        i += 1

    if current_chunk and len(current_chunk) > 30:
        chunks.append(current_chunk.strip())

    return chunks

def extract_sentences(text: str, num_sentences: int = 3) -> str:
    if not text:
        return ""
    sentence_endings = re.compile(r'[.!?]\s+')
    
    parts = sentence_endings.split(text)
    sentences = []
    for i, part in enumerate(parts[:num_sentences]):
        part = part.strip()
        if part:
            if not part[-1] in '.!?':
                part += '.'
            sentences.append(part)
    result = ' '.join(sentences)
    
    if len(result) > 300:
        result = result[:297] + "..."
    
    if result and not result.endswith(('.', '!', '?')):
        result += '.'
    return result