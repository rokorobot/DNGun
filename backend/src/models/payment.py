from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Dict, Any
import uuid

class PaymentTransactionBase(BaseModel):
    amount: float
    currency: str = "usd"
    domain_id: Optional[str] = None
    domain_name: Optional[str] = None
    buyer_id: Optional[str] = None
    seller_id: Optional[str] = None
    transaction_id: Optional[str] = None  # Links to main transaction
    metadata: Optional[Dict[str, str]] = None

class PaymentTransactionCreate(PaymentTransactionBase):
    stripe_session_id: str
    payment_method: str = "stripe_checkout"

class PaymentTransaction(PaymentTransactionBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    stripe_session_id: str
    payment_method: str = "stripe_checkout"
    payment_status: str = "pending"  # pending, paid, failed, canceled, expired
    stripe_payment_status: str = "unpaid"  # Stripe's internal status
    payment_intent_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    
class StripeCheckoutRequest(BaseModel):
    # For fixed domain purchases
    domain_id: Optional[str] = None
    domain_name: Optional[str] = None
    
    # For custom amounts (not recommended for security)
    amount: Optional[float] = None
    currency: str = "usd"
    
    # URLs from frontend
    origin_url: str = Field(..., description="Frontend origin URL for building success/cancel URLs")
    
    # Additional metadata
    metadata: Optional[Dict[str, str]] = None

class StripeCheckoutResponse(BaseModel):
    checkout_url: str
    session_id: str
    amount: float
    currency: str
    domain_name: Optional[str] = None

class PaymentStatusResponse(BaseModel):
    payment_id: str
    stripe_session_id: str
    payment_status: str
    stripe_payment_status: str
    amount: float
    currency: str
    domain_name: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    metadata: Optional[Dict[str, str]] = None