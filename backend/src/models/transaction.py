from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
import uuid

class TransactionBase(BaseModel):
    domain_id: str
    amount: float
    payment_method: str = "credit_card"  # credit_card, paypal, crypto

class TransactionCreate(TransactionBase):
    buyer_id: Optional[str] = None  # Will be set automatically from current user
    seller_id: Optional[str] = None  # Will be set automatically from domain

class Transaction(TransactionBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    buyer_id: str
    seller_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    status: str = "pending"  # pending, completed, failed, refunded
    transaction_fee: float
