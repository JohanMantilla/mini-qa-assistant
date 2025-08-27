from fastapi import APIRouter, Query, HTTPException

from app.models.schemas import SearchResponse, SearchResult, ErrorResponse
from app.services.document_service import document_service

router = APIRouter()

@router.get("/search", response_model=SearchResponse)
async def search_documents(
    q: str = Query(
        ...,
        min_length=1,
        max_length=200,
        description="Texto a buscar en los documentos indexados"
    )
):
    """
    Busca contenido relevante en los documentos indexados.
    
    Utiliza el algoritmo BM25 para encontrar los pasajes más relevantes
    que coincidan con la consulta. Devuelve hasta 5 fragmentos ordenados
    por relevancia.
    
    """
    if document_service.get_document_count() == 0:
        raise HTTPException(
            status_code=404,
            detail="No hay documentos indexados. Por favor, use /ingest primero para cargar documentos"
        )
    
    results = document_service.search(q, top_k=5)
    
    if not results:
        return SearchResponse(
            query=q,
            results=[],
            total_results=0
        )
    
    search_results = []
    for result in results:
        search_results.append(
            SearchResult(
                text=result['text'],
                document_name=result['document_name'],
                relevance_score=round(result['relevance_score'], 3)
            )
        )
    
    return SearchResponse(
        query=q,
        results=search_results,
        total_results=len(search_results)
    )

@router.get("/index/info")
async def get_index_info():
    return document_service.get_index_info()