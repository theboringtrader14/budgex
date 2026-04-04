from sqlalchemy import Column, String, Float, Date, DateTime
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from uuid import uuid4
from app.core.database import Base

class Subscription(Base):
    __tablename__ = 'subscriptions'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    name = Column(String(100), nullable=False)
    amount = Column(Float, nullable=False)
    cycle = Column(String(20), default='monthly')
    next_due_date = Column(Date)
    created_at = Column(DateTime, default=datetime.utcnow)
