from fastapi import APIRouter
from app.schemas.response import StandardResponse
from app.core.config import settings

router = APIRouter()

@router.get("/health", response_model=StandardResponse[dict])
def health_check():
    """Basic health check endpoint."""
    return StandardResponse(success=True, message="Service is healthy", data={"status": "up"})

@router.get("/version", response_model=StandardResponse[dict])
def get_version():
    """Get API version."""
    return StandardResponse(success=True, data={"version": settings.VERSION})
