from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
import uuid

class DomainBase(BaseModel):
    name: str
    extension: str
    price: float
    category: str
    status: str = "available"  # available, pending, sold

class DomainCreate(DomainBase):
    seller_id: Optional[str] = None
    description: Optional[str] = None

class Domain(DomainBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    seller_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    featured: bool = False
    description: Optional[str] = None
    views: int = 0
