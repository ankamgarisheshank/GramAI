from typing import List, TYPE_CHECKING
from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base_model import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.profile import CitizenProfile
    from app.models.scheme import Scheme

class District(Base, TimestampMixin):
    __tablename__ = "districts"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    
    mandals: Mapped[List["Mandal"]] = relationship(back_populates="district", cascade="all, delete-orphan")
    citizen_profiles: Mapped[List["CitizenProfile"]] = relationship(back_populates="district")
    applicable_schemes: Mapped[List["Scheme"]] = relationship(back_populates="district")

class Mandal(Base, TimestampMixin):
    __tablename__ = "mandals"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), index=True)
    district_id: Mapped[int] = mapped_column(ForeignKey("districts.id", ondelete="CASCADE"))
    
    district: Mapped["District"] = relationship(back_populates="mandals")
    villages: Mapped[List["Village"]] = relationship(back_populates="mandal", cascade="all, delete-orphan")
    citizen_profiles: Mapped[List["CitizenProfile"]] = relationship(back_populates="mandal")

class Village(Base, TimestampMixin):
    __tablename__ = "villages"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), index=True)
    mandal_id: Mapped[int] = mapped_column(ForeignKey("mandals.id", ondelete="CASCADE"))
    
    mandal: Mapped["Mandal"] = relationship(back_populates="villages")
    citizen_profiles: Mapped[List["CitizenProfile"]] = relationship(back_populates="village")
