from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from typing import Optional, List
import uuid

class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    full_name: Optional[str] = None
    hashed_password: str
    is_active: bool = True
    is_verified: bool = False
    domains_owned: List[str] = []
    domains_for_sale: List[str] = []
    
class UserPublic(UserBase):
    id: str
    full_name: Optional[str] = None
    created_at: datetime
