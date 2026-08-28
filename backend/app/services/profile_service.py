from sqlalchemy.orm import Session
from fastapi import HTTPException,status,Depends
from app.models.users import User
from app.schemas.profile_schema import ProfileUpdate
from app.models.profiles import Profile
from app.core.database import get_db





class ProfileService:

    @staticmethod
    def get_user_by_id(db:Session,custom_id: str):
        # 1. Query the User table where custom_id actually exists
        user = db.query(User).filter(User.custom_id == custom_id).first()
        if not user:
            return None
            
        # 2. Query the Profile table using the user's integer id
        profile = db.query(Profile).filter(Profile.user_id == user.id).first()
        return profile

    @staticmethod
    def update_profile(user_data:ProfileUpdate,custom_id:str,db:Session=Depends(get_db)):
        profile=ProfileService.get_user_by_id(db,custom_id)
        profile_dict=user_data.model_dump(exclude_unset=True)

        for key,value in profile_dict.items():
            setattr(profile,key,value)

        db.commit()
        db.refresh(profile)

        return profile

