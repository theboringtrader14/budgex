from fastapi import Header, HTTPException
from app.core.config import settings


async def verify_token(x_api_key: str = Header(None)) -> None:
    if not x_api_key or x_api_key != settings.budgex_api_key:
        raise HTTPException(status_code=401, detail="Unauthorized")
