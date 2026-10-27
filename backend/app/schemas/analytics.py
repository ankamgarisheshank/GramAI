from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict
from uuid import UUID
from datetime import datetime

ALLOWED_EVENT_TYPES = {
    "page_view",
    "scheme_list_view",
    "scheme_detail_view",
    "apply_button_click",
    "application_started",
    "application_submitted",
    "external_link_click",
    "login_success",
    "registration_success"
}

class AnalyticsEventCreate(BaseModel):
    event_type: str = Field(..., max_length=50)
    route: Optional[str] = Field(None, max_length=255)
    scheme_id: Optional[str] = Field(None, max_length=50)
    campaign_id: Optional[str] = Field(None, max_length=100)
    session_id: Optional[str] = Field(None, max_length=64)
    label: Optional[str] = Field(None, max_length=255)

    @field_validator("event_type")
    @classmethod
    def validate_event_type(cls, v: str) -> str:
        clean = v.strip().lower()
        if clean not in ALLOWED_EVENT_TYPES:
            raise ValueError(f"Invalid event_type '{v}'. Allowed types: {', '.join(sorted(ALLOWED_EVENT_TYPES))}")
        return clean

class AnalyticsEventResponse(BaseModel):
    id: UUID
    event_type: str
    created_at: datetime

    class Config:
        from_attributes = True

class RecentApplicationSummary(BaseModel):
    id: UUID
    application_id: str
    scheme_name: str
    applicant_name: str
    user_id: Optional[UUID] = None
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

class TopSchemeEngagement(BaseModel):
    scheme_id: Optional[str] = None
    scheme_name: str
    views: int
    apply_clicks: int

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

    # Persona Demographics Breakdown
    farmer_accounts: int = 0
    student_accounts: int = 0
    senior_accounts: int = 0
    general_citizen_accounts: int = 0

    # User Activity
    registrations_today: int = 0
    registrations_this_week: int = 0
    registrations_this_month: int = 0
    active_users_24h: int = 0

    # Scheme Engagement & First-Party Analytics
    total_page_views: int = 0
    unique_sessions: int = 0
    scheme_detail_views: int = 0
    apply_clicks: int = 0
    external_link_clicks: int = 0
    top_viewed_schemes: List[TopSchemeEngagement] = Field(default_factory=list)
    engagement_by_event: Dict[str, int] = Field(default_factory=dict)
    
    # Metadata
    last_updated: Optional[str] = None
    tracking_started_at: Optional[str] = None

    class Config:
        from_attributes = True
