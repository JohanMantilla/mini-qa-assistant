from pydantic import BaseModel, Field
from typing import List, Optional

class FileUploadResponse(BaseModel):
    message: str
    files_processed: int
    files_list: List[str]

class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None