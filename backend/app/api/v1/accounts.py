from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from app.core.database import get_db
from app.models.accounts import Account

router = APIRouter()

class AccountCreate(BaseModel):
    name: str
    balance: float = 0.0

@router.post("")
async def create_account(body: AccountCreate, db: AsyncSession = Depends(get_db)):
    acc = Account(name=body.name, balance=body.balance)
    db.add(acc)
    await db.commit()
    await db.refresh(acc)
    return {"id": str(acc.id), "name": acc.name, "balance": acc.balance}

@router.get("")
async def list_accounts(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Account).order_by(Account.created_at.desc()))
    rows = res.scalars().all()
    return [{"id": str(r.id), "name": r.name, "balance": r.balance} for r in rows]
