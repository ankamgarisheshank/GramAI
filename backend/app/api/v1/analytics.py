from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.response import StandardResponse
from app.schemas.analytics import DashboardMetricsResponse
from app.services.analytics_service import AnalyticsService
from app.api.deps import RequireRole

router = APIRouter()

@router.get("/dashboard", response_model=StandardResponse[DashboardMetricsResponse])
def get_dashboard_metrics(
    db: Session = Depends(get_db), 
    current_user = Depends(RequireRole(["Super Admin", "Mandal Admin", "Village Admin"]))
):
    service = AnalyticsService(db)
    metrics = service.get_dashboard_metrics()
    return StandardResponse(
        success=True,
        message="Dashboard metrics retrieved successfully",
        data=metrics
    )
