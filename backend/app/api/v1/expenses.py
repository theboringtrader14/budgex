from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from datetime import date
from typing import Optional
from app.core.database import get_db
from app.models.expenses import Expense
from app.core.auth import verify_token

router = APIRouter()

class ExpenseCreate(BaseModel):
    amount: float
    category: str = 'Others'
    description: Optional[str] = None
    date: Optional[date] = None
    account_id: Optional[str] = None

@router.post("")
async def create_expense(body: ExpenseCreate, db: AsyncSession = Depends(get_db), _: None = Depends(verify_token)):
    exp = Expense(
        amount=body.amount,
        category=body.category,
        description=body.description,
        date=body.date or date.today(),
    )
    db.add(exp)
    await db.commit()
    await db.refresh(exp)
    return {"id": str(exp.id), "amount": exp.amount, "category": exp.category, "description": exp.description, "date": str(exp.date)}

@router.get("")
async def list_expenses(limit: int = 50, expense_date: Optional[date] = None, category: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    q = select(Expense).order_by(Expense.date.desc(), Expense.created_at.desc()).limit(limit)
    if expense_date:
        q = q.where(Expense.date == expense_date)
    if category:
        q = q.where(Expense.category == category)
    res = await db.execute(q)
    rows = res.scalars().all()
    return [{"id": str(r.id), "amount": r.amount, "category": r.category, "description": r.description, "date": str(r.date)} for r in rows]

@router.get("/summary")
async def summary(db: AsyncSession = Depends(get_db)):
    today = date.today()
    # Today total
    res = await db.execute(select(func.sum(Expense.amount)).where(Expense.date == today))
    today_total = float(res.scalar() or 0)
    # Monthly total
    res = await db.execute(select(func.sum(Expense.amount)).where(func.extract('month', Expense.date) == today.month, func.extract('year', Expense.date) == today.year))
    monthly_total = float(res.scalar() or 0)
    # By category
    res = await db.execute(select(Expense.category, func.sum(Expense.amount)).group_by(Expense.category))
    by_category = {row[0]: float(row[1]) for row in res.all()}
    # Recent 5
    res = await db.execute(select(Expense).order_by(Expense.created_at.desc()).limit(5))
    recent = res.scalars().all()
    recent5 = [{"id": str(r.id), "amount": r.amount, "category": r.category, "description": r.description, "date": str(r.date)} for r in recent]
    return {"today": today_total, "monthly": monthly_total, "by_category": by_category, "recent5": recent5}
