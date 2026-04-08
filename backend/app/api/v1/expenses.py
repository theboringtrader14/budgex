from fastapi import APIRouter, Depends, Query
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


@router.get("/trends")
async def expense_trends(months: int = Query(default=6, ge=1, le=24), db: AsyncSession = Depends(get_db)):
    """Return last N months of spending totals grouped by category."""
    import calendar
    today = date.today()
    result = []
    for i in range(months - 1, -1, -1):
        # Compute year/month offset
        total_month = today.month - i
        yr = today.year
        while total_month <= 0:
            total_month += 12
            yr -= 1
        m = total_month
        MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        label = f"{MONTHS_SHORT[m - 1]} {yr}"

        # Total spend
        res_total = await db.execute(
            select(func.sum(Expense.amount)).where(
                func.extract("month", Expense.date) == m,
                func.extract("year", Expense.date) == yr,
            )
        )
        total = float(res_total.scalar() or 0)

        # By category
        res_cat = await db.execute(
            select(Expense.category, func.sum(Expense.amount))
            .where(
                func.extract("month", Expense.date) == m,
                func.extract("year", Expense.date) == yr,
            )
            .group_by(Expense.category)
        )
        by_category = {row[0]: float(row[1]) for row in res_cat.all()}

        result.append({
            "month": m,
            "year": yr,
            "label": label,
            "total": round(total, 2),
            "by_category": by_category,
        })
    return result


@router.get("/merchants")
async def top_merchants(
    limit: int = Query(default=5, ge=1, le=50),
    month: int = Query(default=None),
    year: int = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    """Return top N merchants (by description) for the given month/year."""
    today = date.today()
    m = month or today.month
    y = year or today.year

    q = (
        select(
            Expense.description,
            Expense.category,
            func.sum(Expense.amount).label("total"),
            func.count(Expense.id).label("count"),
        )
        .where(
            Expense.description.isnot(None),
            func.extract("month", Expense.date) == m,
            func.extract("year", Expense.date) == y,
        )
        .group_by(Expense.description, Expense.category)
        .order_by(func.sum(Expense.amount).desc())
        .limit(limit)
    )
    res = await db.execute(q)
    rows = res.all()
    return [
        {
            "description": r[0],
            "category": r[1],
            "total": round(float(r[2]), 2),
            "count": r[3],
        }
        for r in rows
    ]
