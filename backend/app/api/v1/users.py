from fastapi import APIRouter
from app.schemas.response import StandardResponse

router = APIRouter()

@router.get("/", response_model=StandardResponse[dict])
def get_users():
    return StandardResponse(success=True, message="users endpoint", data=dict)
