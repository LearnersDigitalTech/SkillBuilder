"""
Lottery Schemas
Pydantic models for lottery-related API requests/responses
"""
from typing import Optional
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field, EmailStr


class LotteryRegistrationBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    phone: str = Field(..., min_length=10, max_length=20)
    email: Optional[EmailStr] = None
    school: Optional[str] = None
    grade: Optional[str] = None


class LotteryRegistrationCreate(LotteryRegistrationBase):
    pass


class LotteryRegistrationResponse(LotteryRegistrationBase):
    id: UUID
    ticket_code: str
    user_id: Optional[UUID] = None
    is_winner: bool = False
    prize_tier: Optional[str] = None
    won_at: Optional[datetime] = None
    registered_at: datetime

    class Config:
        from_attributes = True


class LotteryWinnerResponse(BaseModel):
    """Public winner display"""
    ticket_code: str
    name: str
    school: Optional[str] = None
    prize_tier: str
    won_at: datetime


class LotteryDrawRequest(BaseModel):
    """Request to perform lottery draw"""
    prize_tier: str = Field(..., description="first, second, third, or consolation")
    count: int = Field(1, ge=1, le=100, description="Number of winners to draw")
