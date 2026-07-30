from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.schemas.response import StandardResponse
from app.schemas.user import UserResponse
from app.schemas.scheme import SchemeResponse
from app.models.auth import User
from app.models.scheme import Scheme
from app.api.deps import RequireRole

router = APIRouter()
# Protect all admin routes
admin_only = RequireRole(["Super Admin", "Mandal Admin", "Village Admin"])

@router.get("/users", response_model=StandardResponse[List[UserResponse]])
def list_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user = Depends(admin_only)):
    users = db.query(User).offset(skip).limit(limit).all()
    return StandardResponse(data=[UserResponse.model_validate(u) for u in users])

@router.get("/schemes", response_model=StandardResponse[List[SchemeResponse]])
def list_schemes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user = Depends(admin_only)):
    schemes = db.query(Scheme).offset(skip).limit(limit).all()
    return StandardResponse(data=[SchemeResponse.model_validate(s) for s in schemes])
