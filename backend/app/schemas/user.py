from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID

class UserLogin(BaseModel):
    username: str # Can be email or phone
    password: str

class GoogleAuthRequest(BaseModel):
    token: str
    role_id: int = 4 # Default to Citizen


class TokenSchema(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class UserRegister(BaseModel):
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    password: str
    role_id: Optional[int] = 4 # Default to Citizen
    persona: Optional[str] = None # e.g. "farmer", "student", "senior", "citizen"
    full_name: Optional[str] = None
    district: Optional[str] = None
    village: Optional[str] = None

class UserResponse(BaseModel):
    id: UUID
    email: Optional[EmailStr]
    phone_number: Optional[str]
    role_id: int
    persona: Optional[str] = None
    role_name: Optional[str] = None

    class Config:
        from_attributes = True
