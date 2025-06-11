from fastapi import APIRouter, Depends, HTTPException
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
from ..controllers.two_factor_controller import verify_two_factor, verify_backup_code
from ..middleware.auth import get_current_active_user, require_2fa_verification
from ..config.database import get_database
from pydantic import BaseModel

router = APIRouter(prefix="/transactions", tags=["Transactions"])

class TransactionStatusUpdate(BaseModel):
    status: str
    message: str = None

class ChatMessage(BaseModel):
    message: str
    sender_type: str = "user"  # user, bot, system

class TransactionWith2FA(BaseModel):
    domain_id: str
    amount: float
    payment_method: str = "escrow_transfer"
    totp_code: str = None
    backup_code: str = None

async def verify_2fa_for_transaction(user: User, totp_code: str, backup_code: str, db):
    """Verify 2FA for transaction if enabled"""
    if await require_2fa_verification(user.id, db):
        if totp_code:
            is_valid = await verify_two_factor(user, totp_code, db)
        elif backup_code:
            is_valid = await verify_backup_code(user, backup_code, db)
        else:
            raise HTTPException(
                status_code=400, 
                detail="2FA verification required. Please provide TOTP code or backup code."
            )
        
        if not is_valid:
            raise HTTPException(status_code=400, detail="Invalid 2FA code")
    
    return True

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
