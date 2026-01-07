"""
Authentication Router
Handles user authentication and registration
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.middleware.firebase_auth import (
    verify_firebase_token, 
    get_current_user, 
    require_auth,
    FirebaseUser
)
from app.models.user import User, Child, UserType
from app.schemas.user import (
    UserProfileResponse, 
    RegisterRequest, 
    ChildResponse,
    LoginResponse
)

router = APIRouter()


@router.get("/me", response_model=UserProfileResponse)
async def get_current_user_profile(
    user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """
    Get current authenticated user's profile.
    Returns user data with children if applicable.
    """
    # Eagerly load children
    result = await db.execute(
        select(User).where(User.id == user.id)
    )
    user = result.scalar_one()
    
    # Load children
    children_result = await db.execute(
        select(Child).where(Child.parent_id == user.id)
    )
    children = children_result.scalars().all()
    
    # Determine if teacher
    is_teacher = user.user_type in [UserType.TEACHER, UserType.ADMIN]
    
    return UserProfileResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        phone_number=user.phone_number,
        user_type=user.user_type.value,
        profile_picture=user.profile_picture,
        is_teacher=is_teacher,
        active_child=children[0] if children else None,
        children=[ChildResponse.model_validate(c) for c in children]
    )


@router.post("/register", response_model=UserProfileResponse)
async def register_user(
    data: RegisterRequest,
    firebase_user: FirebaseUser = Depends(verify_firebase_token),
    db: AsyncSession = Depends(get_db)
):
    """
    Register a new user with profile data.
    Creates user and children records.
    """
    if firebase_user is None:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Check if user already exists
    result = await db.execute(
        select(User).where(User.firebase_uid == firebase_user.uid)
    )
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(status_code=400, detail="User already registered")
    
    # Create user
    user = User(
        firebase_uid=firebase_user.uid,
        email=firebase_user.email or data.email,
        phone_number=firebase_user.phone or data.phone_number,
        name=data.name,
        user_type=UserType(data.user_type.value),
        auth_provider=firebase_user.provider,
        profile_picture=firebase_user.picture
    )
    db.add(user)
    await db.flush()
    
    # Create children if provided
    children = []
    for i, child_data in enumerate(data.children):
        child = Child(
            parent_id=user.id,
            child_key=f"child_{i}" if i > 0 else "default",
            name=child_data.name,
            grade=child_data.grade,
            school=child_data.school,
            date_of_birth=child_data.date_of_birth
        )
        db.add(child)
        children.append(child)
    
    await db.flush()
    
    is_teacher = user.user_type in [UserType.TEACHER, UserType.ADMIN]
    
    return UserProfileResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        phone_number=user.phone_number,
        user_type=user.user_type.value,
        profile_picture=user.profile_picture,
        is_teacher=is_teacher,
        active_child=children[0] if children else None,
        children=[ChildResponse.model_validate(c) for c in children]
    )


@router.post("/verify")
async def verify_token(
    firebase_user: FirebaseUser = Depends(verify_firebase_token)
):
    """
    Verify Firebase token and return basic user info.
    Useful for checking if token is valid without creating user.
    """
    if firebase_user is None:
        raise HTTPException(status_code=401, detail="Invalid or missing token")
    
    return {
        "valid": True,
        "uid": firebase_user.uid,
        "email": firebase_user.email,
        "phone": firebase_user.phone,
        "provider": firebase_user.provider
    }


@router.post("/logout")
async def logout(user: User = Depends(require_auth)):
    """
    Logout endpoint - client should clear local tokens.
    Server-side we can track logout timestamp if needed.
    """
    return {"message": "Logged out successfully"}
