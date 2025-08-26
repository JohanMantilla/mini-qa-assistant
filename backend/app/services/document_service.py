from typing import List, Dict

from app.utils.text_utils import clean_text, split_into_chunks

class DocumentService:
    """Servicio para almacenar y preparar documentos para búsqueda"""
    
    def _init_(self):
        self.documents = {}
        self.chunks = []  
        self.chunk_metadata = []  
        
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
    
    def get_document_count(self) -> int:
        return len(self.documents)
    
    def get_document_names(self) -> List[str]:
        return list(self.documents.keys())
    
    def get_chunk_count(self) -> int:
        return len(self.chunks)
    
    def clear_documents(self):
        self.documents.clear()
        self.chunks.clear()
        self.chunk_metadata.clear()

# Instancia global del servicio (singleton simple)
document_service = DocumentService()