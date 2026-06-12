from fastapi import APIRouter,Depends,HTTPException,status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.schemas.user_schema import InputUser,TokenResponse
from app.core.database import get_db
from app.services.auth_service import Authentication



router=APIRouter(prefix="/auth",tags=["Authentication"])

@router.post(
    "/register",
    response_model=InputUser,
    status_code=status.HTTP_201_CREATED
)
def register_new_user( user_data: InputUser, db : Session = Depends(get_db)):

    new_user=Authentication.register_user(db=db,user_data=user_data)
    return new_user

@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK
)
def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db : Session = Depends(get_db)

):
    user_session=Authentication.authenticate_user(
        db=db,
        email=form_data.username,
        password=form_data.password
    )

    if not user_session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect emain or password",
            headers={"WWW-Authenticate" : "Bearer"}
        )
    return user_session