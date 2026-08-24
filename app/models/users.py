from app.core.database import Base
from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from .profiles import Profile
    from .preference import Preference  # Type hint import


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    custom_id: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(300))
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    password: Mapped[str] = mapped_column(String(255))

    gender: Mapped[str] = mapped_column(String(100))
    age: Mapped[int] = mapped_column(Integer)
    date_of_birth: Mapped[str] = mapped_column(String(1000))

    is_active: Mapped[bool] = mapped_column(default=True)

    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now(timezone.utc))

    # ==========================================
    # RELATIONSHIPS
    # ==========================================
    profile: Mapped[Optional["Profile"]] = relationship("Profile", back_populates="user", uselist=False)
    preference: Mapped[Optional["Preference"]] = relationship("Preference", back_populates="user", uselist=False)

    def __repr__(self) -> str:
        return f"<User id={self.id} name={self.name} email={self.email}>"