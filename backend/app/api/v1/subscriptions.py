from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from datetime import date
from typing import Optional
from app.core.database import get_db
from app.models.subscriptions import Subscription

router = APIRouter()

class SubscriptionCreate(BaseModel):
    name: str
    amount: float
    cycle: str = 'monthly'
    next_due_date: Optional[date] = None

@router.post("")
async def create_subscription(body: SubscriptionCreate, db: AsyncSession = Depends(get_db)):
    sub = Subscription(name=body.name, amount=body.amount, cycle=body.cycle, next_due_date=body.next_due_date)
    db.add(sub)
    await db.commit()
    await db.refresh(sub)
    return {"id": str(sub.id), "name": sub.name, "amount": sub.amount, "cycle": sub.cycle, "next_due_date": str(sub.next_due_date) if sub.next_due_date else None}

@router.get("")
async def list_subscriptions(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Subscription).order_by(Subscription.next_due_date.asc()))
    rows = res.scalars().all()
    return [{"id": str(r.id), "name": r.name, "amount": r.amount, "cycle": r.cycle, "next_due_date": str(r.next_due_date) if r.next_due_date else None} for r in rows]
