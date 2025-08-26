from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List

from app.models.schemas import FileUploadResponse, ErrorResponse
from app.services.document_service import document_service
from app.utils.file_utils import extract_text_from_file, validate_file

router = APIRouter()

@router.post("/ingest", response_model=FileUploadResponse)
async def ingest_documents(
    files: List[UploadFile] = File(description="Archivos .txt o .pdf para procesar (entre 3 y 10)")
):
    """
    Endpoint para cargar y procesar múltiples documentos.
    
    Recibe entre 3 y 10 archivos (.txt o .pdf), los procesa y los indexa en memoria
    para búsquedas posteriores.
    """
    if len(files) < 3:
        raise HTTPException(
            status_code=400,
            detail="Error: Debe subir al menos 3 archivos. Solo recibimos " + str(len(files))
        )
    
    if len(files) > 10:
        raise HTTPException(
            status_code=400,
            detail="Error: No puede subir más de 10 archivos. Recibimos " + str(len(files))
        )
    
    invalid_files = []
    for file in files:
        if not validate_file(file):
            invalid_files.append(file.filename)
    
    if invalid_files:
        raise HTTPException(
            status_code=400,
            detail=f"Archivos con formato no permitido: {', '.join(invalid_files)}. Solo se aceptan archivos .txt y .pdf"
        )
    
    document_service.clear_index()
    
    processed_files = []
    errors = []
    
    for file in files:
        try:
            text = await extract_text_from_file(file)
            
            if not text or len(text.strip()) < 10:
                errors.append(f"{file.filename}: Archivo vacío o muy corto (menos de 10 caracteres)")
                continue
            
            document_service.add_document(file.filename, text)
            processed_files.append(file.filename)
            
        except Exception as e:
            errors.append(f"{file.filename}: Error al procesar - {str(e)}")
    
    if len(processed_files) < 3:
        raise HTTPException(
            status_code=400,
            detail=f"Se necesitan al menos 3 archivos válidos. Solo se procesaron {len(processed_files)}. Errores: {', '.join(errors)}"
        )
    
    document_service.build_index()
    
    message = f" Se procesaron {len(processed_files)} de {len(files)} archivos exitosamente"
    if errors:
        message += f".  Hubo errores en {len(errors)} archivo(s)"
    
    return FileUploadResponse(
        message=message,
        files_processed=len(processed_files),
        files_list=processed_files
    )