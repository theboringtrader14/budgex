from sqlalchemy import Column, String, Float, Text, Date, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from datetime import date, datetime
from uuid import uuid4
from app.core.database import Base

class Expense(Base):
    __tablename__ = 'expenses'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    amount = Column(Float, nullable=False)
    category = Column(String(50), default='Others')
    description = Column(Text)
    date = Column(Date, default=date.today)
    created_at = Column(DateTime, default=datetime.utcnow)
    account_id = Column(UUID(as_uuid=True), ForeignKey('accounts.id'), nullable=True)
