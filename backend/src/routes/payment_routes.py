from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Optional

from ..config.database import get_database
from ..middleware.auth import get_current_user
from ..models.user import User
from ..models.payment import (
    StripeCheckoutRequest,
    StripeCheckoutResponse,
    PaymentStatusResponse
)
from ..controllers.payment_controller import PaymentController

router = APIRouter(prefix="/payments", tags=["payments"])

async def get_optional_current_user(
    db: AsyncIOMotorDatabase = Depends(get_database)
) -> Optional[User]:
    """Get current user if authenticated, None otherwise"""
    try:
        from fastapi.security import OAuth2PasswordBearer
        from fastapi import Request
        import jwt
        from ..utils.security import decode_token
        
        # This is a simplified version that doesn't raise exceptions
        # In a real implementation, you'd want to extract the token properly
        return None
    except:
        return None

@router.post("/checkout/domain", response_model=StripeCheckoutResponse)
async def create_domain_checkout(
    request: StripeCheckoutRequest,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Create a Stripe checkout session for domain purchase.
    
    Security: Domain price is fetched from backend database to prevent price manipulation.
    """
    return await PaymentController.create_domain_checkout(request, None, db)

@router.get("/status/{session_id}", response_model=PaymentStatusResponse)
async def get_payment_status(
    session_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Check the status of a Stripe checkout session.
    
    This endpoint is used for polling payment status after redirect from Stripe.
    """
    return await PaymentController.check_payment_status(session_id, db)

@router.get("/history")
async def get_payment_history(
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get current user's payment history"""
    return await PaymentController.get_user_payments(current_user.id, db)

@router.post("/escrow/release/{payment_id}")
async def release_escrow_payment(
    payment_id: str,
    domain_transfer_confirmed: bool,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Release payment from escrow to seller after domain transfer confirmation.
    
    This would typically be called by admin or automated system after domain transfer verification.
    """
    # TODO: Add admin authorization check
    return await PaymentController.initiate_escrow_release(payment_id, domain_transfer_confirmed, db)

# For webhook handling (if implementing Stripe webhooks)
@router.post("/webhook/stripe")
async def stripe_webhook(
    request: dict,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Handle Stripe webhook events for real-time payment updates.
    
    This provides an alternative to polling for payment status updates.
    """
    # TODO: Implement webhook signature verification
    # TODO: Handle payment.succeeded, payment.failed, etc. events
    # TODO: Update payment_transactions collection based on webhook events
    
    return {"status": "received"}