from fastapi import APIRouter
from pydantic import BaseModel
from app.engine.expense_parser import parse_expense

router = APIRouter()

class ParseRequest(BaseModel):
    text: str

@router.post("")
async def parse(body: ParseRequest):
    result = await parse_expense(body.text)
    return result
