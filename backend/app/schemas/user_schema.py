from pydantic import BaseModel,EmailStr
from datetime import datetime

class UserBase(BaseModel):
    custom_id:str
    name:str
    gender:str
    age:int

class InputUserBase(UserBase):
    id:int
    created_at:datetime

class InputUser(UserBase):
    email:EmailStr
    password:str
    date_of_birth:str

class OutputUser(UserBase):
    is_active:bool
    created_at:datetime

    class Config:
        from_attribute=True

class TokenResponse(BaseModel):
    access_token:str
    token_type:str

