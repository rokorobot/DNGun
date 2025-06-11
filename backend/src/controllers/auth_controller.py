from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from motor.motor_asyncio import AsyncIOMotorDatabase
from ..models.user import User, UserCreate, UserPublic
from ..utils.security import verify_password, get_password_hash, create_access_token
from ..config.database import get_database

async def register_user(user_data: UserCreate, db):
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user with hashed password
    hashed_password = get_password_hash(user_data.password)
    user = User(
        email=user_data.email,
        username=user_data.username,
        full_name=user_data.full_name,
        hashed_password=hashed_password
    )
    
    # Insert user into database
    await db.users.insert_one(user.dict())
    
    # Return user without sensitive information
    return UserPublic(
        id=user.id,
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        created_at=user.created_at
    )

async def authenticate_user(form_data: OAuth2PasswordRequestForm, db: AsyncIOMotorDatabase = Depends(get_database)):
    user_data = await db.users.find_one({"email": form_data.username})
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = User(**user_data)
    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user.id}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}
