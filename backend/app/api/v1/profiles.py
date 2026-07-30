from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.response import StandardResponse
from app.schemas.profile import ProfileUpdate, ProfileResponse
from app.services.profile_service import ProfileService
from app.api.deps import get_current_user
from app.models.auth import User

router = APIRouter()

@router.get("/me", response_model=StandardResponse[ProfileResponse])
def get_my_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    service = ProfileService(db)
    profile = service.get_profile(current_user.id)
    return StandardResponse(data=profile)

@router.put("/me", response_model=StandardResponse[ProfileResponse])
def update_my_profile(data: ProfileUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    service = ProfileService(db)
    profile = service.create_or_update(current_user.id, data)
    return StandardResponse(message="Profile updated", data=profile)
