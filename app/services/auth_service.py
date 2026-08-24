from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.models.users import User
from app.core.security import hash_password,verify_password,create_access_token
from app.models.profiles import Profile



class Authentication:

    @staticmethod
    def register_user(db:Session, user_data:User):

        existing_user=db.query(User).filter(User.email==user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A profile with this email is already exist"
            )
        
        hash_pw=hash_password(user_data.password)
        new_user=User(
            custom_id=user_data.custom_id,
            name=user_data.name,
            email=user_data.email,
            password=hash_pw,
            gender=user_data.gender,
            age=user_data.age,
            date_of_birth=user_data.date_of_birth
        )
        db.add(new_user)
        db.flush()

        db_profile=Profile(
            user_id=new_user.id
        )
        db.add(db_profile)

        db.commit() 
        db.refresh(db_profile)

        return new_user
    
    @staticmethod
    def authenticate_user(db:Session,email:str,password:str):
        user=db.query(User).filter(User.email==email).first()
        if not user:
            return None
        
        if not verify_password(password,user.password):
            return None
        
        token_data={"sub": user.email}
        access_token=create_access_token(token_data)

        return {
            "access_token": access_token,
            "token_type": "bearer"
        }


