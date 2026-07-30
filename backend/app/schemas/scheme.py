from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import date, datetime

class SchemeBase(BaseModel):
    name: str
    department: str
    description: str
    benefits: str
    required_documents: str
    application_process: str
    official_link: Optional[str] = None
    status: str = "Active"
    
    beneficiary_type: Optional[str] = None
    income_limit: Optional[float] = None
    age_limit_min: Optional[int] = None
    age_limit_max: Optional[int] = None
    occupation_requirement: Optional[str] = None
    category_id: Optional[int] = None
    district_applicability_id: Optional[int] = None

class SchemeCreate(SchemeBase):
    pass

class SchemeUpdate(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    category_id: Optional[int] = None

class SchemeResponse(SchemeBase):
    id: UUID
    last_updated: Optional[date] = None
    created_at: datetime

    class Config:
        from_attributes = True

class SavedSchemeResponse(BaseModel):
    id: int
    user_id: UUID
    scheme_id: UUID
    notes: Optional[str] = None
    scheme: SchemeResponse
    created_at: datetime

    class Config:
        from_attributes = True
