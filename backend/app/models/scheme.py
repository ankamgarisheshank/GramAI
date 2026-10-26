import uuid
from typing import List, TYPE_CHECKING
from datetime import date

from sqlalchemy import String, ForeignKey, Integer, Float, Text, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_model import Base, TimestampMixin, SoftDeleteMixin

if TYPE_CHECKING:
    from app.models.auth import User
    from app.models.location import District


class SchemeCategory(Base, TimestampMixin):
    __tablename__ = "scheme_categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    description: Mapped[str] = mapped_column(String(255), nullable=True)

    schemes: Mapped[List["Scheme"]] = relationship(back_populates="category")


class Scheme(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "schemes"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)

    name: Mapped[str] = mapped_column(String(255), index=True)
    department: Mapped[str] = mapped_column(String(150), index=True)

    description: Mapped[str] = mapped_column(Text)
    benefits: Mapped[str] = mapped_column(Text)
    required_documents: Mapped[str] = mapped_column(Text)
    application_process: Mapped[str] = mapped_column(Text)

    official_link: Mapped[str] = mapped_column(String(255), nullable=True)

    status: Mapped[str] = mapped_column(
        String(50),
        default="Active",
        index=True,
    )

    last_updated: Mapped[date] = mapped_column(Date, nullable=True)

    beneficiary_type: Mapped[str] = mapped_column(
        String(100),
        nullable=True,
    )

    income_limit: Mapped[float] = mapped_column(
        Float,
        nullable=True,
    )

    age_limit_min: Mapped[int] = mapped_column(
        Integer,
        nullable=True,
    )

    age_limit_max: Mapped[int] = mapped_column(
        Integer,
        nullable=True,
    )

    occupation_requirement: Mapped[str] = mapped_column(
        String(100),
        nullable=True,
    )

    category_id: Mapped[int] = mapped_column(
        ForeignKey("scheme_categories.id", ondelete="SET NULL"),
        nullable=True,
    )

    district_applicability_id: Mapped[int] = mapped_column(
        ForeignKey("districts.id", ondelete="SET NULL"),
        nullable=True,
    )

    category: Mapped["SchemeCategory"] = relationship(
        back_populates="schemes"
    )

    district: Mapped["District"] = relationship(
        back_populates="applicable_schemes"
    )

    rules: Mapped[List["EligibilityRule"]] = relationship(
        back_populates="scheme",
        cascade="all, delete-orphan",
    )

    saved_by: Mapped[List["SavedSchemes"]] = relationship(
        back_populates="scheme"
    )


class EligibilityRule(Base, TimestampMixin):
    __tablename__ = "eligibility_rules"

    id: Mapped[int] = mapped_column(primary_key=True)

    scheme_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("schemes.id", ondelete="CASCADE")
    )

    rule_key: Mapped[str] = mapped_column(String(100))
    operator: Mapped[str] = mapped_column(String(10))
    rule_value: Mapped[str] = mapped_column(String(255))

    scheme: Mapped["Scheme"] = relationship(
        back_populates="rules"
    )


class SavedSchemes(Base, TimestampMixin):
    __tablename__ = "saved_schemes"

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )

    scheme_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("schemes.id", ondelete="CASCADE"),
        index=True,
    )

    notes: Mapped[str] = mapped_column(
        String,
        nullable=True,
    )

    user: Mapped["User"] = relationship(
        back_populates="saved_schemes"
    )

    scheme: Mapped["Scheme"] = relationship(
        back_populates="saved_by"
    )