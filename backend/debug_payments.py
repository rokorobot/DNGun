import asyncio
import sys
from pathlib import Path

# Add current directory to Python path
sys.path.append(str(Path(__file__).parent))

from src.config.database import get_database, client

async def debug_payment_records():
    """Debug payment records in the database"""
    
    try:
        # Get database
        db = await get_database()
        
        # Get all payment transactions for debugging
        payments = await db.payment_transactions.find({}).to_list(length=50)
        
        print(f"📊 Total payment transactions: {len(payments)}")
        print()
        
        for payment in payments:
            print(f"🎫 Session ID: {payment.get('stripe_session_id')}")
            print(f"   Payment Status: {payment.get('payment_status')}")
            print(f"   Stripe Status: {payment.get('stripe_payment_status')}")
            print(f"   Domain: {payment.get('domain_name')}")
            print(f"   Amount: ${payment.get('amount')}")
            print(f"   Created: {payment.get('created_at')}")
            print(f"   Updated: {payment.get('updated_at')}")
            print(f"   Completed: {payment.get('completed_at')}")
            print(f"   Payment ID: {payment.get('id')}")
            print("   ---")
        
        # Check for specific session
        specific_session = "cs_test_mock_1f403463"
        specific_payment = await db.payment_transactions.find_one({"stripe_session_id": specific_session})
        
        if specific_payment:
            print(f"🔍 Found specific session {specific_session}:")
            print(f"   Status: {specific_payment.get('payment_status')}")
            print(f"   Updated At: {specific_payment.get('updated_at')}")
            print(f"   Completed At: {specific_payment.get('completed_at')}")
        else:
            print(f"❌ No payment found for session {specific_session}")
            
    except Exception as e:
        print(f"❌ Error debugging payments: {e}")
    
    finally:
        # Close database connection
        if client:
            client.close()

if __name__ == "__main__":
    asyncio.run(debug_payment_records())