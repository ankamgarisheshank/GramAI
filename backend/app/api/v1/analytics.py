from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.response import StandardResponse
from app.schemas.analytics import (
    DashboardMetricsResponse, 
    AnalyticsEventCreate, 
    AnalyticsEventResponse
)
from app.services.analytics_service import AnalyticsService
from app.api.deps import RequireRole, get_optional_current_user

router = APIRouter()

@router.post("/events", response_model=StandardResponse[AnalyticsEventResponse])
def track_event(
    data: AnalyticsEventCreate,
    request: Request,
    db: Session = Depends(get_db),
    user = Depends(get_optional_current_user)
):
    """
    Public/authenticated first-party privacy-preserving event tracking endpoint.
    Accepts page_view, scheme_list_view, scheme_detail_view, apply_button_click, etc.
    Never collects passwords, tokens, full form inputs, or Aadhaar numbers.
    """
    service = AnalyticsService(db)
    user_id = user.id if user else None
    event = service.record_event(data, user_id=user_id)
    return StandardResponse(
        success=True,
        message="Event recorded successfully",
        data=event
    )

@router.get("/dashboard", response_model=StandardResponse[DashboardMetricsResponse])
def get_dashboard_metrics(
    db: Session = Depends(get_db), 
    current_user = Depends(RequireRole(["Super Admin", "Mandal Admin", "Village Admin"]))
):
    """
    Privileged operational metrics endpoint for authorized administrators.
    """
    service = AnalyticsService(db)
    metrics = service.get_dashboard_metrics()
    return StandardResponse(
        success=True,
        message="Dashboard metrics retrieved successfully",
        data=metrics
    )
