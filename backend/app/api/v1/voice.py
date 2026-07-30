from fastapi import APIRouter, Depends, UploadFile, File
from app.schemas.response import StandardResponse
from app.ai.speech.pipeline import SpeechPipeline
from app.api.deps import get_current_user
from app.models.auth import User

router = APIRouter()

@router.post("/transcribe", response_model=StandardResponse[dict])
def transcribe_audio(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    pipeline = SpeechPipeline()
    # Mocking byte read
    content = pipeline.speech_to_text(b"dummy")
    return StandardResponse(data={"transcript": content})

@router.post("/synthesize", response_model=StandardResponse[dict])
def synthesize_audio(text: str, current_user: User = Depends(get_current_user)):
    pipeline = SpeechPipeline()
    audio_bytes = pipeline.text_to_speech(text)
    # Returning mock base64 for integration
    return StandardResponse(data={"audio_base64": "UklGR... (mocked audio)"})
