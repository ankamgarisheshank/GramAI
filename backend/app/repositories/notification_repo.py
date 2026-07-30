from sqlalchemy.orm import Session
from typing import List
import uuid
from app.models.communication import Notification
from app.schemas.notification import NotificationCreate

class NotificationRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_user(self, user_id: uuid.UUID) -> List[Notification]:
        return self.db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.created_at.desc()).all()

    def get_unread_count(self, user_id: uuid.UUID) -> int:
        return self.db.query(Notification).filter(Notification.user_id == user_id, Notification.is_read == False).count()

    def create(self, data: NotificationCreate) -> Notification:
        notif = Notification(**data.model_dump())
        self.db.add(notif)
        self.db.commit()
        self.db.refresh(notif)
        return notif

    def mark_as_read(self, notification_id: int, user_id: uuid.UUID) -> bool:
        notif = self.db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == user_id).first()
        if notif:
            notif.is_read = True
            self.db.commit()
            return True
        return False
