from sqlalchemy.orm import Session
from typing import List
import uuid
from app.repositories.notification_repo import NotificationRepository
from app.schemas.notification import NotificationCreate, NotificationResponse
from app.core.exceptions import AppException

class NotificationService:
    def __init__(self, db: Session):
        self.repo = NotificationRepository(db)

    def get_user_notifications(self, user_id: uuid.UUID) -> List[NotificationResponse]:
        notifs = self.repo.get_by_user(user_id)
        return [NotificationResponse.model_validate(n) for n in notifs]

    def get_unread_count(self, user_id: uuid.UUID) -> dict:
        count = self.repo.get_unread_count(user_id)
        return {"unread_count": count}

    def create_notification(self, data: NotificationCreate) -> NotificationResponse:
        notif = self.repo.create(data)
        return NotificationResponse.model_validate(notif)

    def mark_as_read(self, notification_id: int, user_id: uuid.UUID):
        success = self.repo.mark_as_read(notification_id, user_id)
        if not success:
            raise AppException("Notification not found", status_code=404)
        return {"success": True}
