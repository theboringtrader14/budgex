"""BUDGEX Analytics — AI insights via Gemma 4."""
# REQUIRED: Add GOOGLE_AI_API_KEY=<your-key> to .env to enable Gemma AI insights
# Without it, insights fall back to rule-based analysis from real DB data (still useful)
# Get key from: https://aistudio.google.com/app/apikey
import logging
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import date, timedelta
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
    since = today - timedelta(days=30)

    # Fetch last 30 days of expenses grouped by category
    res = await db.execute(
        select(Expense.category, func.sum(Expense.amount).label("total"))
        .where(Expense.date >= since, Expense.date <= today)
        .group_by(Expense.category)
        .order_by(func.sum(Expense.amount).desc())
    )
    rows = res.all()

    # Build category summary string
    if rows:
        cat_lines = ", ".join(
            f"{row[0]}: ₹{float(row[1]):,.0f}" for row in rows
        )
        total_30d = sum(float(row[1]) for row in rows)
        data_summary = (
            f"Last 30 days total spend: ₹{total_30d:,.0f}. "
            f"By category — {cat_lines}."
        )
    else:
        data_summary = "No expenses recorded in the last 30 days."

    # Fallback insights (used when Gemma is unavailable)
    fallback = _build_fallback_insights(rows)

    client = _get_client()
    if client is None:
        return {"insights": fallback}

    prompt = (
        "You are LIFEX, a personal finance AI. "
        "Here are the last 30 days of expenses by category: "
        f"{data_summary} "
        "Give exactly 3 bullet-point insights about spending patterns. "
        "Each insight must be a single sentence. "
        "Be specific with rupee amounts. No markdown, no bullet symbols — "
        "return each insight as a plain sentence on its own line."
    )

    try:
        from google.genai import types
        response = client.models.generate_content(
            model=MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                max_output_tokens=200,
                temperature=0.4,
            ),
        )
        raw = response.text.strip()
        # Split into list of non-empty lines, take up to 3
        lines = [ln.strip().lstrip("-•* ").strip() for ln in raw.splitlines()]
        insights = [ln for ln in lines if ln][:3]
        # Pad with fallback if Gemma returned fewer than 3 lines
        if len(insights) < 3:
            insights += fallback[len(insights):3]
        return {"insights": insights}
    except Exception as e:
        logger.warning(f"[analytics] Gemma call failed: {e}")
        return {"insights": fallback}


def _build_fallback_insights(rows) -> list:
    """Generate basic rule-based insights when AI is unavailable."""
    if not rows:
        return [
            "No expenses recorded in the last 30 days.",
            "Start tracking your spending to see insights here.",
            "Add your first expense to get personalised analysis.",
        ]

    total = sum(float(r[1]) for r in rows)
    top_cat = rows[0][0]
    top_amt = float(rows[0][1])
    top_pct = round((top_amt / total) * 100) if total > 0 else 0

    insights = [
        f"Your total spend over the last 30 days is ₹{total:,.0f}.",
        f"{top_cat} is your top spending category at ₹{top_amt:,.0f} ({top_pct}% of total).",
    ]
    if len(rows) >= 2:
        second_cat = rows[1][0]
        second_amt = float(rows[1][1])
        insights.append(
            f"{second_cat} is your second highest category at ₹{second_amt:,.0f}."
        )
    else:
        insights.append("Track more categories to get a fuller picture of your spending.")

    return insights
