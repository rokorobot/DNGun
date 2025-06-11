from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from motor.motor_asyncio import AsyncIOMotorDatabase
from ..models.user import UserCreate, UserPublic
from ..controllers.auth_controller import register_user, authenticate_user
from ..config.database import get_database

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserPublic)
async def signup(user_data: UserCreate, db = Depends(get_database)):
    return await register_user(user_data, db)

@router.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db = Depends(get_database)):
    return await authenticate_user(form_data, db)
