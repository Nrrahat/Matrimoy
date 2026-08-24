import jwt
import os
import bcrypt
from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from dotenv import load_dotenv

from app.core.config import settings
from app.core.database import get_db
from app.models.users import User

# Load variables from .env file
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

# OAuth2 scheme extracts token from header "Authorization: Bearer <token>"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def hash_password(password: str) -> str:
    """This function convert plain password into hash password """
    # bcrypt needed bytes not plain text
    bytes_pw = password.encode("utf-8")

    # create salt for every row
    salt = bcrypt.gensalt()

    # hash password
    hash_password_bytes = bcrypt.hashpw(bytes_pw, salt)

    return hash_password_bytes.decode("utf-8")


def verify_password(plain_password: str, hash_password: str) -> bool:
    """verify the type password and hash password saved into the database"""
    # try block use for if saved hash password are corroupted then it return false
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hash_password.encode("utf-8")
        )
    except Exception:
        return False


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    
    # ENSURE SUB IS SET properly:
    # If the login dict passed {"sub": user.email}, it stays as is.
    # If the login dict passed {"email": user.email}, this maps it to "sub".
    if "sub" not in to_encode and "email" in to_encode:
        to_encode["sub"] = str(to_encode["email"])
        
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Extracts JWT token, validates it, and fetches the authenticated user from DB"""
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # Decode token using PyJWT
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        
        # In auth_service token_data was {"email": user.email}
        email: str = payload.get("email") or payload.get("sub")
        
        if email is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    # Query user from DB
    user = db.query(User).filter(User.email == email).first()
    
    if user is None:
        raise credentials_exception

    return user


def verify_token_string(token: str) -> str:
    """
    Decodes a JWT token string and returns the user's email/identifier.
    Used for WebSocket authentication.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Decode the JWT token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")  # or payload.get("email") depending on your payload structure
        if email is None:
            raise credentials_exception
        return email
    except JWTError:
        raise credentials_exception