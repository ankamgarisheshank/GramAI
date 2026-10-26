from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
from app.models.scheme import Scheme, SavedSchemes
from app.schemas.scheme import SchemeCreate, SchemeUpdate

class SchemeRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, skip: int = 0, limit: int = 100) -> List[Scheme]:
        return self.db.query(Scheme).filter(Scheme.is_deleted == False).offset(skip).limit(limit).all()

    def get_by_id(self, scheme_id: uuid.UUID) -> Optional[Scheme]:
        return self.db.query(Scheme).filter(Scheme.id == scheme_id, Scheme.is_deleted == False).first()

    def create(self, scheme_in: SchemeCreate) -> Scheme:
        db_obj = Scheme(**scheme_in.model_dump())
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update(self, db_obj: Scheme, obj_in: SchemeUpdate) -> Scheme:
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        
        from datetime import date
        db_obj.last_updated = date.today()
        
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def search_by_name(self, query: str) -> List[Scheme]:
        from sqlalchemy import or_
        return self.db.query(Scheme).filter(
            or_(
                Scheme.name.ilike(f"%{query}%"),
                Scheme.description.ilike(f"%{query}%"),
                Scheme.beneficiary_type.ilike(f"%{query}%")
            ),
            Scheme.is_deleted == False
        ).all()

    def get_saved_schemes(self, user_id: uuid.UUID) -> List[SavedSchemes]:
        return self.db.query(SavedSchemes).filter(SavedSchemes.user_id == user_id).all()

    def save_scheme(self, user_id: uuid.UUID, scheme_id: uuid.UUID, notes: Optional[str] = None) -> SavedSchemes:
        saved = SavedSchemes(user_id=user_id, scheme_id=scheme_id, notes=notes)
        self.db.add(saved)
        self.db.commit()
        self.db.refresh(saved)
        return saved
        
    def unsave_scheme(self, user_id: uuid.UUID, scheme_id: uuid.UUID) -> bool:
        saved = self.db.query(SavedSchemes).filter(SavedSchemes.user_id == user_id, SavedSchemes.scheme_id == scheme_id).first()
        if saved:
            self.db.delete(saved)
            self.db.commit()
            return True
        return False
    
    def get_applications(self, user_id: uuid.UUID):
        from app.models.application import Application
        return self.db.query(Application).filter(Application.user_id == user_id).all()

    def apply_scheme(self, user_id: uuid.UUID, scheme_id: uuid.UUID) -> str:
        from app.models.application import Application
        import random
        # Check if already applied
        existing = self.db.query(Application).filter(Application.user_id == user_id, Application.scheme_id == scheme_id).first()
        if existing:
            return existing.application_id
            
        app_id = f"TG-APP-{random.randint(1000, 9999)}"
        application = Application(user_id=user_id, scheme_id=scheme_id, application_id=app_id)
        self.db.add(application)
        self.db.commit()
        return app_id
