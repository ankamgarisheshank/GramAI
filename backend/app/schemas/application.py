from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime
from app.schemas.scheme import SchemeResponse
from app.schemas.document import DocumentResponse

class ApplicationBase(BaseModel):
    scheme_id: UUID
    form_data: Optional[Dict[str, Any]] = None

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationUpdate(BaseModel):
    form_data: Dict[str, Any]

class ApplicationStatusResponse(BaseModel):
    status: str
    officer_remarks: Optional[str] = None

class ApplicationResponse(BaseModel):
    id: UUID
    user_id: UUID
    scheme_id: UUID
    status: str
    application_id: str
    scheme: SchemeResponse
    
    assigned_officer_id: Optional[UUID] = None
    
    submitted_at: Optional[datetime] = None
    reviewed_at: Optional[datetime] = None
    decision_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ApplicationDetailResponse(ApplicationResponse):
    form_data: Optional[Dict[str, Any]] = None
    eligibility_result: Optional[Dict[str, Any]] = None
    officer_remarks: Optional[str] = None
    documents: List[DocumentResponse] = []
    
    class Config:
        from_attributes = True
