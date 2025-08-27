"""
Servicio principal para manejo de documentos y búsqueda con BM25
Ahora con persistencia simple en JSON
"""
import json
import os
from typing import List, Dict, Tuple
from rank_bm25 import BM25Okapi
import numpy as np
import re

from app.utils.text_utils import clean_text, split_into_chunks, extract_sentences

class DocumentService:    
    def __init__(self):
        self.documents = {}  
        self.chunks = []  
        self.chunk_metadata = []  
        self.tokenized_chunks = []  
        self.bm25 = None  
        self.index_file = "data/document_index.json"  
        
        os.makedirs(os.path.dirname(self.index_file), exist_ok=True)
        self._load_index()
        
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
        self._save_index()
    
    def _save_index(self):
        try:
            index_data = {
                'documents': self.documents,
                'chunks': self.chunks,
                'chunk_metadata': self.chunk_metadata,
                'tokenized_chunks': self.tokenized_chunks,
                'timestamp': str(np.datetime64('now'))
            }
            
            with open(self.index_file, 'w', encoding='utf-8') as f:
                json.dump(index_data, f, ensure_ascii=False, indent=2)
                
            print(f"Índice guardado en {self.index_file}")
            
        except Exception as e:
            print(f"Error guardando índice: {e}")
    
    def _load_index(self):
        try:
            if os.path.exists(self.index_file):
                with open(self.index_file, 'r', encoding='utf-8') as f:
                    index_data = json.load(f)
                
                self.documents = index_data.get('documents', {})
                self.chunks = index_data.get('chunks', [])
                self.chunk_metadata = index_data.get('chunk_metadata', [])
                self.tokenized_chunks = index_data.get('tokenized_chunks', [])
                
                if self.tokenized_chunks:
                    self.bm25 = BM25Okapi(self.tokenized_chunks, k1=1.2, b=0.75)
                    print(f"Índice cargado desde {self.index_file} ({len(self.documents)} documentos)")
                else:
                    print("Índice cargado pero está vacío")
            else:
                print("No existe índice previo, empezando limpio")
                
        except Exception as e:
            print(f"Error cargando índice: {e}")
            self.clear_index()
    
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
    
    def answer_question(self, question: str) -> Tuple[str, List[Dict]]:
        search_results = self.search(question, top_k=5, min_score=0.15)
        if not search_results:
            return "No encuentro esa información en los documentos cargados.", []

        question_tokens = set(self._tokenize(clean_text(question)))

        best_sentence = ""
        best_score = 0
        citations = []
        for result in search_results[:3]:
            sentences = re.split(r'(?<=[.!?])\s+', result['text'])
            for sentence in sentences:
                sentence_tokens = set(self._tokenize(sentence))
                score = len(question_tokens & sentence_tokens)
                if score > best_score and len(sentence) > 20:
                    best_score = score
                    best_sentence = sentence
                    best_citation = {
                        'text': sentence.strip(),
                        'document_name': result['document_name']
                    }
            if len(citations) < 3 and sentences:
                citations.append({
                    'text': sentences[0].strip(),
                    'document_name': result['document_name']
                })

        if best_sentence:
            answer = best_sentence.strip()
        else:
            answer_parts = []
            for i, result in enumerate(search_results[:2]):
                sentences = extract_sentences(result['text'], num_sentences=2)
                if sentences:
                    answer_parts.append(sentences)
            answer = " ".join(answer_parts) if answer_parts else "No encuentro información específica sobre esa pregunta en los documentos."

        return answer, citations
    
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
        
        if os.path.exists(self.index_file):
            try:
                os.remove(self.index_file)
                print(f"Índice persistente eliminado: {self.index_file}")
            except Exception as e:
                print(f"Error eliminando índice: {e}")
    
    def get_index_info(self) -> Dict:
        return {
            'documents_count': len(self.documents),
            'chunks_count': len(self.chunks),
            'has_bm25_index': self.bm25 is not None,
            'index_file_exists': os.path.exists(self.index_file),
            'document_names': list(self.documents.keys())
        }

document_service = DocumentService()