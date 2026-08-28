from app.core.database import Base
from sqlalchemy import ForeignKey, String, Integer, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING, List

if TYPE_CHECKING:
    from .users import User


class Preference(Base):
    __tablename__ = "preferences"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True)

    # Hard Constraints
    min_age: Mapped[int | None] = mapped_column(Integer)
    max_age: Mapped[int | None] = mapped_column(Integer)
    gender_preference: Mapped[str | None] = mapped_column(String(50))

    # Soft Preferences (Arrays for multiple target options)
    preferred_religions: Mapped[List[str] | None] = mapped_column(ARRAY(String))
    preferred_education: Mapped[List[str] | None] = mapped_column(ARRAY(String))
    preferred_occupations: Mapped[List[str] | None] = mapped_column(ARRAY(String))
    preferred_cities: Mapped[List[str] | None] = mapped_column(ARRAY(String))
    min_income: Mapped[int | None] = mapped_column(Integer)

    # Table relationships
    user: Mapped["User"] = relationship("User", back_populates="preference")

    def __repr__(self) -> str:
        return f"<Preference id={self.id} user_id={self.user_id}>"