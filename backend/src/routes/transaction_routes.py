from fastapi import APIRouter, Depends
from typing import List
from motor.motor_asyncio import AsyncIOMotorDatabase
from ..models.transaction import Transaction, TransactionCreate
from ..models.user import User
from ..controllers.transaction_controller import (
    create_transaction, 
    complete_transaction, 
    get_user_transactions
)
from ..middleware.auth import get_current_active_user
from ..config.database import get_database

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.post("", response_model=Transaction)
async def purchase_domain(
    transaction_data: TransactionCreate,
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_database)
):
    return await create_transaction(transaction_data, current_user, db)

@router.put("/{transaction_id}/complete", response_model=Transaction)
async def finalize_transaction(
    transaction_id: str,
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_database)
):
    return await complete_transaction(transaction_id, current_user, db)

@router.get("", response_model=List[Transaction])
async def get_transactions(
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_database)
):
    return await get_user_transactions(current_user, db)
