import uuid
from typing import TYPE_CHECKING, List
from sqlalchemy import String, ForeignKey, Date, JSON, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base_model import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.auth import User
    from app.models.scheme import Scheme
    from app.models.document import Document

class Application(Base, TimestampMixin):
    __tablename__ = "applications"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    scheme_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("schemes.id", ondelete="CASCADE"), index=True)
    
    status: Mapped[str] = mapped_column(String(50), default="DRAFT") # DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED
    application_id: Mapped[str] = mapped_column(String(50), unique=True, index=True) # E.g., APP-2026-000001
    
    form_data: Mapped[dict] = mapped_column(JSON, nullable=True)
    eligibility_result: Mapped[dict] = mapped_column(JSON, nullable=True)
    
    assigned_officer_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    officer_remarks: Mapped[str] = mapped_column(Text, nullable=True)
    
    submitted_at: Mapped[DateTime] = mapped_column(DateTime, nullable=True)
    reviewed_at: Mapped[DateTime] = mapped_column(DateTime, nullable=True)
    decision_at: Mapped[DateTime] = mapped_column(DateTime, nullable=True)
    
    user: Mapped["User"] = relationship(foreign_keys=[user_id])
    assigned_officer: Mapped["User"] = relationship(foreign_keys=[assigned_officer_id])
    scheme: Mapped["Scheme"] = relationship()
    
    documents: Mapped[List["Document"]] = relationship(back_populates="application", cascade="all, delete-orphan")
