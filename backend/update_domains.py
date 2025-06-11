import asyncio
import sys
from pathlib import Path

# Add current directory to Python path
sys.path.append(str(Path(__file__).parent))

from src.config.database import get_database, client
from datetime import datetime

async def update_domain_statuses():
    """Update domain statuses to make them available for purchase"""
    
    try:
        # Get database
        db = await get_database()
        
        # Update all domains with status "pending" to "available"
        result = await db.domains.update_many(
            {"status": "pending"},
            {"$set": {"status": "available", "updated_at": datetime.utcnow()}}
        )
        
        print(f"Updated {result.modified_count} domains from 'pending' to 'available'")
        
        # Update a few specific featured domains to ensure they're available
        featured_domains = ["webcreator", "digitalspace", "shopease", "techstart", "smartbiz"]
        
        for domain_name in featured_domains:
            result = await db.domains.update_one(
                {"name": domain_name},
                {"$set": {"status": "available", "updated_at": datetime.utcnow()}}
            )
            if result.modified_count > 0:
                print(f"Updated {domain_name} to available")
        
        # Get a count of available domains
        available_count = await db.domains.count_documents({"status": "available"})
        total_count = await db.domains.count_documents({})
        
        print(f"Total domains: {total_count}")
        print(f"Available domains: {available_count}")
        
        # Show some examples
        print("\nFeatured available domains:")
        featured_available = await db.domains.find({
            "featured": True, 
            "status": "available"
        }).limit(5).to_list(length=5)
        
        for domain in featured_available:
            print(f"  {domain['name']}{domain['extension']} - ${domain['price']} - {domain['status']}")
            
    except Exception as e:
        print(f"Error updating domains: {e}")
    
    finally:
        # Close database connection
        if client:
            client.close()

if __name__ == "__main__":
    asyncio.run(update_domain_statuses())