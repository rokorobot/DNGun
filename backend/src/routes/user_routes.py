from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
from ..models.user import User, UserPublic
from ..models.domain import Domain
from ..middleware.auth import get_current_active_user
from ..config.database import get_database

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=UserPublic)
async def get_current_user_info(
    current_user: User = Depends(get_current_active_user)
):
    return UserPublic(
        id=current_user.id,
        email=current_user.email,
        username=current_user.username,
        full_name=current_user.full_name,
        created_at=current_user.created_at
    )

@router.get("/me/domains", response_model=List[Domain])
async def get_my_domains(
    current_user: User = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    # Get domains owned by the user
    domains_cursor = db.domains.find({
        "$or": [
            {"id": {"$in": current_user.domains_owned}},
            {"id": {"$in": current_user.domains_for_sale}}
        ]
    })
    
    domains = await domains_cursor.to_list(length=100)
    return [Domain(**domain) for domain in domains]

@router.get("/me/domains/selling", response_model=List[Domain])
async def get_domains_for_sale(
    current_user: User = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    # Get domains listed for sale by the user
    domains_cursor = db.domains.find({
        "id": {"$in": current_user.domains_for_sale}
    })
    
    domains = await domains_cursor.to_list(length=100)
    return [Domain(**domain) for domain in domains]

@router.get("/me/domains/owned", response_model=List[Domain])
async def get_domains_owned(
    current_user: User = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    # Get domains owned by the user
    domains_cursor = db.domains.find({
        "id": {"$in": current_user.domains_owned}
    })
    
    domains = await domains_cursor.to_list(length=100)
    return [Domain(**domain) for domain in domains]
