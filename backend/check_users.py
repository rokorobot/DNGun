import asyncio
import sys
from pathlib import Path

# Add current directory to Python path
sys.path.append(str(Path(__file__).parent))

from src.config.database import get_database, client

async def check_users():
    """Check what users exist in the database"""
    
    try:
        # Get database
        db = await get_database()
        
        # Get all users
        users = await db.users.find({}, {
            "_id": 0, 
            "username": 1, 
            "email": 1, 
            "full_name": 1,
            "created_at": 1,
            "is_active": 1
        }).to_list(length=50)
        
        print(f"Total users in database: {len(users)}")
        print("\nRegistered users:")
        print("-" * 60)
        
        for user in users:
            status = "Active" if user.get("is_active", False) else "Inactive"
            print(f"Username: {user.get('username', 'N/A'):<15} Email: {user.get('email', 'N/A'):<25} Status: {status}")
        
        # Check if specific email exists
        specific_user = await db.users.find_one({"email": "rokoroko@seznam.cz"})
        
        if specific_user:
            print(f"\n🔍 Found user with email rokoroko@seznam.cz:")
            print(f"   Username: {specific_user.get('username')}")
            print(f"   Full Name: {specific_user.get('full_name')}")
            print(f"   Active: {specific_user.get('is_active')}")
            print(f"   Created: {specific_user.get('created_at')}")
        else:
            print(f"\n❌ No user found with email rokoroko@seznam.cz")
            
    except Exception as e:
        print(f"Error checking users: {e}")
    
    finally:
        # Close database connection
        if client:
            client.close()

if __name__ == "__main__":
    asyncio.run(check_users())