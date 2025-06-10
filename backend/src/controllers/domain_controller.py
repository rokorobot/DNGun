from fastapi import HTTPException, status, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Optional
from ..models.domain import Domain, DomainCreate
from ..models.user import User
from ..config.database import get_database
from datetime import datetime

async def create_domain(domain_data: DomainCreate, current_user: User, db: AsyncIOMotorDatabase = Depends(get_database)):
    # Check if domain already exists
    existing_domain = await db.domains.find_one({"name": domain_data.name, "extension": domain_data.extension})
    if existing_domain:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Domain already exists"
        )
    
    # Create new domain
    domain = Domain(
        name=domain_data.name,
        extension=domain_data.extension,
        price=domain_data.price,
        category=domain_data.category,
        seller_id=current_user.id,
        description=domain_data.description
    )
    
    # Insert domain into database
    await db.domains.insert_one(domain.dict())
    
    # Update user's domains_for_sale list
    await db.users.update_one(
        {"id": current_user.id},
        {"$push": {"domains_for_sale": domain.id}}
    )
    
    return domain

async def get_all_domains(
    category: Optional[str] = None, 
    status: Optional[str] = None,
    price_min: Optional[float] = None,
    price_max: Optional[float] = None,
    search_query: Optional[str] = None,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    # Build query
    query = {}
    
    if category:
        query["category"] = category
    
    if status:
        query["status"] = status
    
    if price_min is not None or price_max is not None:
        price_query = {}
        if price_min is not None:
            price_query["$gte"] = price_min
        if price_max is not None:
            price_query["$lte"] = price_max
        query["price"] = price_query
    
    if search_query:
        query["name"] = {"$regex": search_query, "$options": "i"}
    
    # Query database
    domains_cursor = db.domains.find(query)
    domains = await domains_cursor.to_list(length=100)
    
    return [Domain(**domain) for domain in domains]

async def get_domain_by_id(domain_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    domain_data = await db.domains.find_one({"id": domain_id})
    if not domain_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Domain not found"
        )
    
    # Increment view count
    await db.domains.update_one(
        {"id": domain_id},
        {"$inc": {"views": 1}, "$set": {"updated_at": datetime.utcnow()}}
    )
    
    domain_data = await db.domains.find_one({"id": domain_id})
    return Domain(**domain_data)

async def get_domain_by_name(name: str, extension: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    domain_data = await db.domains.find_one({
        "name": name.lower(),
        "extension": extension.lower()
    })
    
    if not domain_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Domain not found"
        )
    
    # Increment view count
    await db.domains.update_one(
        {"id": domain_data["id"]},
        {"$inc": {"views": 1}, "$set": {"updated_at": datetime.utcnow()}}
    )
    
    domain_data = await db.domains.find_one({"id": domain_data["id"]})
    return Domain(**domain_data)

async def search_domains(query: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    # Search for exact matches first
    domains = []
    
    # Try to match the domain name exactly
    name_parts = query.split('.')
    if len(name_parts) > 1:
        domain_name = '.'.join(name_parts[:-1])
        extension = f".{name_parts[-1]}"
        
        exact_match = await db.domains.find_one({
            "name": domain_name.lower(),
            "extension": extension.lower()
        })
        
        if exact_match:
            domains.append(Domain(**exact_match))
    
    # Then look for partial matches
    search_query = {"name": {"$regex": query, "$options": "i"}}
    partial_matches = await db.domains.find(search_query).to_list(length=20)
    
    # Add partial matches that aren't already in the results
    for match in partial_matches:
        if not any(d.id == match["id"] for d in domains):
            domains.append(Domain(**match))
    
    # Generate suggestions if no results or few results
    if len(domains) < 5:
        # Generate domains with different extensions
        extensions = [".com", ".net", ".org", ".io", ".co"]
        base_name = query.split('.')[0].lower()
        
        for ext in extensions:
            suggestion = await db.domains.find_one({
                "name": base_name,
                "extension": ext
            })
            
            if suggestion and not any(d.id == suggestion["id"] for d in domains):
                domains.append(Domain(**suggestion))
    
    return domains
