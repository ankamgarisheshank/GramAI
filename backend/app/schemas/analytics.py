from pydantic import BaseModel
from typing import Optional, List, Dict
from uuid import UUID
from datetime import datetime

class RecentApplicationSummary(BaseModel):
    id: UUID
    application_id: str
    scheme_name: str
    applicant_name: str
    status: str
    created_at: Optional[datetime] = None
    submitted_at: Optional[datetime] = None
    reviewed_at: Optional[datetime] = None
    decision_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class MonthlyTrendItem(BaseModel):
    month: str
    applications: int
    approved: int

class DistrictDistributionItem(BaseModel):
    district_name: str
    total_applications: int
    pending: int

class DashboardMetricsResponse(BaseModel):
    total_applications: int
    submitted_applications: int
    under_review_applications: int
    approved_applications: int
    rejected_applications: int
    draft_applications: int
    total_schemes: int
    active_schemes: int
    total_users: int
    total_citizens: int
    total_officers: int
    total_saved_schemes: int
    status_counts: Dict[str, int]
    recent_applications: List[RecentApplicationSummary]
    application_trends: List[MonthlyTrendItem]
    district_distribution: List[DistrictDistributionItem]

    class Config:
        from_attributes = True
