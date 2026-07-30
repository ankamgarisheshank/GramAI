from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class ProfileBase(BaseModel):
    full_name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    occupation: Optional[str] = None
    income: Optional[float] = None
    caste_category: Optional[str] = None
    education: Optional[str] = None
    land_holding_acres: float = 0.0
    disability_status: bool = False
    address: Optional[str] = None
    district_id: Optional[int] = None
    mandal_id: Optional[int] = None
    village_id: Optional[int] = None

class ProfileCreate(ProfileBase):
    pass

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    occupation: Optional[str] = None
    income: Optional[float] = None
    caste_category: Optional[str] = None
    education: Optional[str] = None
    land_holding_acres: Optional[float] = None
    disability_status: Optional[bool] = None
    address: Optional[str] = None
    district_id: Optional[int] = None
    mandal_id: Optional[int] = None
    village_id: Optional[int] = None

class ProfileResponse(ProfileBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    completion_percentage: int = 0

    class Config:
        from_attributes = True
