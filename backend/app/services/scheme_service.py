from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
from app.repositories.scheme_repo import SchemeRepository
from app.schemas.scheme import SchemeResponse, SavedSchemeResponse, SchemeCreate, SchemeUpdate
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

    def create_scheme(self, scheme_in: SchemeCreate) -> SchemeResponse:
        from app.models.scheme import SchemeCategory
        from app.models.location import District
        
        # Validation
        if scheme_in.age_limit_min is not None and scheme_in.age_limit_max is not None:
            if scheme_in.age_limit_min > scheme_in.age_limit_max:
                raise AppException("Invalid age range", status_code=400)
                
        if scheme_in.income_limit is not None and scheme_in.income_limit < 0:
            raise AppException("Invalid income limit", status_code=400)
            
        valid_statuses = ["Active", "Inactive", "Archived"]
        if scheme_in.status not in valid_statuses:
            raise AppException("Invalid status", status_code=400)
            
        if scheme_in.category_id is not None:
            cat = self.repo.db.query(SchemeCategory).filter(SchemeCategory.id == scheme_in.category_id).first()
            if not cat:
                raise AppException("Invalid category ID", status_code=400)
                
        if scheme_in.district_applicability_id is not None:
            dist = self.repo.db.query(District).filter(District.id == scheme_in.district_applicability_id).first()
            if not dist:
                raise AppException("Invalid district ID", status_code=400)
                
        scheme = self.repo.create(scheme_in)
        return SchemeResponse.model_validate(scheme)

    def update_scheme(self, scheme_id: uuid.UUID, scheme_in: SchemeUpdate) -> SchemeResponse:
        from app.models.scheme import SchemeCategory
        from app.models.location import District
        
        db_obj = self.repo.get_by_id(scheme_id)
        if not db_obj:
            raise AppException("Scheme not found", status_code=404)
            
        # Validation
        age_min = scheme_in.age_limit_min if scheme_in.age_limit_min is not None else db_obj.age_limit_min
        age_max = scheme_in.age_limit_max if scheme_in.age_limit_max is not None else db_obj.age_limit_max
        if age_min is not None and age_max is not None and age_min > age_max:
            raise AppException("Invalid age range", status_code=400)
            
        if scheme_in.income_limit is not None and scheme_in.income_limit < 0:
            raise AppException("Invalid income limit", status_code=400)
            
        if scheme_in.status is not None:
            valid_statuses = ["Active", "Inactive", "Archived"]
            if scheme_in.status not in valid_statuses:
                raise AppException("Invalid status", status_code=400)
                
        if scheme_in.category_id is not None:
            cat = self.repo.db.query(SchemeCategory).filter(SchemeCategory.id == scheme_in.category_id).first()
            if not cat:
                raise AppException("Invalid category ID", status_code=400)
                
        if scheme_in.district_applicability_id is not None:
            dist = self.repo.db.query(District).filter(District.id == scheme_in.district_applicability_id).first()
            if not dist:
                raise AppException("Invalid district ID", status_code=400)
                
        scheme = self.repo.update(db_obj, scheme_in)
        return SchemeResponse.model_validate(scheme)

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

    def get_applications(self, user_id: uuid.UUID):
        from app.schemas.application import ApplicationResponse
        apps = self.repo.get_applications(user_id)
        return [ApplicationResponse.model_validate(a) for a in apps]

    def apply_scheme(self, user_id: uuid.UUID, scheme_id: uuid.UUID):
        self.get_scheme(scheme_id) # ensure exists
        app_id = self.repo.apply_scheme(user_id, scheme_id)
        return {"application_id": app_id, "status": "Pending"}
