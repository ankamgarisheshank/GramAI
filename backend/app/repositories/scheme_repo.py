from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
from app.models.scheme import Scheme, SavedSchemes
from app.schemas.scheme import SchemeCreate

class SchemeRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, skip: int = 0, limit: int = 100) -> List[Scheme]:
        return self.db.query(Scheme).filter(Scheme.is_deleted == False).offset(skip).limit(limit).all()

    def get_by_id(self, scheme_id: uuid.UUID) -> Optional[Scheme]:
        return self.db.query(Scheme).filter(Scheme.id == scheme_id, Scheme.is_deleted == False).first()

    def search_by_name(self, query: str) -> List[Scheme]:
        return self.db.query(Scheme).filter(Scheme.name.ilike(f"%{query}%"), Scheme.is_deleted == False).all()

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
