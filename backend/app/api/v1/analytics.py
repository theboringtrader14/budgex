"""BUDGEX Analytics — AI insights via Gemma 4."""
import logging
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import date
from app.core.database import get_db
from app.models.expenses import Expense

logger = logging.getLogger(__name__)
router = APIRouter()

MODEL = "gemma-4-31b-it"
_client = None


def _get_client():
    global _client
    if _client is None:
        import os
        key = os.getenv("GOOGLE_AI_API_KEY", "")
        if not key:
            return None
        try:
            from google import genai
            _client = genai.Client(api_key=key)
        except Exception as e:
            logger.warning(f"[analytics] genai client init failed: {e}")
            return None
    return _client


@router.get("/insights")
async def get_insights(db: AsyncSession = Depends(get_db)):
    today = date.today()
    m = today.month
    y = today.year

    # This month spend
    res = await db.execute(
        select(func.sum(Expense.amount)).where(
            func.extract("month", Expense.date) == m,
            func.extract("year", Expense.date) == y,
        )
    )
    this_month = float(res.scalar() or 0)

    # Last month spend
    lm = m - 1 if m > 1 else 12
    ly = y if m > 1 else y - 1
    res2 = await db.execute(
        select(func.sum(Expense.amount)).where(
            func.extract("month", Expense.date) == lm,
            func.extract("year", Expense.date) == ly,
        )
    )
    last_month = float(res2.scalar() or 0)

    # Top category this month
    res3 = await db.execute(
        select(Expense.category, func.sum(Expense.amount).label("total"))
        .where(
            func.extract("month", Expense.date) == m,
            func.extract("year", Expense.date) == y,
        )
        .group_by(Expense.category)
        .order_by(func.sum(Expense.amount).desc())
        .limit(1)
    )
    row = res3.first()
    top_cat = row[0] if row else "None"
    top_cat_amt = float(row[1]) if row else 0

    MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    context = (
        f"This month ({MONTHS[m-1]} {y}): ₹{this_month:,.0f} spent. "
        f"Last month ({MONTHS[lm-1]} {ly}): ₹{last_month:,.0f} spent. "
        f"Top category this month: {top_cat} at ₹{top_cat_amt:,.0f}."
    )

    client = _get_client()
    if client is None:
        return {"insight": f"Your spending this month is on track. {context}"}

    prompt = (
        "You are LIFEX, a personal finance AI for Karthikeyan. "
        "Give a 1-2 sentence insight about his spending. "
        "Be warm, direct, specific with rupee numbers. No markdown.\n\n"
        f"Data: {context}"
    )
    try:
        from google.genai import types
        response = client.models.generate_content(
            model=MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                max_output_tokens=120,
                temperature=0.4,
            ),
        )
        return {"insight": response.text.strip()}
    except Exception as e:
        logger.warning(f"[analytics] Gemma call failed: {e}")
        return {"insight": f"Your spending this month is on track. {context}"}
