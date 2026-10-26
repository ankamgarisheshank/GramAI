from fastapi import APIRouter, Depends, UploadFile, File
from app.schemas.response import StandardResponse
from app.ai.speech.pipeline import SpeechPipeline
from app.api.deps import get_current_user
from app.models.auth import User
from pydantic import BaseModel
import base64

router = APIRouter()

@router.post("/transcribe", response_model=StandardResponse[dict])
async def transcribe_audio(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    pipeline = SpeechPipeline()
    audio_bytes = await file.read()
    content = pipeline.speech_to_text(audio_bytes)
    return StandardResponse(data={"transcript": content})

class SynthesizeRequest(BaseModel):
    text: str

@router.post("/synthesize", response_model=StandardResponse[dict])
def synthesize_audio(request: SynthesizeRequest, current_user: User = Depends(get_current_user)):
    pipeline = SpeechPipeline()
    audio_bytes = pipeline.text_to_speech(request.text)
    # Returning base64 encoded audio
    b64_audio = base64.b64encode(audio_bytes).decode('utf-8')
    return StandardResponse(data={"audio_base64": b64_audio})
