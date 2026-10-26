from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime
from app.schemas.document import DocumentResponse
from app.schemas.scheme import SchemeResponse

class OfficerApplicationListItem(BaseModel):
    id: UUID
    application_id: str
    scheme_id: UUID
    scheme_name: str
    applicant_id: UUID
    applicant_name: str
    applicant_phone: Optional[str] = None
    applicant_email: Optional[str] = None
    submitted_at: Optional[datetime] = None
    reviewed_at: Optional[datetime] = None
    decision_at: Optional[datetime] = None
    status: str
    district_name: Optional[str] = None
    mandal_name: Optional[str] = None
    village_name: Optional[str] = None
    total_documents: int = 0
    pending_documents: int = 0
    verified_documents: int = 0
    rejected_documents: int = 0
    created_at: datetime

    class Config:
        from_attributes = True

class OfficerApplicationDetail(BaseModel):
    id: UUID
    application_id: str
    scheme_id: UUID
    scheme: SchemeResponse
    user_id: UUID
    applicant_name: str
    applicant_phone: Optional[str] = None
    applicant_email: Optional[str] = None
    status: str
    assigned_officer_id: Optional[UUID] = None
    officer_remarks: Optional[str] = None
    form_data: Optional[Dict[str, Any]] = None
    eligibility_result: Optional[Dict[str, Any]] = None
    submitted_at: Optional[datetime] = None
    reviewed_at: Optional[datetime] = None
    decision_at: Optional[datetime] = None
    created_at: datetime
    district_name: Optional[str] = None
    mandal_name: Optional[str] = None
    village_name: Optional[str] = None
    documents: List[DocumentResponse] = []
    required_document_types: List[str] = []

    class Config:
        from_attributes = True

class DocumentVerifyRequest(BaseModel):
    verification_status: str  # "VERIFIED", "REJECTED", "PENDING"
    officer_remarks: Optional[str] = None

class ApplicationApproveRequest(BaseModel):
    officer_remarks: Optional[str] = None

class ApplicationRejectRequest(BaseModel):
    officer_remarks: str  # Required
