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
from app.models.auth import User, Role
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


@router.get("/citizens", response_model=StandardResponse[List[dict]])
def get_citizens_directory(
    persona: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    from app.models.profile import CitizenProfile
    from app.models.application import Application
    from app.models.analytics import AnalyticsEvent

    cit_role = db.query(Role).filter(Role.name == "Citizen").first()
    if cit_role:
        query = db.query(User).filter(User.role_id == cit_role.id).order_by(User.created_at.desc())
    else:
        query = db.query(User).order_by(User.created_at.desc())
    users = query.all()

    results = []
    for u in users:
        profile = db.query(CitizenProfile).filter(CitizenProfile.user_id == u.id).first()
        raw_persona = (profile.occupation if profile and profile.occupation else "citizen").lower()
        if persona and persona.lower() != "all" and raw_persona != persona.lower():
            continue
            
        full_name = (profile.full_name if profile and profile.full_name else None) or (u.email.split("@")[0] if u.email else u.phone_number or "Citizen")
        district_name = profile.district.name if profile and profile.district else "Telangana"
        village_name = profile.village.name if profile and profile.village else ""
        
        # Search filter
        if search:
            s_low = search.lower()
            matches = (
                s_low in str(u.id).lower() or
                s_low in full_name.lower() or
                s_low in (u.email or "").lower() or
                s_low in (u.phone_number or "").lower() or
                s_low in district_name.lower()
            )
            if not matches:
                continue

        app_count = db.query(Application).filter(Application.user_id == u.id).count()
        latest_event = db.query(AnalyticsEvent.created_at).filter(AnalyticsEvent.user_id == u.id).order_by(AnalyticsEvent.created_at.desc()).first()
        last_active = latest_event[0].isoformat() if latest_event and latest_event[0] else (u.created_at.isoformat() if u.created_at else None)

        results.append({
            "id": str(u.id),
            "email": u.email,
            "phone_number": u.phone_number,
            "full_name": full_name,
            "persona": raw_persona,
            "district": district_name,
            "village": village_name,
            "application_count": app_count,
            "created_at": u.created_at.isoformat() if u.created_at else None,
            "last_active": last_active,
            "is_active": u.is_active
        })

    return StandardResponse(
        success=True,
        message="Citizens directory retrieved successfully",
        data=results
    )


@router.get("/users/{user_id}/account", response_model=StandardResponse[dict])
def get_user_account_and_applications(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    from app.models.profile import CitizenProfile
    from app.models.application import Application
    from app.models.document import Document
    from app.models.analytics import AnalyticsEvent
    from app.core.exceptions import AppException

    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise AppException("User account not found", status_code=404)
        
    profile = db.query(CitizenProfile).filter(CitizenProfile.user_id == u.id).first()
    raw_persona = (profile.occupation if profile and profile.occupation else "citizen").lower()
    full_name = (profile.full_name if profile and profile.full_name else None) or (u.email.split("@")[0] if u.email else u.phone_number or "Citizen")
    district_name = profile.district.name if profile and profile.district else "Telangana"
    mandal_name = profile.mandal.name if profile and profile.mandal else ""
    village_name = profile.village.name if profile and profile.village else ""

    apps = db.query(Application).filter(Application.user_id == u.id).order_by(Application.created_at.desc()).all()
    app_list = []
    for a in apps:
        scheme_name = a.scheme.name if a.scheme else "Welfare Scheme"
        doc_count = db.query(Document).filter(Document.application_id == a.id).count()
        app_list.append({
            "id": str(a.id),
            "application_id": a.application_id or str(a.id)[:8],
            "scheme_id": str(a.scheme_id) if a.scheme_id else None,
            "scheme_name": scheme_name,
            "status": a.status,
            "created_at": a.created_at.isoformat() if a.created_at else None,
            "submitted_at": a.submitted_at.isoformat() if a.submitted_at else None,
            "reviewed_at": a.reviewed_at.isoformat() if a.reviewed_at else None,
            "decision_at": a.decision_at.isoformat() if a.decision_at else None,
            "document_count": doc_count
        })

    latest_event = db.query(AnalyticsEvent.created_at).filter(AnalyticsEvent.user_id == u.id).order_by(AnalyticsEvent.created_at.desc()).first()
    last_active = latest_event[0].isoformat() if latest_event and latest_event[0] else (u.created_at.isoformat() if u.created_at else None)

    return StandardResponse(
        success=True,
        message="User account and applications retrieved successfully",
        data={
            "user": {
                "id": str(u.id),
                "email": u.email,
                "phone_number": u.phone_number,
                "full_name": full_name,
                "persona": raw_persona,
                "district": district_name,
                "mandal": mandal_name,
                "village": village_name,
                "created_at": u.created_at.isoformat() if u.created_at else None,
                "last_active": last_active,
                "is_active": u.is_active,
                "role_id": u.role_id
            },
            "applications": app_list
        }
    )


