from sqlalchemy import Column, String, Float, Integer, DateTime
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from uuid import uuid4
from app.core.database import Base


class Budget(Base):
    __tablename__ = 'budgets'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    category = Column(String(50), nullable=False)
    monthly_limit = Column(Float, nullable=False)
    month = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
