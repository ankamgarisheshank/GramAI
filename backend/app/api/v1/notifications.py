from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.schemas.response import StandardResponse
from app.schemas.notification import NotificationResponse
from app.services.notification_service import NotificationService
from app.api.deps import get_current_user
from app.models.auth import User

router = APIRouter()

@router.get("/", response_model=StandardResponse[List[NotificationResponse]])
def get_notifications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    service = NotificationService(db)
    notifs = service.get_user_notifications(current_user.id)
    return StandardResponse(data=notifs)

@router.get("/unread-count", response_model=StandardResponse[dict])
def get_unread_count(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    service = NotificationService(db)
    count = service.get_unread_count(current_user.id)
    return StandardResponse(data=count)

@router.put("/{notification_id}/read", response_model=StandardResponse[dict])
def mark_read(notification_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    service = NotificationService(db)
    result = service.mark_as_read(notification_id, current_user.id)
    return StandardResponse(message="Notification marked as read", data=result)
