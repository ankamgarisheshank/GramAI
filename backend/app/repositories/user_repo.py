from sqlalchemy.orm import Session
from typing import Optional
import uuid
from app.models.auth import User

class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_email_or_phone(self, identifier: str) -> Optional[User]:
        return self.db.query(User).filter(
            (User.email == identifier) | (User.phone_number == identifier)
        ).first()

    def get_by_id(self, user_id: uuid.UUID) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    def create(self, user: User) -> User:
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
