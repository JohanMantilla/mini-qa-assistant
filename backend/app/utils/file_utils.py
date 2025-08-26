import PyPDF2
from typing import Dict, List
from fastapi import UploadFile, HTTPException

async def extract_text_from_file(file: UploadFile) -> str:
    filename = file.filename.lower()
    content = await file.read()
    
    try:
        if filename.endswith('.txt'):
            text = content.decode('utf-8', errors='ignore')
            return text.strip()
            
        elif filename.endswith('.pdf'):
            import io
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
            text = ""
            
            for page_num in range(len(pdf_reader.pages)):
                page = pdf_reader.pages[page_num]
                text += page.extract_text() + "\n"
                
            return text.strip()
            
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Formato no soportado: {filename}. Use .txt o .pdf"
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Error procesando archivo {file.filename}: {str(e)}"
        )

def validate_file(file: UploadFile) -> bool:
    allowed_extensions = ['.txt', '.pdf']
    filename = file.filename.lower()
    
    return any(filename.endswith(ext) for ext in allowed_extensions)

def validate_file_size(file: UploadFile, max_size_mb: int = 10) -> bool:
    return True