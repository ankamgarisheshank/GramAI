from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
from app.repositories.scheme_repo import SchemeRepository
from app.schemas.scheme import SchemeResponse, SavedSchemeResponse
from app.core.exceptions import AppException

class SchemeService:
    def __init__(self, db: Session):
        self.repo = SchemeRepository(db)

    def list_schemes(self, search: Optional[str] = None) -> List[SchemeResponse]:
        if search:
            schemes = self.repo.search_by_name(search)
        else:
            schemes = self.repo.get_all()
        return [SchemeResponse.model_validate(s) for s in schemes]

    def get_scheme(self, scheme_id: uuid.UUID) -> SchemeResponse:
        scheme = self.repo.get_by_id(scheme_id)
        if not scheme:
            raise AppException("Scheme not found", status_code=404)
        return SchemeResponse.model_validate(scheme)

    def save_scheme(self, user_id: uuid.UUID, scheme_id: uuid.UUID) -> SavedSchemeResponse:
        self.get_scheme(scheme_id) 
        try:
            saved = self.repo.save_scheme(user_id, scheme_id)
            return SavedSchemeResponse.model_validate(saved)
        except Exception as e:
            raise AppException("Scheme already saved or invalid", status_code=400)

    def unsave_scheme(self, user_id: uuid.UUID, scheme_id: uuid.UUID):
        success = self.repo.unsave_scheme(user_id, scheme_id)
        if not success:
            raise AppException("Saved scheme not found", status_code=404)
        return {"success": True}
    
    def get_saved_schemes(self, user_id: uuid.UUID) -> List[SavedSchemeResponse]:
        saved = self.repo.get_saved_schemes(user_id)
        return [SavedSchemeResponse.model_validate(s) for s in saved]
