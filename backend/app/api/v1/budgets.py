from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from datetime import date
from typing import Optional
from app.core.database import get_db
from app.models.budget import Budget
from app.models.expenses import Expense

router = APIRouter()


class BudgetUpsert(BaseModel):
    category: str
    monthly_limit: float
    month: Optional[int] = None
    year: Optional[int] = None


@router.get("")
async def list_budgets(
    month: int = Query(default=None),
    year: int = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    today = date.today()
    m = month or today.month
    y = year or today.year
    q = select(Budget).where(Budget.month == m, Budget.year == y)
    res = await db.execute(q)
    rows = res.scalars().all()
    return [
        {
            "id": str(r.id),
            "category": r.category,
            "monthly_limit": r.monthly_limit,
            "month": r.month,
            "year": r.year,
        }
        for r in rows
    ]


@router.post("")
async def upsert_budget(body: BudgetUpsert, db: AsyncSession = Depends(get_db)):
    today = date.today()
    m = body.month or today.month
    y = body.year or today.year
    # Try to find existing
    q = select(Budget).where(
        Budget.category == body.category,
        Budget.month == m,
        Budget.year == y,
    )
    res = await db.execute(q)
    existing = res.scalar_one_or_none()
    if existing:
        existing.monthly_limit = body.monthly_limit
        await db.commit()
        await db.refresh(existing)
        row = existing
    else:
        row = Budget(
            category=body.category,
            monthly_limit=body.monthly_limit,
            month=m,
            year=y,
        )
        db.add(row)
        await db.commit()
        await db.refresh(row)
    return {
        "id": str(row.id),
        "category": row.category,
        "monthly_limit": row.monthly_limit,
        "month": row.month,
        "year": row.year,
    }


@router.get("/status")
async def budget_status(
    month: int = Query(default=None),
    year: int = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    today = date.today()
    m = month or today.month
    y = year or today.year

    # Get budgets for this month/year
    q_budgets = select(Budget).where(Budget.month == m, Budget.year == y)
    res = await db.execute(q_budgets)
    budgets = res.scalars().all()

    # Get spending by category for this month/year
    q_spent = (
        select(Expense.category, func.sum(Expense.amount))
        .where(
            func.extract("month", Expense.date) == m,
            func.extract("year", Expense.date) == y,
        )
        .group_by(Expense.category)
    )
    res_spent = await db.execute(q_spent)
    spent_map = {row[0]: float(row[1]) for row in res_spent.all()}

    result = []
    for b in budgets:
        spent = spent_map.get(b.category, 0.0)
        remaining = b.monthly_limit - spent
        pct = round((spent / b.monthly_limit) * 100, 1) if b.monthly_limit > 0 else 0.0
        if pct >= 100:
            status = "over"
        elif pct >= 80:
            status = "warning"
        else:
            status = "ok"
        result.append(
            {
                "category": b.category,
                "limit": b.monthly_limit,
                "spent": round(spent, 2),
                "remaining": round(remaining, 2),
                "pct": pct,
                "status": status,
            }
        )
    return result
