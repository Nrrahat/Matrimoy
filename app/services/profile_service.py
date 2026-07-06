from sqlalchemy.orm import Session
from fastapi import HTTPException,status
from app.schemas.profile_schema import ProfileUpdate
from app.models.profiles import Profile




class ProfileService:

    @staticmethod
    def get_user_by_id(db:Session,user_id:int):
        profile=db.query(Profile).filter(Profile.user_id==user_id).first()
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="This profile is not Exist"
            )
        return profile

    @staticmethod
    def update_profile(db:Session,user_data:ProfileUpdate,user_id:int):
        pass