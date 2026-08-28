from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.profile import router as profile_router
from app.api.matches import router as matches_router
from app.api.chat import router as chat_router
from app.core.database import Base, engine

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Matrimony APP",
    description="Backend handles user, profile, matching and real-time chat",
    version="1.0.0"
)

# Allow the Vite dev server and any deployed frontend to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://matrimoy-lk7qn0tav-deep-semantics.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(matches_router)
app.include_router(chat_router)

@app.get("/")
def root():
    return {
        "message": "Welcome to the Matrimony application"
    }
