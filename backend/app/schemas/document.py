from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class DocumentBase(BaseModel):
    document_type: str
    original_filename: str
    stored_filename: str
    content_type: str
    file_size: int

class DocumentCreate(DocumentBase):
    application_id: UUID

class DocumentResponse(DocumentBase):
    id: UUID
    application_id: UUID
    verification_status: str
    officer_remarks: Optional[str] = None
    uploaded_at: Optional[datetime] = None
    verified_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class DocumentVerificationUpdate(BaseModel):
    verification_status: str
    officer_remarks: Optional[str] = None
