from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.response import StandardResponse
from app.services.analytics_service import AnalyticsService
from app.api.deps import RequireRole

router = APIRouter()

@router.get("/dashboard", response_model=StandardResponse[dict])
def get_dashboard_metrics(
    db: Session = Depends(get_db), 
    current_user = Depends(RequireRole(["Super Admin", "Mandal Admin", "Village Admin"]))
):
    service = AnalyticsService(db)
    return StandardResponse(data=service.get_dashboard_metrics())
