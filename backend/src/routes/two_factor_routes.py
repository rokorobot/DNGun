from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from ..models.user import User
from ..models.two_factor import (
    TwoFactorEnable, 
    TwoFactorVerify, 
    TwoFactorDisable, 
    TwoFactorRecovery,
    TwoFactorStatus
)
from ..controllers.two_factor_controller import (
    setup_two_factor,
    enable_two_factor,
    verify_two_factor,
    verify_backup_code,
    disable_two_factor,
    get_two_factor_status,
    regenerate_backup_codes
)
from ..middleware.auth import get_current_active_user
from ..config.database import get_database

router = APIRouter(prefix="/auth/2fa", tags=["Two-Factor Authentication"])

@router.get("/status", response_model=TwoFactorStatus)
async def get_2fa_status(
    current_user: User = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get current 2FA status for user"""
    return await get_two_factor_status(current_user, db)

@router.post("/setup", response_model=TwoFactorStatus)
async def setup_2fa(
    current_user: User = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Initialize 2FA setup - generates QR code and backup codes"""
    return await setup_two_factor(current_user, db)

@router.post("/enable")
async def enable_2fa(
    request: TwoFactorEnable,
    current_user: User = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Enable 2FA after verifying TOTP code"""
    return await enable_two_factor(current_user, request.totp_code, db)

@router.post("/verify")
async def verify_2fa(
    request: TwoFactorVerify,
    current_user: User = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Verify TOTP code"""
    is_valid = await verify_two_factor(current_user, request.totp_code, db)
    return {"valid": is_valid}

@router.post("/verify-backup")
async def verify_backup(
    request: TwoFactorRecovery,
    current_user: User = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Verify backup code"""
    is_valid = await verify_backup_code(current_user, request.backup_code, db)
    return {"valid": is_valid}

@router.post("/disable")
async def disable_2fa(
    request: TwoFactorDisable,
    current_user: User = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Disable 2FA with password and verification"""
    return await disable_two_factor(
        current_user, 
        request.password, 
        request.totp_code, 
        request.backup_code, 
        db
    )

@router.post("/regenerate-backup-codes")
async def regenerate_backup(
    request: TwoFactorVerify,
    current_user: User = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Regenerate backup codes"""
    return await regenerate_backup_codes(current_user, request.totp_code, db)