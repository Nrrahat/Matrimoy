import jwt
import bcrypt
from datetime import datetime, timedelta,timezone
from dotenv import load_dotenv
import os


load_dotenv()

ALGORITHM=os.getenv("ALGORITHM","algo-not-found-in-dotenv")
SECRET_KEY=os.getenv("SECRET_KEY")
ACCESS_TOKEN_EXPIRE_MINUTES=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES",30))

def hash_password(password:str) -> str :
    """This function convert plain password into hash password """

    #bcrypt needed bytes not plain text
    bytes_pw=password.encode("utf-8")

    #create salt for every row
    salt=bcrypt.gensalt()

    #hash password
    hash_password_bytes=bcrypt.hashpw(bytes_pw,salt)

    return hash_password_bytes.decode("utf-8")

def verify_password(plain_password:str,hash_password:str):
    """verify the type password and hash password saved into the database"""

    #try block use for if saved hash password are corroupted then it return false
    try:
        return bcrypt.checkpw(
               plain_password.encode("utf-8"),
               hash_password.encode("utf-8")
               )
    except Exception:
        return False
        
def create_access_token(data:dict):

    to_encode=data.copy()
    expire=datetime.now(timezone.utc)+timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})

    return jwt.encode(to_encode,SECRET_KEY,algorithm=ALGORITHM)

