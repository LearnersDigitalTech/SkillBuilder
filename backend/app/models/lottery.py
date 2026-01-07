"""
Lottery Models
SQLAlchemy models for lottery registration system
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, JSON, Text
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class LotteryRegistration(Base):
    """
    LotteryRegistration model - for lottery/raffle entries
    Maps from Firebase Lottery/Registrations and NMD_2025/Registrations
    """
    __tablename__ = "lottery_registrations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Unique ticket code
    ticket_code = Column(String(50), unique=True, nullable=False, index=True)
    
    # Optional user reference (if registered user)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    # Registration info
    name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=False, index=True)
    email = Column(String(255), nullable=True)
    school = Column(String(255), nullable=True)
    grade = Column(String(50), nullable=True)
    
    # Additional data
    metadata_json = Column(JSON, nullable=True)
    
    # Winner status
    is_winner = Column(Boolean, default=False)
    prize_tier = Column(String(50), nullable=True)  # "first", "second", "consolation"
    won_at = Column(DateTime, nullable=True)
    
    # Timestamps
    registered_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<LotteryRegistration {self.ticket_code} - {self.name}>"
