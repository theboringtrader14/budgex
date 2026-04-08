"""BUDGEX — Expense Tracking API. Port 8002."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.database import create_all_tables
from app.api.v1 import expenses, accounts, subscriptions, parse, budgets, analytics
# Import models so SQLAlchemy registers them before create_all_tables
from app.models import expenses as _exp_model  # noqa: F401
from app.models import accounts as _acc_model  # noqa: F401
from app.models import subscriptions as _sub_model  # noqa: F401
from app.models.budget import Budget  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_all_tables()
    yield


app = FastAPI(title="BUDGEX API", version="2.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3002",
        "http://localhost:3000",
        "https://budgex.lifexos.co.in",
        "https://staax.lifexos.co.in",
        "https://lifexos.co.in",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(expenses.router, prefix="/api/v1/expenses", tags=["expenses"])
app.include_router(accounts.router, prefix="/api/v1/accounts", tags=["accounts"])
app.include_router(subscriptions.router, prefix="/api/v1/subscriptions", tags=["subscriptions"])
app.include_router(parse.router, prefix="/api/v1/parse", tags=["parse"])
app.include_router(budgets.router, prefix="/api/v1/budgets", tags=["budgets"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["analytics"])


@app.get("/health")
async def health():
    return {"status": "ok", "service": "budgex", "version": "2.0.0"}
