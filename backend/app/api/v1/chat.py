from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.response import StandardResponse
from app.ai.recommendation.engine import RecommendationEngine
from app.api.deps import get_current_user
from app.models.auth import User
from pydantic import BaseModel

router = APIRouter()

class ChatRequest(BaseModel):
    query: str

@router.post("/", response_model=StandardResponse[dict])
def chat(request: ChatRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    engine = RecommendationEngine(db)
    # Mocking profile for integration test
    profile = {"age": 45, "income": 40000}
    response = engine.recommend(profile, request.query)
    return StandardResponse(data={"response": response})
