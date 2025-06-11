from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path

# Import configuration
from src.config.database import client, get_database, close_mongo_connection

# Import routes
from src.routes.auth_routes import router as auth_router
from src.routes.domain_routes import router as domain_router
from src.routes.transaction_routes import router as transaction_router
from src.routes.user_routes import router as user_router

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create the main app without a prefix
app = FastAPI(
    title="DNGun API",
    description="Backend API for DNGun.com Domain Marketplace",
    version="1.0.0"
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Include all the routers
api_router.include_router(auth_router)
api_router.include_router(domain_router)
api_router.include_router(transaction_router)
api_router.include_router(user_router)

# Include the router in the main app
app.include_router(api_router)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Startup and shutdown events
@app.on_event("startup")
async def startup_db_client():
    logger.info("Connecting to MongoDB...")

@app.on_event("shutdown")
async def shutdown_db_client():
    logger.info("Closing MongoDB connection...")
    client.close()

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Welcome to DNGun API",
        "docs": "/docs",
        "api_prefix": "/api"
    }

# Test endpoint
@app.get("/test")
async def test():
    return {"message": "Test endpoint is working"}
