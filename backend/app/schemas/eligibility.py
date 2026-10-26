from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID
from datetime import datetime


# Request sent by the frontend to check eligibility
class EligibilityCheckRequest(BaseModel):
    age: int
    annual_income: float
    occupation: str
    district_id: Optional[int] = None
    gender: Optional[str] = None
    category: Optional[str] = None
    land_acres: Optional[float] = None


# Information about a single matched scheme
class EligibleScheme(BaseModel):
    scheme_id: UUID
    scheme_name: str
    eligible: bool
    eligibility_score: int
    matched_rules: List[str]
    failed_rules: List[str]


# Response for POST /eligibility/check
class EligibilityCheckResponse(BaseModel):
    eligible_schemes: List[EligibleScheme]


# Eligibility history
class EligibilityHistoryResponse(BaseModel):
    id: int
    checked_at: datetime
    eligible_schemes_count: int

    class Config:
        from_attributes = True


# Detailed eligibility report
class EligibilityReportResponse(BaseModel):
    scheme_id: UUID
    scheme_name: str
    eligible: bool
    eligibility_score: int
    matched_rules: List[str]
    failed_rules: List[str] 