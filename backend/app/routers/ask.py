from fastapi import APIRouter, HTTPException

from app.models.schemas import AskRequest, AskResponse, Citation, ErrorResponse
from app.services.document_service import document_service

router = APIRouter()

@router.post("/ask", response_model=AskResponse)
async def ask_question(request: AskRequest):
    """
    Responde una pregunta basándose en los documentos indexados.
    
    Busca información relevante en los documentos y genera una respuesta
    de 3-4 líneas con citas de respaldo. Si no encuentra información
    relevante, lo indica claramente.
    """
    if document_service.get_document_count() == 0:
        raise HTTPException(
            status_code=404,
            detail="No hay documentos indexados. Por favor, use /ingest primero para cargar documentos"
        )
    
    answer, citations_data = document_service.answer_question(request.question)
    
    citations = []
    for citation in citations_data:
        citations.append(
            Citation(
                text=citation['text'],
                document_name=citation['document_name']
            )
        )
    
    if not citations:
        answer = "No encuentro esa información en los documentos cargados. Por favor, verifica que los documentos contengan información sobre tu pregunta."
    
    return AskResponse(
        question=request.question,
        answer=answer,
        citations=citations
    )