from pydantic import BaseModel,Emailstr
from datetime import datetime

class UserBase(BaseModel):
    custom_id:str
    name:str
    gender:str
    age:int

class InputUserBase(UserBase):
    id:int
    createed_at:datetime

class InputUser(UserBase):
    email:Emailstr
    password:str
    date_of_birth:str

class OutputUser(UserBase):
    is_active:bool
    created_at:datetime

    class Config:
        from_attribute=True

