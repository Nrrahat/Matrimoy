from pydantic import BaseModel,Field

class ProfileBase(BaseModel):

    bio:str|None=Field(None,max_length=1000,description="The bio of the user")
    religion:str|None=Field(None,max_length=100,description="The religion of the user")
    education:str|None=Field(None,max_length=320,description="The education of the user")
    address:str|None=Field(None,max_length=500,description="The address of the user")
    income:str|None=Field(None,max_length=100,description="The income of the user")
    occupation:str|None=Field(None,max_length=100,description="The occupation of the user")



class ProfileUpdate(ProfileBase):

    bio:str|None=Field(None,max_length=1000,description="The bio of the user")
    religion:str|None=Field(None,max_length=100,description="The religion of the user")
    education:str|None=Field(None,max_length=320,description="The education of the user")
    address:str|None=Field(None,max_length=500,description="The address of the user")
    income:str|None=Field(None,max_length=100,description="The income of the user")
    occupation:str|None=Field(None,max_length=100,description="The occupation of the user")

class ProfileResponse(ProfileBase):
    id:int
    user_id:int

    class Config:
     from_attributes = True
            