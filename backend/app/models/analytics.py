import uuid
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
from app.db.base_model import Base

if TYPE_CHECKING:
    from app.models.auth import User

class AnalyticsEvent(Base):
    """
    Privacy-preserving, first-party event tracking for GramAI.
    Stores only non-PII metrics: page views, scheme views, apply clicks, submissions, etc.
    Never stores passwords, tokens, full form data, Aadhaar numbers, or raw IP addresses.
    """
    __tablename__ = "analytics_events"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    event_type: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    route: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    scheme_id: Mapped[Optional[str]] = mapped_column(String(50), index=True, nullable=True)
    campaign_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    session_id: Mapped[Optional[str]] = mapped_column(String(64), index=True, nullable=True)
    
    # Optional pseudonymous relation to authenticated user; set to null on user deletion
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True, nullable=True)
    
    # Safe non-PII label (e.g. scheme name or link target)
    label: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc),
        index=True
    )

    user: Mapped[Optional["User"]] = relationship()
