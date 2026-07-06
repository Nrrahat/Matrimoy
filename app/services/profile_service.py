from sqlalchemy.orm import Session
from fastapi import HTTPException,status,Depends
from app.schemas.profile_schema import ProfileUpdate
from app.models.profiles import Profile
from app.core.database import get_db





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
    def update_profile(user_data:ProfileUpdate,user_id:int,db:Session=Depends(get_db)):
        profile=ProfileService.get_user_by_id(db,user_id)
        profile_dict=user_data.model_dump(exclude_unset=True)

        for key,value in profile_dict.items():
            setattr(profile,key,value)

        db.commit()
        db.refresh(profile)

        return profile

