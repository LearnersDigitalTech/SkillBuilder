"""
Admin Router
Handles admin dashboard operations
"""
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.middleware.firebase_auth import require_admin
from app.models.user import User, Child, Teacher, UserType
from app.models.quiz import Quiz, QuizAttempt
from app.models.lottery import LotteryRegistration
from app.schemas.user import UserResponse, TeacherResponse

router = APIRouter()


@router.get("/dashboard/stats")
async def get_dashboard_stats(
    user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Get admin dashboard statistics"""
    # Count users by type
    users_result = await db.execute(
        select(User.user_type, func.count(User.id)).group_by(User.user_type)
    )
    user_counts = {row[0].value: row[1] for row in users_result.all()}
    
    # Count children
    children_count = await db.execute(select(func.count(Child.id)))
    
    # Count quizzes
    quizzes_count = await db.execute(select(func.count(Quiz.id)))
    
    # Count attempts
    attempts_count = await db.execute(select(func.count(QuizAttempt.id)))
    
    # Count lottery registrations
    lottery_count = await db.execute(select(func.count(LotteryRegistration.id)))
    
    return {
        "users": {
            "total": sum(user_counts.values()),
            "parents": user_counts.get("parent", 0),
            "teachers": user_counts.get("teacher", 0),
            "admins": user_counts.get("admin", 0)
        },
        "students": children_count.scalar() or 0,
        "quizzes": quizzes_count.scalar() or 0,
        "quiz_attempts": attempts_count.scalar() or 0,
        "lottery_registrations": lottery_count.scalar() or 0
    }


@router.get("/users", response_model=List[UserResponse])
async def list_users(
    user_type: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=200),
    user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """List all users with optional type filter"""
    query = select(User)
    
    if user_type:
        query = query.where(User.user_type == UserType(user_type))
    
    query = query.order_by(User.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    users = result.scalars().all()
    
    # Load children for each user
    response = []
    for u in users:
        children_result = await db.execute(
            select(Child).where(Child.parent_id == u.id)
        )
        children = children_result.scalars().all()
        
        response.append(UserResponse(
            id=u.id,
            firebase_uid=u.firebase_uid,
            email=u.email,
            phone_number=u.phone_number,
            name=u.name,
            user_type=u.user_type.value,
            auth_provider=u.auth_provider,
            profile_picture=u.profile_picture,
            created_at=u.created_at,
            updated_at=u.updated_at,
            last_login_at=u.last_login_at,
            children=[{
                "id": str(c.id),
                "name": c.name,
                "grade": c.grade
            } for c in children]
        ))
    
    return response


@router.get("/students")
async def list_students(
    grade: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=200),
    user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """List all students (children) with optional grade filter"""
    query = select(Child, User).join(User, Child.parent_id == User.id)
    
    if grade:
        query = query.where(Child.grade == grade)
    
    query = query.order_by(Child.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    rows = result.all()
    
    return [{
        "id": str(child.id),
        "name": child.name,
        "grade": child.grade,
        "school": child.school,
        "parent_id": str(parent.id),
        "parent_name": parent.name,
        "parent_email": parent.email,
        "parent_phone": parent.phone_number,
        "created_at": child.created_at.isoformat()
    } for child, parent in rows]


@router.patch("/users/{user_id}/type")
async def update_user_type(
    user_id: UUID,
    new_type: str,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Update user type (promote to teacher, admin, etc.)"""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    try:
        user.user_type = UserType(new_type)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid user type: {new_type}")
    
    # If promoting to teacher, create teacher profile
    if user.user_type == UserType.TEACHER:
        existing = await db.execute(
            select(Teacher).where(Teacher.user_id == user.id)
        )
        if not existing.scalar_one_or_none():
            teacher = Teacher(
                user_id=user.id,
                assigned_by=admin.id
            )
            db.add(teacher)
    
    await db.flush()
    return {"message": f"User type updated to {new_type}"}
