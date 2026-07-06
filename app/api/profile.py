from fastapi import APIRouter,HTTPException,status,Depends
from sqlalchemy.orm import Session

from app.schemas.profile_schema import ProfileBase,ProfileUpdate
from app.schemas.user_schema import OutputUser
from app.core.database import get_db
from app.services.profile_service import ProfileService



router=APIRouter(prefix="/profile",tags=["Profile"])

@router.get(
    path="/{user_id}",
    response_model=ProfileBase,
    status_code=status.HTTP_200_OK
    )
def find_user_profile(user_id:int,db:Session = Depends(get_db)):

    profile=ProfileService.get_user_by_id(db=db,user_id=user_id)
    return profile

@router.post(
    path="/updateprofile/{user_id}",
    response_model=ProfileUpdate,
    status_code=status.HTTP_200_OK
)
def update_profile(user_data: ProfileUpdate,user_id:int,db:Session = Depends(get_db)):

    updated_profile=ProfileService.update_profile(user_data=user_data,user_id=user_id,db=db)
    return updated_profile
