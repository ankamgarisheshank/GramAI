from fastapi import APIRouter
from app.schemas.response import StandardResponse

router = APIRouter()

@router.get("/", response_model=StandardResponse[dict])
def get_recommendations():
    return StandardResponse(success=True, message="recommendations endpoint", data=dict)
