from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
from app.db.database import get_db
from app.schemas.response import StandardResponse
from app.schemas.scheme import SchemeResponse, SavedSchemeResponse
from app.services.scheme_service import SchemeService
from app.api.deps import get_current_user
from app.models.auth import User

router = APIRouter()

@router.get("/", response_model=StandardResponse[List[SchemeResponse]])
def list_schemes(search: Optional[str] = Query(None), db: Session = Depends(get_db)):
    service = SchemeService(db)
    schemes = service.list_schemes(search)
    return StandardResponse(data=schemes)

@router.get("/{scheme_id}", response_model=StandardResponse[SchemeResponse])
def get_scheme(scheme_id: uuid.UUID, db: Session = Depends(get_db)):
    service = SchemeService(db)
    scheme = service.get_scheme(scheme_id)
    return StandardResponse(data=scheme)

@router.get("/saved/me", response_model=StandardResponse[List[SavedSchemeResponse]])
def get_saved_schemes(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    service = SchemeService(db)
    schemes = service.get_saved_schemes(current_user.id)
    return StandardResponse(data=schemes)

@router.post("/{scheme_id}/save", response_model=StandardResponse[SavedSchemeResponse])
def save_scheme(scheme_id: uuid.UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    service = SchemeService(db)
    saved = service.save_scheme(current_user.id, scheme_id)
    return StandardResponse(message="Scheme saved", data=saved)

@router.delete("/{scheme_id}/save", response_model=StandardResponse[dict])
def unsave_scheme(scheme_id: uuid.UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    service = SchemeService(db)
    result = service.unsave_scheme(current_user.id, scheme_id)
    return StandardResponse(message="Scheme removed", data=result)
