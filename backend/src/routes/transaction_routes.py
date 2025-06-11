from fastapi import APIRouter, Depends
from typing import List
from motor.motor_asyncio import AsyncIOMotorDatabase
from ..models.transaction import Transaction, TransactionCreate
from ..models.user import User
from ..controllers.transaction_controller import (
    create_transaction, 
    complete_transaction, 
    get_user_transactions,
    update_transaction_status,
    add_transaction_chat_message,
    get_transaction_chat_messages
)
from ..middleware.auth import get_current_active_user
from ..config.database import get_database
from pydantic import BaseModel

router = APIRouter(prefix="/transactions", tags=["Transactions"])

class TransactionStatusUpdate(BaseModel):
    status: str
    message: str = None

class ChatMessage(BaseModel):
    message: str
    sender_type: str = "user"  # user, bot, system

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

@router.put("/{transaction_id}/status")
async def update_status(
    transaction_id: str,
    status_update: TransactionStatusUpdate,
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_database)
):
    return await update_transaction_status(transaction_id, status_update.status, current_user, db)

@router.post("/{transaction_id}/chat")
async def add_chat_message(
    transaction_id: str,
    chat_message: ChatMessage,
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_database)
):
    return await add_transaction_chat_message(transaction_id, chat_message, current_user, db)

@router.get("/{transaction_id}/chat")
async def get_chat_messages(
    transaction_id: str,
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_database)
):
    return await get_transaction_chat_messages(transaction_id, current_user, db)

@router.get("", response_model=List[Transaction])
async def get_transactions(
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_database)
):
    return await get_user_transactions(current_user, db)
