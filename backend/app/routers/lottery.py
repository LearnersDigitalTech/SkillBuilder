"""
Lottery Router
Handles lottery registration and draws
"""
from typing import List, Optional
from uuid import UUID
from datetime import datetime
import random
import string
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.middleware.firebase_auth import require_auth, require_admin, get_current_user
from app.models.user import User
from app.models.lottery import LotteryRegistration
from app.schemas.lottery import (
    LotteryRegistrationCreate,
    LotteryRegistrationResponse,
    LotteryWinnerResponse,
    LotteryDrawRequest
)

router = APIRouter()


def generate_ticket_code() -> str:
    """Generate unique ticket code"""
    prefix = "NMD"
    numbers = ''.join(random.choices(string.digits, k=6))
    return f"{prefix}-{numbers}"


@router.post("/register", response_model=LotteryRegistrationResponse)
async def register_for_lottery(
    data: LotteryRegistrationCreate,
    user: Optional[User] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Register for lottery (can be authenticated or anonymous)"""
    # Check for duplicate phone
    existing = await db.execute(
        select(LotteryRegistration).where(LotteryRegistration.phone == data.phone)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Phone number already registered")
    
    # Generate unique ticket code
    while True:
        ticket_code = generate_ticket_code()
        check = await db.execute(
            select(LotteryRegistration).where(LotteryRegistration.ticket_code == ticket_code)
        )
        if not check.scalar_one_or_none():
            break
    
    registration = LotteryRegistration(
        ticket_code=ticket_code,
        user_id=user.id if user else None,
        name=data.name,
        phone=data.phone,
        email=data.email,
        school=data.school,
        grade=data.grade
    )
    db.add(registration)
    await db.flush()
    
    return LotteryRegistrationResponse.model_validate(registration)


@router.get("/my-registration", response_model=Optional[LotteryRegistrationResponse])
async def get_my_registration(
    user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """Get current user's lottery registration"""
    result = await db.execute(
        select(LotteryRegistration).where(LotteryRegistration.user_id == user.id)
    )
    registration = result.scalar_one_or_none()
    
    if not registration:
        return None
    
    return LotteryRegistrationResponse.model_validate(registration)


@router.get("/check/{ticket_code}", response_model=LotteryRegistrationResponse)
async def check_ticket(
    ticket_code: str,
    db: AsyncSession = Depends(get_db)
):
    """Check lottery ticket status"""
    result = await db.execute(
        select(LotteryRegistration).where(LotteryRegistration.ticket_code == ticket_code)
    )
    registration = result.scalar_one_or_none()
    
    if not registration:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    return LotteryRegistrationResponse.model_validate(registration)


@router.get("/winners", response_model=List[LotteryWinnerResponse])
async def get_winners(
    prize_tier: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Get list of lottery winners"""
    query = select(LotteryRegistration).where(LotteryRegistration.is_winner == True)
    
    if prize_tier:
        query = query.where(LotteryRegistration.prize_tier == prize_tier)
    
    query = query.order_by(LotteryRegistration.won_at.desc())
    result = await db.execute(query)
    winners = result.scalars().all()
    
    return [LotteryWinnerResponse(
        ticket_code=w.ticket_code,
        name=w.name,
        school=w.school,
        prize_tier=w.prize_tier,
        won_at=w.won_at
    ) for w in winners]


# ============ Admin Endpoints ============

@router.get("/registrations", response_model=List[LotteryRegistrationResponse])
async def list_registrations(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=200),
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """List all lottery registrations (admin only)"""
    result = await db.execute(
        select(LotteryRegistration)
        .order_by(LotteryRegistration.registered_at.desc())
        .offset(skip)
        .limit(limit)
    )
    registrations = result.scalars().all()
    
    return [LotteryRegistrationResponse.model_validate(r) for r in registrations]


@router.get("/stats")
async def get_lottery_stats(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Get lottery statistics"""
    total = await db.execute(select(func.count(LotteryRegistration.id)))
    winners = await db.execute(
        select(func.count(LotteryRegistration.id)).where(LotteryRegistration.is_winner == True)
    )
    
    # Count by prize tier
    tiers_result = await db.execute(
        select(LotteryRegistration.prize_tier, func.count(LotteryRegistration.id))
        .where(LotteryRegistration.is_winner == True)
        .group_by(LotteryRegistration.prize_tier)
    )
    prize_counts = {row[0]: row[1] for row in tiers_result.all() if row[0]}
    
    return {
        "total_registrations": total.scalar() or 0,
        "total_winners": winners.scalar() or 0,
        "winners_by_tier": prize_counts
    }


@router.post("/draw")
async def perform_draw(
    data: LotteryDrawRequest,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Perform lottery draw (admin only)"""
    # Get eligible (non-winner) registrations
    result = await db.execute(
        select(LotteryRegistration).where(LotteryRegistration.is_winner == False)
    )
    eligible = list(result.scalars().all())
    
    if len(eligible) < data.count:
        raise HTTPException(
            status_code=400, 
            detail=f"Not enough eligible participants. Available: {len(eligible)}"
        )
    
    # Random selection
    winners = random.sample(eligible, data.count)
    
    # Mark as winners
    for winner in winners:
        winner.is_winner = True
        winner.prize_tier = data.prize_tier
        winner.won_at = datetime.utcnow()
    
    await db.flush()
    
    return {
        "message": f"Drew {data.count} winner(s) for {data.prize_tier}",
        "winners": [LotteryWinnerResponse(
            ticket_code=w.ticket_code,
            name=w.name,
            school=w.school,
            prize_tier=w.prize_tier,
            won_at=w.won_at
        ) for w in winners]
    }
