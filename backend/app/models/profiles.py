from app.core.database import Base,engine
from sqlalchemy import ForeignKey,String
from sqlalchemy.orm import Mapped,mapped_column,relationship
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .users import User

class Profile(Base):
    __tablename__="profiles"

    id:Mapped[int]=mapped_column(primary_key=True,index=True)
    user_id:Mapped[int]=mapped_column(ForeignKey("users.id"),unique=True)

    #personal details
    bio:Mapped[str|None]=mapped_column(String(1000))
    religion: Mapped[str|None]=mapped_column(String(100))
    education:Mapped[str|None]=mapped_column(String(320))
    address:Mapped[str|None]=mapped_column(String(500))
    income:Mapped[str|None]=mapped_column(String(100))
    occupation:Mapped[str|None]=mapped_column(String(100))

    #Table relationships
    user:Mapped["User"]=relationship("User",back_populates="profile")


    def __repr__(self)-> str:
        return f"<Profile id={self.id} user_id={self.user_id}>"
    

    