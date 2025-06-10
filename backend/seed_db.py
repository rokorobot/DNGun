import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
from datetime import datetime
import uuid
from src.utils.security import get_password_hash

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'dngun_db')

# Database connection
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Sample data
users = [
    {
        "id": str(uuid.uuid4()),
        "email": "admin@dngun.com",
        "username": "admin",
        "full_name": "Admin User",
        "hashed_password": get_password_hash("admin123"),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "is_active": True,
        "is_verified": True,
        "domains_owned": [],
        "domains_for_sale": []
    },
    {
        "id": str(uuid.uuid4()),
        "email": "seller@dngun.com",
        "username": "seller",
        "full_name": "Domain Seller",
        "hashed_password": get_password_hash("seller123"),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "is_active": True,
        "is_verified": True,
        "domains_owned": [],
        "domains_for_sale": []
    },
    {
        "id": str(uuid.uuid4()),
        "email": "buyer@dngun.com",
        "username": "buyer",
        "full_name": "Domain Buyer",
        "hashed_password": get_password_hash("buyer123"),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "is_active": True,
        "is_verified": True,
        "domains_owned": [],
        "domains_for_sale": []
    }
]

# Create domain data (based on our frontend mock data)
domain_data = [
    # Featured domains
    {
        "name": "webcreator",
        "extension": ".com",
        "price": 5999,
        "category": "premium",
        "featured": True,
    },
    {
        "name": "digitalspace",
        "extension": ".co",
        "price": 2499,
        "category": "premium",
        "featured": True,
    },
    {
        "name": "shopease",
        "extension": ".com",
        "price": 3999,
        "category": "premium",
        "featured": True,
    },
    {
        "name": "techstart",
        "extension": ".io",
        "price": 1899,
        "category": "premium",
        "featured": True,
    },
    {
        "name": "promarketing",
        "extension": ".com",
        "price": 4599,
        "category": "premium",
        "featured": True,
    },
    {
        "name": "cryptohub",
        "extension": ".io",
        "price": 2799,
        "category": "premium",
        "featured": True,
    },
    
    # Three-letter domains
    {
        "name": "abc",
        "extension": ".com",
        "price": 8999,
        "category": "three-letter",
    },
    {
        "name": "xyz",
        "extension": ".com",
        "price": 7499,
        "category": "three-letter",
    },
    {
        "name": "pqr",
        "extension": ".com",
        "price": 6799,
        "category": "three-letter",
    },
    {
        "name": "def",
        "extension": ".com",
        "price": 9199,
        "category": "three-letter",
    },
    {
        "name": "mno",
        "extension": ".co",
        "price": 4299,
        "category": "three-letter",
    },
    {
        "name": "jkl",
        "extension": ".io",
        "price": 3699,
        "category": "three-letter",
    },
    
    # Premium domains
    {
        "name": "digitalmarketing",
        "extension": ".com",
        "price": 12999,
        "category": "premium",
    },
    {
        "name": "investmentfirm",
        "extension": ".com",
        "price": 9499,
        "category": "premium",
    },
    {
        "name": "onlinecourses",
        "extension": ".com",
        "price": 17999,
        "category": "premium",
    },
    {
        "name": "cybersecurity",
        "extension": ".co",
        "price": 7999,
        "category": "premium",
    },
    {
        "name": "ecommerceplatform",
        "extension": ".com",
        "price": 14599,
        "category": "premium",
    },
    {
        "name": "smarttechnology",
        "extension": ".io",
        "price": 8899,
        "category": "premium",
    },
    
    # Additional domains for search testing
    {
        "name": "tech",
        "extension": ".com",
        "price": 25000,
        "category": "premium",
    },
    {
        "name": "techbusiness",
        "extension": ".com",
        "price": 4500,
        "category": "premium",
    },
    {
        "name": "techbusiness",
        "extension": ".io",
        "price": 2500,
        "category": "standard",
    },
    {
        "name": "techbusiness",
        "extension": ".net",
        "price": 1800,
        "category": "standard",
    },
    {
        "name": "mytechbusiness",
        "extension": ".com",
        "price": 3200,
        "category": "standard",
    },
    {
        "name": "techbusinessonline",
        "extension": ".com",
        "price": 2800,
        "category": "standard",
    }
]

async def seed_database():
    # Clear existing data
    await db.users.delete_many({})
    await db.domains.delete_many({})
    await db.transactions.delete_many({})
    
    print("Cleared existing data")
    
    # Insert users
    user_ids = {}
    for user in users:
        result = await db.users.insert_one(user)
        user_ids[user["username"]] = user["id"]
        print(f"Inserted user: {user['username']}")
    
    # Create domains
    domains = []
    seller_id = user_ids["seller"]
    
    for domain_info in domain_data:
        domain = {
            "id": str(uuid.uuid4()),
            "name": domain_info["name"],
            "extension": domain_info["extension"],
            "price": domain_info["price"],
            "category": domain_info["category"],
            "status": "available",
            "seller_id": seller_id,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "featured": domain_info.get("featured", False),
            "description": f"Premium {domain_info['name']} domain with {domain_info['extension']} extension",
            "views": 0
        }
        domains.append(domain)
    
    # Insert domains
    domain_ids = []
    for domain in domains:
        result = await db.domains.insert_one(domain)
        domain_ids.append(domain["id"])
        print(f"Inserted domain: {domain['name']}{domain['extension']}")
    
    # Update seller's domains_for_sale
    await db.users.update_one(
        {"id": seller_id},
        {"$set": {"domains_for_sale": domain_ids}}
    )
    print(f"Updated seller's domains_for_sale with {len(domain_ids)} domains")
    
    print("Database seeding completed!")

# Run the async function
if __name__ == "__main__":
    asyncio.run(seed_database())
