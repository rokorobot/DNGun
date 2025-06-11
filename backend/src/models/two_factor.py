from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional
import uuid

class TwoFactorSetup(BaseModel):
    user_id: str
    secret: str
    backup_codes: List[str]
    is_enabled: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_used: Optional[datetime] = None

class TwoFactorEnable(BaseModel):
    totp_code: str

class TwoFactorVerify(BaseModel):
    totp_code: str

class TwoFactorDisable(BaseModel):
    password: str
    totp_code: Optional[str] = None
    backup_code: Optional[str] = None

class TwoFactorRecovery(BaseModel):
    backup_code: str

class TwoFactorStatus(BaseModel):
    is_enabled: bool
    backup_codes_remaining: int
    setup_qr_uri: Optional[str] = None
    recovery_codes: Optional[List[str]] = None