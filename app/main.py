from fastapi import FastAPI
from app.core.database import engine,Base
from app.models import User  # Crucial: Import the model so SQLAlchemy registers it!

# Tell SQLAlchemy to connect to Postgres and generate all tables defined in your models
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Matrimony Backend API")

@app.get("/")
def read_root():
    return {"message": "Matrimony API connected to PostgreSQL successfully!"}