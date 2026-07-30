from sqlalchemy.orm import Session
import uuid
from app.repositories.profile_repo import ProfileRepository
from app.schemas.profile import ProfileCreate, ProfileUpdate, ProfileResponse
from app.core.exceptions import AppException

class ProfileService:
    def __init__(self, db: Session):
        self.repo = ProfileRepository(db)

    def _calculate_completion(self, profile) -> int:
        fields = [profile.full_name, profile.age, profile.gender, profile.occupation, profile.income, profile.district_id]
        filled = sum(1 for f in fields if f is not None)
        return int((filled / len(fields)) * 100) if fields else 0

    def get_profile(self, user_id: uuid.UUID) -> ProfileResponse:
        profile = self.repo.get_by_user_id(user_id)
        if not profile:
            raise AppException("Profile not found", status_code=404)
        
        resp = ProfileResponse.model_validate(profile)
        resp.completion_percentage = self._calculate_completion(profile)
        return resp

    def create_or_update(self, user_id: uuid.UUID, data: ProfileUpdate) -> ProfileResponse:
        profile = self.repo.get_by_user_id(user_id)
        if profile:
            updated = self.repo.update(profile, data)
        else:
            if not data.full_name:
                raise AppException("full_name is required to create a profile", status_code=400)
            create_data = ProfileCreate(**data.model_dump(exclude_unset=True))
            updated = self.repo.create(user_id, create_data)
            
        resp = ProfileResponse.model_validate(updated)
        resp.completion_percentage = self._calculate_completion(updated)
        return resp
