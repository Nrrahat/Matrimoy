from pydantic_settings import BaseSettings, SettingsConfigDict
import os
from pathlib import Path


ROOT_DIR=Path(__file__).resolve().parent.parent.parent
ENV_PATH=ROOT_DIR/".env"

class Settings(BaseSettings):
    DATABASE_URL:str
    SECRET_KEY:str
    ALGORITHM:str
    ACCESS_TOKEN_EXPIRE_MINUTES:int

    model_config=SettingsConfigDict(
        env_file=ENV_PATH,
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings=Settings()


