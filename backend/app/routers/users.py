"""
Users Router
Handles user and child profile management
"""
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.middleware.firebase_auth import require_auth
from app.models.user import User, Child
from app.schemas.user import (
    UserResponse,
    UserUpdate,
    ChildCreate,
    ChildUpdate,
    ChildResponse
)

router = APIRouter()


# ============ User Endpoints ============

@router.get("/profile", response_model=UserResponse)
async def get_user_profile(
    user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """Get full user profile with children"""
    # Load children
    result = await db.execute(
        select(Child).where(Child.parent_id == user.id)
    )
    children = result.scalars().all()
    
    return UserResponse(
        id=user.id,
        firebase_uid=user.firebase_uid,
        email=user.email,
        phone_number=user.phone_number,
        name=user.name,
        user_type=user.user_type.value,
        auth_provider=user.auth_provider,
        profile_picture=user.profile_picture,
        created_at=user.created_at,
        updated_at=user.updated_at,
        last_login_at=user.last_login_at,
        children=[ChildResponse.model_validate(c) for c in children]
    )


@router.patch("/profile", response_model=UserResponse)
async def update_user_profile(
    data: UserUpdate,
    user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """Update user profile"""
    if data.name is not None:
        user.name = data.name
    if data.phone_number is not None:
        user.phone_number = data.phone_number
    if data.profile_picture is not None:
        user.profile_picture = data.profile_picture
    
    await db.flush()
    
    # Reload with children
    result = await db.execute(
        select(Child).where(Child.parent_id == user.id)
    )
    children = result.scalars().all()
    
    return UserResponse(
        id=user.id,
        firebase_uid=user.firebase_uid,
        email=user.email,
        phone_number=user.phone_number,
        name=user.name,
        user_type=user.user_type.value,
        auth_provider=user.auth_provider,
        profile_picture=user.profile_picture,
        created_at=user.created_at,
        updated_at=user.updated_at,
        last_login_at=user.last_login_at,
        children=[ChildResponse.model_validate(c) for c in children]
    )


# ============ Children Endpoints ============

@router.get("/children", response_model=List[ChildResponse])
async def get_children(
    user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """Get all children for current user"""
    result = await db.execute(
        select(Child).where(Child.parent_id == user.id).order_by(Child.created_at)
    )
    children = result.scalars().all()
    return [ChildResponse.model_validate(c) for c in children]


@router.post("/children", response_model=ChildResponse)
async def create_child(
    data: ChildCreate,
    user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """Add a new child profile"""
    # Count existing children for key
    result = await db.execute(
        select(Child).where(Child.parent_id == user.id)
    )
    existing_count = len(result.scalars().all())
    
    child = Child(
        parent_id=user.id,
        child_key=f"child_{existing_count}" if existing_count > 0 else "default",
        name=data.name,
        grade=data.grade,
        school=data.school,
        date_of_birth=data.date_of_birth
    )
    db.add(child)
    await db.flush()
    
    return ChildResponse.model_validate(child)


@router.get("/children/{child_id}", response_model=ChildResponse)
async def get_child(
    child_id: UUID,
    user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """Get specific child profile"""
    result = await db.execute(
        select(Child).where(Child.id == child_id, Child.parent_id == user.id)
    )
    child = result.scalar_one_or_none()
    
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")
    
    return ChildResponse.model_validate(child)


@router.patch("/children/{child_id}", response_model=ChildResponse)
async def update_child(
    child_id: UUID,
    data: ChildUpdate,
    user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """Update child profile"""
    result = await db.execute(
        select(Child).where(Child.id == child_id, Child.parent_id == user.id)
    )
    child = result.scalar_one_or_none()
    
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")
    
    if data.name is not None:
        child.name = data.name
    if data.grade is not None:
        child.grade = data.grade
    if data.school is not None:
        child.school = data.school
    if data.date_of_birth is not None:
        child.date_of_birth = data.date_of_birth
    
    await db.flush()
    return ChildResponse.model_validate(child)


@router.delete("/children/{child_id}")
async def delete_child(
    child_id: UUID,
    user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """Delete child profile"""
    result = await db.execute(
        select(Child).where(Child.id == child_id, Child.parent_id == user.id)
    )
    child = result.scalar_one_or_none()
    
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")
    
    await db.delete(child)
    return {"message": "Child deleted successfully"}
