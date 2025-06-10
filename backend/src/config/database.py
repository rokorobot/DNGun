from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
ROOT_DIR = Path(__file__).parent.parent.parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'dngun_db')

# Database connection instance
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Dependency to get the database
async def get_database() -> AsyncIOMotorDatabase:
    return db

async def close_mongo_connection():
    client.close()
