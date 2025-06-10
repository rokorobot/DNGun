from fastapi import APIRouter, Depends, Query
from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from ..models.domain import Domain, DomainCreate
from ..models.user import User
from ..controllers.domain_controller import (
    create_domain, 
    get_all_domains, 
    get_domain_by_id, 
    get_domain_by_name, 
    search_domains
)
from ..middleware.auth import get_current_active_user
from ..config.database import get_database

router = APIRouter(prefix="/domains", tags=["Domains"])

@router.post("", response_model=Domain)
async def add_domain(
    domain_data: DomainCreate, 
    current_user: User = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    return await create_domain(domain_data, current_user, db)

@router.get("", response_model=List[Domain])
async def list_domains(
    category: Optional[str] = None,
    status: Optional[str] = None,
    price_min: Optional[float] = Query(None, ge=0),
    price_max: Optional[float] = Query(None, ge=0),
    search: Optional[str] = None,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    return await get_all_domains(category, status, price_min, price_max, search, db)

@router.get("/search", response_model=List[Domain])
async def search_domain(
    q: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    return await search_domains(q, db)

@router.get("/{domain_id}", response_model=Domain)
async def get_domain(
    domain_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    return await get_domain_by_id(domain_id, db)

@router.get("/name/{name}/extension/{extension}", response_model=Domain)
async def get_domain_by_full_name(
    name: str,
    extension: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    return await get_domain_by_name(name, extension, db)
