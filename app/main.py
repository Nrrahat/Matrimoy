from fastapi import FastAPI

from app.api.auth import router as auth_router
from app.api.profile import router as profile_router

app=FastAPI(
    title="Matrimony APP",
    description="Bankend handle user,profile,matching",
    version="1.0.0"
)

app.include_router(auth_router)
app.include_router(profile_router)

@app.get("/")
def root():
    return{
        "message":"Wellcome to the matrimony application"
    }
