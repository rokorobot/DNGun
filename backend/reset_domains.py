import asyncio
import sys
from pathlib import Path

# Add current directory to Python path
sys.path.append(str(Path(__file__).parent))

from src.config.database import get_database, client
from datetime import datetime

async def reset_domains_to_available():
    """Reset some domains back to available status for testing"""
    
    try:
        # Get database
        db = await get_database()
        
        # Reset specific domains to available for testing
        domains_to_reset = ["digitalspace", "webcreator", "shopease", "techstart"]
        
        for domain_name in domains_to_reset:
            result = await db.domains.update_one(
                {"name": domain_name},
                {"$set": {"status": "available", "updated_at": datetime.utcnow()}}
            )
            if result.modified_count > 0:
                print(f"✅ Reset {domain_name} to available")
            else:
                print(f"⚠️ Domain {domain_name} not found or already available")
        
        # Clear any existing payment transactions to avoid conflicts
        await db.payment_transactions.delete_many({})
        print("🧹 Cleared ALL payment transactions")
        
        # Get count of available domains
        available_count = await db.domains.count_documents({"status": "available"})
        total_count = await db.domains.count_documents({})
        
        print(f"\n📊 Domain Status Summary:")
        print(f"Total domains: {total_count}")
        print(f"Available domains: {available_count}")
        
        # Show featured available domains
        print("\n🌟 Featured available domains:")
        featured_available = await db.domains.find({
            "featured": True, 
            "status": "available"
        }).limit(10).to_list(length=10)
        
        for domain in featured_available:
            print(f"  ✅ {domain['name']}{domain['extension']} - ${domain['price']} - {domain['status']}")
            
    except Exception as e:
        print(f"❌ Error resetting domains: {e}")
    
    finally:
        # Close database connection
        if client:
            client.close()

if __name__ == "__main__":
    asyncio.run(reset_domains_to_available())