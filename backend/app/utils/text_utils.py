"""
Utilidades para procesamiento de texto
"""
import re
from typing import List

def clean_text(text: str) -> str:
    """
    Limpia el texto eliminando caracteres especiales y normalizando espacios
    
    Args:
        text: Texto a limpiar
        
    Returns:
        Texto limpio y normalizado
    """
    # Reemplazar saltos de línea por espacios
    text = text.replace('\n', ' ').replace('\r', ' ').replace('\t', ' ')
    
    # Eliminar caracteres especiales pero mantener puntuación importante
    # Mantener letras, números, espacios y puntuación básica
    text = re.sub(r'[^\w\s.,;:!?¿¡\-()áéíóúñÁÉÍÓÚÑüÜ]', ' ', text)
    
    # Eliminar espacios múltiples
    text = re.sub(r'\s+', ' ', text)
    
    return text.strip()

def split_into_chunks(text: str, chunk_size: int = 500, overlap: int = 150) -> List[str]:
    """
    Divide el texto en fragmentos agrupando oraciones hasta un tamaño máximo.
    Evita cortar palabras y oraciones arbitrariamente.
    """
    if not text:
        return []

    # Separar el texto en oraciones usando regex
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

        # Si agregar la oración excede el chunk_size, guardar el chunk actual
        if len(current_chunk) + len(sentence) + 1 > chunk_size:
            if current_chunk:
                chunks.append(current_chunk.strip())
            # Para el overlap, tomar las últimas oraciones del chunk actual
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
        # Agregar la oración al chunk actual
        if current_chunk:
            current_chunk += " " + sentence
        else:
            current_chunk = sentence
        i += 1

    # Agregar el último chunk si queda algo
    if current_chunk and len(current_chunk) > 30:
        chunks.append(current_chunk.strip())

    return chunks

def extract_sentences(text: str, num_sentences: int = 3) -> str:
    """
    Extrae las primeras n oraciones completas de un texto
    
    Args:
        text: Texto fuente
        num_sentences: Número de oraciones a extraer
        
    Returns:
        Oraciones extraídas formateadas
    """
    if not text:
        return ""
    
    # Definir patrones de fin de oración
    sentence_endings = re.compile(r'[.!?]\s+')
    
    # Dividir por fin de oración
    parts = sentence_endings.split(text)
    
    # Reconstruir oraciones completas
    sentences = []
    for i, part in enumerate(parts[:num_sentences]):
        part = part.strip()
        if part:
            # Agregar punto si no tiene puntuación final
            if not part[-1] in '.!?':
                part += '.'
            sentences.append(part)
    
    # Unir oraciones
    result = ' '.join(sentences)
    
    # Limitar longitud máxima
    if len(result) > 300:
        result = result[:297] + "..."
    
    # Agregar punto final si no lo tiene
    if result and not result.endswith(('.', '!', '?')):
        result += '.'
        
    return result