from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.schemas.response import StandardResponse
from app.schemas.user import UserResponse
from app.schemas.scheme import SchemeResponse, SchemeCreate, SchemeUpdate
import uuid
from app.services.scheme_service import SchemeService
from app.services.application_service import ApplicationService
from app.schemas.officer import OfficerApplicationListItem
from typing import Optional
from fastapi import Query
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

@router.post("/schemes", response_model=StandardResponse[SchemeResponse], status_code=201)
def create_scheme(scheme_in: SchemeCreate, db: Session = Depends(get_db), current_user = Depends(admin_only)):
    service = SchemeService(db)
    scheme = service.create_scheme(scheme_in)
    return StandardResponse(message="Scheme created successfully", data=scheme)

@router.put("/schemes/{scheme_id}", response_model=StandardResponse[SchemeResponse])
def update_scheme(scheme_id: uuid.UUID, scheme_in: SchemeUpdate, db: Session = Depends(get_db), current_user = Depends(admin_only)):
    service = SchemeService(db)
    scheme = service.update_scheme(scheme_id, scheme_in)
    return StandardResponse(message="Scheme updated successfully", data=scheme)

@router.get("/applications", response_model=StandardResponse[List[OfficerApplicationListItem]])
def list_admin_applications(
    status: Optional[str] = None,
    scheme_id: Optional[uuid.UUID] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only),
):
    service = ApplicationService(db)
    apps = service.get_officer_applications(
        officer=current_user,
        status=status,
        scheme_id=scheme_id,
        search=search,
        skip=skip,
        limit=limit,
    )
    return StandardResponse(
        success=True,
        message="Applications retrieved successfully",
        data=apps,
    )

