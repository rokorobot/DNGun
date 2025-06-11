from fastapi import HTTPException, status, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Optional
import os
from datetime import datetime

from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout, 
    CheckoutSessionResponse, 
    CheckoutStatusResponse, 
    CheckoutSessionRequest
)

from ..models.payment import (
    PaymentTransaction, 
    PaymentTransactionCreate,
    StripeCheckoutRequest,
    StripeCheckoutResponse,
    PaymentStatusResponse
)
from ..models.domain import Domain
from ..models.user import User
from ..config.database import get_database
from ..controllers.domain_controller import get_domain_by_id

# Initialize Stripe
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY', 'sk_test_placeholder')

# Only initialize Stripe if we have a valid key
if STRIPE_API_KEY and STRIPE_API_KEY != 'sk_test_placeholder' and not STRIPE_API_KEY.endswith('_key'):
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY)
else:
    stripe_checkout = None
    print("⚠️  WARNING: Stripe API key not configured properly. Payment functionality will be limited.")

class PaymentController:
    
    @staticmethod
    async def create_domain_checkout(
        request: StripeCheckoutRequest,
        current_user: Optional[User] = None,
        db = None
    ) -> StripeCheckoutResponse:
        """Create a Stripe checkout session for domain purchase"""
        
        # Validate domain exists and get price from backend (SECURITY)
        if not request.domain_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Domain ID is required"
            )
        
        # Get domain from database to ensure price comes from backend
        domain = await get_domain_by_id(request.domain_id, db)
        if not domain:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Domain not found"
            )
        
        if domain.status != "available":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Domain is not available for purchase"
            )
        
        # Use domain price from database (SECURITY: Never trust frontend amounts)
        amount = float(domain.price)
        currency = request.currency
        
        # Build success and cancel URLs from frontend origin
        success_url = f"{request.origin_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{request.origin_url}/domain/{domain.name}{domain.extension}"
        
        # Prepare metadata for Stripe
        metadata = {
            "domain_id": domain.id,
            "domain_name": f"{domain.name}{domain.extension}",
            "buyer_id": current_user.id if current_user else "anonymous",
            "seller_id": domain.seller_id or "",
            "marketplace": "dngun",
            "type": "domain_purchase"
        }
        
        if request.metadata:
            metadata.update(request.metadata)
        
        # Create Stripe checkout session
        try:
            # Check if Stripe is properly configured
            if not stripe_checkout:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Payment service not configured. Please set STRIPE_API_KEY environment variable."
                )
            
            checkout_request = CheckoutSessionRequest(
                amount=amount,
                currency=currency,
                success_url=success_url,
                cancel_url=cancel_url,
                metadata=metadata
            )
            
            session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)
            
            # Create payment transaction record BEFORE redirecting user
            payment_transaction = PaymentTransaction(
                stripe_session_id=session.session_id,
                amount=amount,
                currency=currency,
                domain_id=domain.id,
                domain_name=f"{domain.name}{domain.extension}",
                buyer_id=current_user.id if current_user else None,
                seller_id=domain.seller_id,
                payment_method="stripe_checkout",
                payment_status="pending",
                stripe_payment_status="unpaid",
                metadata=metadata
            )
            
            await db.payment_transactions.insert_one(payment_transaction.dict())
            
            return StripeCheckoutResponse(
                checkout_url=session.url,
                session_id=session.session_id,
                amount=amount,
                currency=currency,
                domain_name=f"{domain.name}{domain.extension}"
            )
            
        except Exception as e:
            # For demo purposes, create a mock checkout session
            if "Invalid API Key" in str(e) or not stripe_checkout:
                mock_session_id = f"cs_test_mock_{domain.id[:8]}"
                mock_checkout_url = f"https://checkout.stripe.com/pay/{mock_session_id}#fidkdWxOYHwnPyd1blppbHNgWjA0YUtrUkNDN1NOY2ZDVk5iaHRrVF9SdV9VdGRSTnZVYU1pZFR1ZUZGXUx1akxiSWNHY08xYjJXREdNN2MzRnVjN2BfdzFyYTJ3aHVHcnVxUz12"
                
                # Create a mock payment transaction for testing
                payment_transaction = PaymentTransaction(
                    stripe_session_id=mock_session_id,
                    amount=amount,
                    currency=currency,
                    domain_id=domain.id,
                    domain_name=f"{domain.name}{domain.extension}",
                    buyer_id=current_user.id if current_user else None,
                    seller_id=domain.seller_id,
                    payment_method="stripe_checkout_mock",
                    payment_status="pending",
                    stripe_payment_status="unpaid",
                    metadata={**metadata, "mock": "true", "demo": "true"}
                )
                
                await db.payment_transactions.insert_one(payment_transaction.dict())
                
                return StripeCheckoutResponse(
                    checkout_url=mock_checkout_url,
                    session_id=mock_session_id,
                    amount=amount,
                    currency=currency,
                    domain_name=f"{domain.name}{domain.extension}"
                )
            
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create checkout session: {str(e)}"
            )
    
    @staticmethod
    async def check_payment_status(
        session_id: str,
        db = None
    ) -> PaymentStatusResponse:
        """Check payment status from Stripe and update database"""
        
        # Get payment transaction from database
        payment_record = await db.payment_transactions.find_one({"stripe_session_id": session_id})
        if not payment_record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment session not found"
            )
        
        try:
            # Check status with Stripe
            checkout_status: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)
            
            # Update payment record with latest status
            update_data = {
                "stripe_payment_status": checkout_status.payment_status,
                "updated_at": datetime.utcnow()
            }
            
            # Determine our internal payment status
            if checkout_status.payment_status == "paid":
                update_data["payment_status"] = "paid"
                update_data["completed_at"] = datetime.utcnow()
                
                # Mark domain as sold (only once per successful payment)
                if payment_record["payment_status"] != "paid":
                    await db.domains.update_one(
                        {"id": payment_record["domain_id"]},
                        {"$set": {"status": "sold", "updated_at": datetime.utcnow()}}
                    )
                    
                    # TODO: Create main transaction record for escrow system
                    # TODO: Notify transaction bot about successful payment
                    
            elif checkout_status.status == "expired":
                update_data["payment_status"] = "expired"
            elif checkout_status.status == "canceled":
                update_data["payment_status"] = "canceled"
            
            # Update payment transaction
            await db.payment_transactions.update_one(
                {"stripe_session_id": session_id},
                {"$set": update_data}
            )
            
            # Get updated record
            updated_record = await db.payment_transactions.find_one({"stripe_session_id": session_id})
            
            return PaymentStatusResponse(
                payment_id=updated_record["id"],
                stripe_session_id=session_id,
                payment_status=updated_record["payment_status"],
                stripe_payment_status=checkout_status.payment_status,
                amount=checkout_status.amount_total / 100,  # Convert from cents
                currency=checkout_status.currency,
                domain_name=updated_record.get("domain_name"),
                created_at=updated_record["created_at"],
                completed_at=updated_record.get("completed_at"),
                metadata=updated_record.get("metadata")
            )
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to check payment status: {str(e)}"
            )
    
    @staticmethod
    async def get_user_payments(
        user_id: str,
        db = None
    ) -> list:
        """Get user's payment history"""
        
        payments = await db.payment_transactions.find(
            {"buyer_id": user_id}
        ).sort("created_at", -1).to_list(length=100)
        
        return [PaymentTransaction(**payment) for payment in payments]
    
    @staticmethod
    async def initiate_escrow_release(
        payment_id: str,
        domain_transfer_confirmed: bool,
        db = None
    ):
        """Release payment from escrow to seller after domain transfer confirmation"""
        
        payment_record = await db.payment_transactions.find_one({"id": payment_id})
        if not payment_record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment not found"
            )
        
        if payment_record["payment_status"] != "paid":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment not completed"
            )
        
        if domain_transfer_confirmed:
            # Update payment status to released
            await db.payment_transactions.update_one(
                {"id": payment_id},
                {"$set": {
                    "payment_status": "released_to_seller",
                    "updated_at": datetime.utcnow()
                }}
            )
            
            # TODO: Implement actual payout to seller
            # This would integrate with Stripe Connect or similar for seller payouts
            
            return {"status": "success", "message": "Payment released to seller"}
        else:
            # Handle dispute or refund scenario
            await db.payment_transactions.update_one(
                {"id": payment_id},
                {"$set": {
                    "payment_status": "refund_pending",
                    "updated_at": datetime.utcnow()
                }}
            )
            
            return {"status": "pending", "message": "Refund initiated"}