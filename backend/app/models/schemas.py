from pydantic import BaseModel, Field
from typing import List, Optional

class FileUploadResponse(BaseModel):
    message: str
    files_processed: int
    files_list: List[str]

class SearchResult(BaseModel):
    text: str = Field(description="Fragmento de texto encontrado")
    document_name: str = Field(description="Nombre del documento")
    relevance_score: float = Field(description="Puntaje de relevancia")

class SearchResponse(BaseModel):
    query: str
    results: List[SearchResult]
    total_results: int
    
class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None