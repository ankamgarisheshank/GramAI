import uuid
from typing import TYPE_CHECKING
from sqlalchemy import String, ForeignKey, Integer, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base_model import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.application import Application

class Document(Base, TimestampMixin):
    __tablename__ = "documents"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    application_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("applications.id", ondelete="CASCADE"), index=True)
    
    document_type: Mapped[str] = mapped_column(String(100))
    original_filename: Mapped[str] = mapped_column(String(255))
    stored_filename: Mapped[str] = mapped_column(String(255))
    content_type: Mapped[str] = mapped_column(String(100))
    file_size: Mapped[int] = mapped_column(Integer)
    
    verification_status: Mapped[str] = mapped_column(String(50), default="PENDING") # PENDING, VERIFIED, REJECTED
    officer_remarks: Mapped[str] = mapped_column(Text, nullable=True)
    
    uploaded_at: Mapped[DateTime] = mapped_column(DateTime, nullable=True)
    verified_at: Mapped[DateTime] = mapped_column(DateTime, nullable=True)

    application: Mapped["Application"] = relationship(back_populates="documents")
