from fastapi import APIRouter,HTTPException,status,Depends
from sqlalchemy.orm import Session

from app.schemas.profile_schema import ProfileBase,ProfileUpdate
from app.schemas.user_schema import OutputUser
from app.core.database import get_db
from app.services.profile_service import ProfileService



router=APIRouter(prefix="/profile",tags=["Profile"])

@router.get(
    path="/{custom_id}",
    response_model=ProfileBase,
    status_code=status.HTTP_200_OK
    )
def find_user_profile(custom_id:str,db:Session = Depends(get_db)):

    profile=ProfileService.get_user_by_id(db=db,custom_id=custom_id)
    return profile

@router.post(
    path="/updateprofile/{custom_id}",
    response_model=ProfileUpdate,
    status_code=status.HTTP_200_OK
)
def update_profile(user_data: ProfileUpdate,custom_id:str,db:Session = Depends(get_db)):

    updated_profile=ProfileService.update_profile(user_data=user_data,custom_id=custom_id,db=db)
    return updated_profile
