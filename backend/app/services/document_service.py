from typing import List, Dict
from rank_bm25 import BM25Okapi
import numpy as np

from app.utils.text_utils import clean_text, split_into_chunks

class DocumentService:
    """Servicio para indexar y buscar en documentos usando BM25"""
    
    def __init__(self):
        self.documents = {}  
        self.chunks = []  
        self.chunk_metadata = []  
        self.tokenized_chunks = []  
        self.bm25 = None 
        
    def add_document(self, filename: str, text: str):
        cleaned_text = clean_text(text)
        
        self.documents[filename] = cleaned_text

        doc_chunks = split_into_chunks(cleaned_text, chunk_size=300, overlap=100)

        for chunk in doc_chunks:
            if len(chunk.strip()) > 20:  
                self.chunks.append(chunk)
                self.chunk_metadata.append({
                    'document_name': filename,
                    'text': chunk
                })
    
    def _tokenize(self, text: str) -> List[str]:
        
        text_lower = text.lower()
        tokens = text_lower.replace(',', ' ').replace('.', ' ').replace('!', ' ').replace('?', ' ').split()
        return [token for token in tokens if len(token) > 2]
    
    def build_index(self):
        if not self.chunks:
            return
        
        self.tokenized_chunks = [self._tokenize(chunk) for chunk in self.chunks]
        
        self.bm25 = BM25Okapi(self.tokenized_chunks, k1=1.2, b=0.75)
    
    def search(self, query: str, top_k: int = 5, min_score: float = 0.25) -> List[Dict]:
        if not self.bm25 or not self.chunks:
            return []
        
        cleaned_query = clean_text(query)
        tokenized_query = self._tokenize(cleaned_query)
        scores = self.bm25.get_scores(tokenized_query)
        top_indices = np.argsort(scores)[::-1][:top_k]
        results = []
        for idx in top_indices:
            score = scores[idx]
            normalized_score = float(score) / 10.0
            chunk_text = self.chunk_metadata[idx]['text'].lower()
            keyword_matches = sum(1 for word in tokenized_query if word in chunk_text)
            phrase_match = cleaned_query.lower() in chunk_text
            if normalized_score >= min_score and (keyword_matches >= 2 or phrase_match):
                results.append({
                    'text': self.chunk_metadata[idx]['text'],
                    'document_name': self.chunk_metadata[idx]['document_name'],
                    'relevance_score': normalized_score
                })
        return results
    
    def get_document_count(self) -> int:
        return len(self.documents)
    
    def get_document_names(self) -> List[str]:
        return list(self.documents.keys())
    
    def clear_index(self):
        self.documents.clear()
        self.chunks.clear()
        self.chunk_metadata.clear()
        self.tokenized_chunks.clear()
        self.bm25 = None

document_service = DocumentService()