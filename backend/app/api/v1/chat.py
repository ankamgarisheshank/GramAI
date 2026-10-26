from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.response import StandardResponse
from app.ai.recommendation.engine import RecommendationEngine
from app.api.deps import get_current_user
from app.models.auth import User
from app.models.profile import CitizenProfile
from pydantic import BaseModel

router = APIRouter()

class ChatRequest(BaseModel):
    query: str

@router.post("/", response_model=StandardResponse[dict])
def chat(request: ChatRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    engine = RecommendationEngine(db)
    
    # Get actual user profile
    profile = db.query(CitizenProfile).filter(CitizenProfile.user_id == current_user.id).first()
    
    profile_dict = {}
    if profile:
        profile_dict = {
            "age": profile.age,
            "income": profile.income,
            "occupation": profile.occupation,
            "gender": profile.gender,
            "caste_category": profile.caste_category,
            "land_holding_acres": profile.land_holding_acres,
            "disability_status": profile.disability_status
        }
        
    response = engine.recommend(profile_dict, request.query)
    return StandardResponse(data={"response": response})
