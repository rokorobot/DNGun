import pyotp
import qrcode
import secrets
import string
from io import BytesIO
import base64
from typing import List
from fastapi import HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from ..models.user import User
from ..models.two_factor import TwoFactorSetup, TwoFactorStatus
from ..utils.security import verify_password
from datetime import datetime

def generate_backup_codes(count: int = 10) -> List[str]:
    """Generate backup codes for 2FA recovery"""
    codes = []
    for _ in range(count):
        code = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))
        # Format as XXXX-XXXX for readability
        formatted_code = f"{code[:4]}-{code[4:]}"
        codes.append(formatted_code)
    return codes

def generate_qr_code(secret: str, user_email: str) -> str:
    """Generate QR code for 2FA setup"""
    totp_uri = pyotp.totp.TOTP(secret).provisioning_uri(
        name=user_email,
        issuer_name="DNGun Marketplace"
    )
    
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(totp_uri)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Convert to base64 for frontend display
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    
    return f"data:image/png;base64,{img_str}"

async def setup_two_factor(user: User, db: AsyncIOMotorDatabase):
    """Initialize 2FA setup for user"""
    # Check if 2FA is already set up
    existing_2fa = await db.two_factor_auth.find_one({"user_id": user.id})
    if existing_2fa and existing_2fa.get("is_enabled"):
        raise HTTPException(status_code=400, detail="2FA is already enabled for this account")
    
    # Generate new secret and backup codes
    secret = pyotp.random_base32()
    backup_codes = generate_backup_codes()
    
    # Create 2FA setup
    two_factor_setup = TwoFactorSetup(
        user_id=user.id,
        secret=secret,
        backup_codes=backup_codes,
        is_enabled=False
    )
    
    # Save to database (replace existing setup if any)
    await db.two_factor_auth.replace_one(
        {"user_id": user.id},
        two_factor_setup.dict(),
        upsert=True
    )
    
    # Generate QR code
    qr_uri = generate_qr_code(secret, user.email)
    
    return TwoFactorStatus(
        is_enabled=False,
        backup_codes_remaining=len(backup_codes),
        setup_qr_uri=qr_uri,
        recovery_codes=backup_codes
    )

async def enable_two_factor(user: User, totp_code: str, db: AsyncIOMotorDatabase):
    """Enable 2FA after verifying TOTP code"""
    # Get 2FA setup
    two_factor = await db.two_factor_auth.find_one({"user_id": user.id})
    if not two_factor:
        raise HTTPException(status_code=404, detail="2FA setup not found. Please start setup first.")
    
    if two_factor.get("is_enabled"):
        raise HTTPException(status_code=400, detail="2FA is already enabled")
    
    # Verify TOTP code
    totp = pyotp.TOTP(two_factor["secret"])
    if not totp.verify(totp_code, valid_window=1):
        raise HTTPException(status_code=400, detail="Invalid TOTP code")
    
    # Enable 2FA
    await db.two_factor_auth.update_one(
        {"user_id": user.id},
        {
            "$set": {
                "is_enabled": True,
                "last_used": datetime.utcnow()
            }
        }
    )
    
    return {"message": "2FA enabled successfully"}

async def verify_two_factor(user: User, totp_code: str, db: AsyncIOMotorDatabase) -> bool:
    """Verify TOTP code for authentication"""
    two_factor = await db.two_factor_auth.find_one({"user_id": user.id})
    if not two_factor or not two_factor.get("is_enabled"):
        return True  # 2FA not enabled, consider verified
    
    # Check TOTP code
    totp = pyotp.TOTP(two_factor["secret"])
    if totp.verify(totp_code, valid_window=1):
        # Update last used
        await db.two_factor_auth.update_one(
            {"user_id": user.id},
            {"$set": {"last_used": datetime.utcnow()}}
        )
        return True
    
    return False

async def verify_backup_code(user: User, backup_code: str, db: AsyncIOMotorDatabase) -> bool:
    """Verify backup code for 2FA recovery"""
    two_factor = await db.two_factor_auth.find_one({"user_id": user.id})
    if not two_factor or not two_factor.get("is_enabled"):
        return False
    
    backup_codes = two_factor.get("backup_codes", [])
    if backup_code in backup_codes:
        # Remove used backup code
        backup_codes.remove(backup_code)
        await db.two_factor_auth.update_one(
            {"user_id": user.id},
            {
                "$set": {
                    "backup_codes": backup_codes,
                    "last_used": datetime.utcnow()
                }
            }
        )
        return True
    
    return False

async def disable_two_factor(user: User, password: str, totp_code: str, backup_code: str, db: AsyncIOMotorDatabase):
    """Disable 2FA after verification"""
    # Verify password
    if not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid password")
    
    two_factor = await db.two_factor_auth.find_one({"user_id": user.id})
    if not two_factor or not two_factor.get("is_enabled"):
        raise HTTPException(status_code=400, detail="2FA is not enabled")
    
    # Verify either TOTP code or backup code
    verified = False
    if totp_code:
        verified = await verify_two_factor(user, totp_code, db)
    elif backup_code:
        verified = await verify_backup_code(user, backup_code, db)
    
    if not verified:
        raise HTTPException(status_code=400, detail="Invalid verification code")
    
    # Disable 2FA
    await db.two_factor_auth.delete_one({"user_id": user.id})
    
    return {"message": "2FA disabled successfully"}

async def get_two_factor_status(user: User, db: AsyncIOMotorDatabase):
    """Get 2FA status for user"""
    two_factor = await db.two_factor_auth.find_one({"user_id": user.id})
    
    if not two_factor:
        return TwoFactorStatus(
            is_enabled=False,
            backup_codes_remaining=0
        )
    
    return TwoFactorStatus(
        is_enabled=two_factor.get("is_enabled", False),
        backup_codes_remaining=len(two_factor.get("backup_codes", []))
    )

async def regenerate_backup_codes(user: User, totp_code: str, db: AsyncIOMotorDatabase):
    """Regenerate backup codes"""
    two_factor = await db.two_factor_auth.find_one({"user_id": user.id})
    if not two_factor or not two_factor.get("is_enabled"):
        raise HTTPException(status_code=400, detail="2FA is not enabled")
    
    # Verify TOTP code
    if not await verify_two_factor(user, totp_code, db):
        raise HTTPException(status_code=400, detail="Invalid TOTP code")
    
    # Generate new backup codes
    new_backup_codes = generate_backup_codes()
    
    await db.two_factor_auth.update_one(
        {"user_id": user.id},
        {"$set": {"backup_codes": new_backup_codes}}
    )
    
    return {
        "message": "Backup codes regenerated successfully",
        "backup_codes": new_backup_codes
    }