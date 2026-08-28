from pydantic import BaseModel,Field,EmailStr
from typing import Optional

class ProfileBase(BaseModel):

    bio:str|None=Field(None,max_length=1000,description="The bio of the user")
    religion:str|None=Field(None,max_length=100,description="The religion of the user")
    education:str|None=Field(None,max_length=320,description="The education of the user")
    address:str|None=Field(None,max_length=500,description="The address of the user")
    income:str|None=Field(None,max_length=100,description="The income of the user")
    occupation:str|None=Field(None,max_length=100,description="The occupation of the user")



class ProfileUpdate(ProfileBase):
   pass

class ProfileResponse(ProfileBase):
    id:int
    user_id:int
   

class UserProfileResponse(BaseModel):
    # Account data (from users table)
    user_id: int
    email: EmailStr
    is_active: bool
    
    # Matrimony data (from profiles table)
    bio: Optional[str] = None
    age: Optional[int] = None
    religion: Optional[str] = None
    location: Optional[str] = None
    occupation: Optional[str] = None    

    class Config:
     from_attributes = True
            