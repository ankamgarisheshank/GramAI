import uuid
from typing import TYPE_CHECKING
from sqlalchemy import String, ForeignKey, Integer, Float, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base_model import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.auth import User
    from app.models.location import District, Mandal, Village

class CitizenProfile(Base, TimestampMixin):
    __tablename__ = "citizen_profiles"
    
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    
    # Unified Demographics
    full_name: Mapped[str] = mapped_column(String(150))
    age: Mapped[int] = mapped_column(Integer, nullable=True)
    gender: Mapped[str] = mapped_column(String(20), nullable=True)
    occupation: Mapped[str] = mapped_column(String(100), index=True, nullable=True)
    income: Mapped[float] = mapped_column(Float, nullable=True)
    caste_category: Mapped[str] = mapped_column(String(50), nullable=True)
    education: Mapped[str] = mapped_column(String(100), nullable=True)
    
    # Specific attributes driving recommendations
    land_holding_acres: Mapped[float] = mapped_column(Float, default=0.0)
    disability_status: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Contact & Location
    address: Mapped[str] = mapped_column(String(255), nullable=True)
    
    district_id: Mapped[int] = mapped_column(ForeignKey("districts.id", ondelete="SET NULL"), nullable=True)
    mandal_id: Mapped[int] = mapped_column(ForeignKey("mandals.id", ondelete="SET NULL"), nullable=True)
    village_id: Mapped[int] = mapped_column(ForeignKey("villages.id", ondelete="SET NULL"), nullable=True)
    
    # Relationships
    user: Mapped["User"] = relationship(back_populates="profile")
    district: Mapped["District"] = relationship(back_populates="citizen_profiles")
    mandal: Mapped["Mandal"] = relationship(back_populates="citizen_profiles")
    village: Mapped["Village"] = relationship(back_populates="citizen_profiles")
