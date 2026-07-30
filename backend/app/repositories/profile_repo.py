from sqlalchemy.orm import Session
from typing import Optional
import uuid
from app.models.profile import CitizenProfile
from app.schemas.profile import ProfileCreate, ProfileUpdate

class ProfileRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_user_id(self, user_id: uuid.UUID) -> Optional[CitizenProfile]:
        return self.db.query(CitizenProfile).filter(CitizenProfile.user_id == user_id).first()

    def create(self, user_id: uuid.UUID, profile_data: ProfileCreate) -> CitizenProfile:
        profile = CitizenProfile(user_id=user_id, **profile_data.model_dump())
        self.db.add(profile)
        self.db.commit()
        self.db.refresh(profile)
        return profile

    def update(self, profile: CitizenProfile, update_data: ProfileUpdate) -> CitizenProfile:
        for key, value in update_data.model_dump(exclude_unset=True).items():
            setattr(profile, key, value)
        self.db.commit()
        self.db.refresh(profile)
        return profile
