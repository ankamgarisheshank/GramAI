from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.schemas.response import StandardResponse
from app.schemas.scheme import SchemeResponse
from app.api.deps import get_current_user
from app.models.auth import User
from app.models.scheme import Scheme
from app.models.profile import CitizenProfile

router = APIRouter()

@router.get("/", response_model=StandardResponse[List[SchemeResponse]])
def get_recommendations(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(CitizenProfile).filter(CitizenProfile.user_id == current_user.id).first()
    
    if not profile:
        return StandardResponse(data=[])
        
    query = db.query(Scheme).filter(Scheme.status == "Active")
    
    if profile.income is not None:
        query = query.filter((Scheme.income_limit == None) | (Scheme.income_limit >= profile.income))
        
    if profile.age is not None:
        query = query.filter((Scheme.age_limit_min == None) | (Scheme.age_limit_min <= profile.age))
        query = query.filter((Scheme.age_limit_max == None) | (Scheme.age_limit_max >= profile.age))
        
    if profile.occupation:
        # Simplistic occupation matching
        query = query.filter((Scheme.beneficiary_type == None) | (Scheme.beneficiary_type.ilike(f"%{profile.occupation}%")))

    # In a real app we'd also check district_id, land_holding_acres, education etc using EligibilityRules.
    
    schemes = query.all()
    return StandardResponse(data=schemes)
