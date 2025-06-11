from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from ..utils.security import decode_token
from ..models.user import User
from ..config.database import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/token")

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncIOMotorDatabase = Depends(get_database)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_token(token)
    if payload is None:
        raise credentials_exception
    
    user_id = payload.get("sub")
    if user_id is None:
        raise credentials_exception
        
    user_data = await db.users.find_one({"id": user_id})
    if user_data is None:
        raise credentials_exception
        
    return User(**user_data)

async def get_current_active_user(current_user: User = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

async def get_current_user_with_2fa_check(current_user: User = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_database)):
    """Enhanced user authentication with 2FA check for sensitive operations"""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    # Check if user has 2FA enabled
    two_factor = await db.two_factor_auth.find_one({"user_id": current_user.id})
    if two_factor and two_factor.get("is_enabled"):
        # For sensitive operations, we'll require 2FA verification
        # This will be handled at the route level with specific 2FA checks
        pass
    
    return current_user

async def require_2fa_verification(user_id: str, db: AsyncIOMotorDatabase) -> bool:
    """Check if user has 2FA enabled and requires verification"""
    two_factor = await db.two_factor_auth.find_one({"user_id": user_id})
    return two_factor is not None and two_factor.get("is_enabled", False)
