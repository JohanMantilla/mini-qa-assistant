from typing import List, Dict
from app.utils.text_utils import clean_text

class DocumentService:
    """Servicio para almacenar documentos"""
    
    def __init__(self):
        self.documents = {}  
        
    def add_document(self, filename: str, text: str):        
        cleaned_text = clean_text(text)
        
        self.documents[filename] = cleaned_text
    
    def get_document_count(self) -> int:
        return len(self.documents)
    
    def get_document_names(self) -> List[str]:
        return list(self.documents.keys())
    
    def clear_documents(self):
        self.documents.clear()

document_service = DocumentService()

