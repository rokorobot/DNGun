from fastapi import HTTPException, status, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
from ..models.transaction import Transaction, TransactionCreate
from ..models.user import User
from ..config.database import get_database
from datetime import datetime

async def create_transaction(
    transaction_data: TransactionCreate, 
    current_user: User, 
    db
):
    # Check if domain exists
    domain = await db.domains.find_one({"id": transaction_data.domain_id})
    if not domain:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Domain not found"
        )
    
    # Check if domain is available
    if domain["status"] != "available":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Domain is not available for purchase"
        )
    
    # Check if user is not buying their own domain
    if domain["seller_id"] == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot buy your own domain"
        )
    
    # Calculate transaction fee (10%)
    transaction_fee = round(transaction_data.amount * 0.1, 2)
    
    # Create transaction
    transaction = Transaction(
        domain_id=transaction_data.domain_id,
        buyer_id=current_user.id,
        seller_id=domain["seller_id"],
        amount=transaction_data.amount,
        payment_method=transaction_data.payment_method,
        transaction_fee=transaction_fee
    )
    
    # Insert transaction into database
    await db.transactions.insert_one(transaction.dict())
    
    # Update domain status
    await db.domains.update_one(
        {"id": transaction_data.domain_id},
        {"$set": {"status": "pending", "updated_at": datetime.utcnow()}}
    )
    
    return transaction

async def complete_transaction(
    transaction_id: str, 
    current_user: User, 
    db
):
    # Get transaction
    transaction_data = await db.transactions.find_one({"id": transaction_id})
    if not transaction_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    # Check if user is the seller
    if transaction_data["seller_id"] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to complete this transaction"
        )
    
    # Check if transaction is pending
    if transaction_data["status"] != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Transaction is not in pending status"
        )
    
    # Update transaction status
    await db.transactions.update_one(
        {"id": transaction_id},
        {"$set": {"status": "completed"}}
    )
    
    # Update domain status and owner
    await db.domains.update_one(
        {"id": transaction_data["domain_id"]},
        {"$set": {
            "status": "sold", 
            "updated_at": datetime.utcnow()
        }}
    )
    
    # Update seller's domains_for_sale list
    await db.users.update_one(
        {"id": transaction_data["seller_id"]},
        {"$pull": {"domains_for_sale": transaction_data["domain_id"]}}
    )
    
    # Update buyer's domains_owned list
    await db.users.update_one(
        {"id": transaction_data["buyer_id"]},
        {"$push": {"domains_owned": transaction_data["domain_id"]}}
    )
    
    # Get updated transaction
    updated_transaction = await db.transactions.find_one({"id": transaction_id})
    return Transaction(**updated_transaction)

async def get_user_transactions(current_user: User, db):
    # Get transactions where user is buyer or seller
    transactions_cursor = db.transactions.find({
        "$or": [
            {"buyer_id": current_user.id},
            {"seller_id": current_user.id}
        ]
    })
    
    transactions = await transactions_cursor.to_list(length=100)
    return [Transaction(**transaction) for transaction in transactions]