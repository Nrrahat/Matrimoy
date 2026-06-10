from app.core.database import Base
from sqlalchemy import Integer,String
from sqlalchemy.orm import Mapped,mapped_column
from datetime import datetime,timezone

class User(Base):
    __tablename__="users"
    id: Mapped[int]=mapped_column(primary_key=True,index=True)

    name:Mapped[str]=mapped_column(String(2550))
    email:Mapped[str]=mapped_column(String(2550),unique=True,index=True)
    hash_password:Mapped[str]=mapped_column(String(2550))

    gender:Mapped[str]=mapped_column(String(2550))
    age:Mapped[int]=mapped_column(Integer)
    date_of_birth:Mapped[str]=mapped_column(String(2550))

    is_active:Mapped[bool]=mapped_column(default=True)

    created_at:Mapped[datetime]=mapped_column(default=lambda: datetime.now(timezone.utc))

    def __repr__(self)-> str:
        return f"<User id={self.id} name={self.name} email={self.email}>"
    
