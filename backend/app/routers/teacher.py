"""
Teacher Router
Handles teacher dashboard operations
"""
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.middleware.firebase_auth import require_teacher, require_admin
from app.models.user import User, Child, Teacher, UserType
from app.models.quiz import QuizAttempt
from app.schemas.user import TeacherResponse

router = APIRouter()


@router.get("/profile", response_model=TeacherResponse)
async def get_teacher_profile(
    user: User = Depends(require_teacher),
    db: AsyncSession = Depends(get_db)
):
    """Get current teacher's profile with assignments"""
    result = await db.execute(
        select(Teacher).where(Teacher.user_id == user.id)
    )
    teacher = result.scalar_one_or_none()
    
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found")
    
    return TeacherResponse(
        id=teacher.id,
        user_id=teacher.user_id,
        ticket_code=teacher.ticket_code,
        assigned_grades=teacher.assigned_grades or [],
        assigned_students=teacher.assigned_students or [],
        permissions=teacher.permissions,
        assigned_at=teacher.assigned_at
    )


@router.get("/grades")
async def get_assigned_grades(
    user: User = Depends(require_teacher),
    db: AsyncSession = Depends(get_db)
):
    """Get grades assigned to current teacher"""
    result = await db.execute(
        select(Teacher).where(Teacher.user_id == user.id)
    )
    teacher = result.scalar_one_or_none()
    
    if not teacher:
        return {"grades": []}
    
    return {"grades": teacher.assigned_grades or []}


@router.get("/students")
async def get_assigned_students(
    grade: Optional[str] = Query(None),
    user: User = Depends(require_teacher),
    db: AsyncSession = Depends(get_db)
):
    """Get students assigned to current teacher, optionally filtered by grade"""
    result = await db.execute(
        select(Teacher).where(Teacher.user_id == user.id)
    )
    teacher = result.scalar_one_or_none()
    
    if not teacher:
        return {"students": []}
    
    # If teacher has assigned grades, fetch students from those grades
    assigned_grades = teacher.assigned_grades or []
    
    if grade and grade not in assigned_grades:
        return {"students": []}
    
    # Query students by grade
    query = select(Child, User).join(User, Child.parent_id == User.id)
    
    if grade:
        query = query.where(Child.grade == grade)
    elif assigned_grades:
        query = query.where(Child.grade.in_(assigned_grades))
    
    result = await db.execute(query)
    rows = result.all()
    
    students = []
    for child, parent in rows:
        students.append({
            "id": str(child.id),
            "uid": str(parent.id),
            "name": child.name,
            "grade": child.grade,
            "school": child.school,
            "parent_name": parent.name,
            "parent_phone": parent.phone_number
        })
    
    return {"students": students}


@router.get("/students/{child_id}/report")
async def get_student_report(
    child_id: UUID,
    user: User = Depends(require_teacher),
    db: AsyncSession = Depends(get_db)
):
    """Get detailed report for a specific student"""
    # Verify teacher has access
    teacher_result = await db.execute(
        select(Teacher).where(Teacher.user_id == user.id)
    )
    teacher = teacher_result.scalar_one_or_none()
    
    # Get child info
    child_result = await db.execute(
        select(Child, User).join(User, Child.parent_id == User.id).where(Child.id == child_id)
    )
    row = child_result.one_or_none()
    
    if not row:
        raise HTTPException(status_code=404, detail="Student not found")
    
    child, parent = row
    
    # Check if teacher has access to this student's grade
    if teacher and teacher.assigned_grades:
        if child.grade not in teacher.assigned_grades:
            raise HTTPException(status_code=403, detail="Access denied to this student")
    
    # Get quiz attempts
    attempts_result = await db.execute(
        select(QuizAttempt).where(
            QuizAttempt.child_id == child_id,
            QuizAttempt.is_completed == True
        ).order_by(QuizAttempt.completed_at.desc()).limit(50)
    )
    attempts = attempts_result.scalars().all()
    
    # Calculate stats
    total_attempts = len(attempts)
    avg_score = sum(a.percentage for a in attempts) / total_attempts if total_attempts > 0 else 0
    
    return {
        "student": {
            "id": str(child.id),
            "name": child.name,
            "grade": child.grade,
            "school": child.school
        },
        "parent": {
            "name": parent.name,
            "phone": parent.phone_number,
            "email": parent.email
        },
        "stats": {
            "total_attempts": total_attempts,
            "average_score": round(avg_score, 1),
            "quizzes_passed": sum(1 for a in attempts if a.percentage >= 40),
            "quizzes_failed": sum(1 for a in attempts if a.percentage < 40)
        },
        "recent_attempts": [{
            "id": str(a.id),
            "quiz_id": str(a.quiz_id),
            "score": a.score,
            "total": a.total_questions,
            "percentage": a.percentage,
            "completed_at": a.completed_at.isoformat() if a.completed_at else None
        } for a in attempts[:10]]
    }


# ============ Admin Endpoints for Teacher Management ============

@router.post("/{user_id}/assign-grades")
async def assign_grades_to_teacher(
    user_id: UUID,
    grades: List[str],
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Assign grades to a teacher (admin only)"""
    from datetime import datetime
    
    # Get or create teacher profile
    result = await db.execute(
        select(Teacher).where(Teacher.user_id == user_id)
    )
    teacher = result.scalar_one_or_none()
    
    if not teacher:
        # Create teacher profile
        user_result = await db.execute(select(User).where(User.id == user_id))
        user = user_result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Update user type to teacher
        user.user_type = UserType.TEACHER
        
        teacher = Teacher(
            user_id=user_id,
            assigned_grades=grades,
            assigned_by=admin.id,
            assigned_at=datetime.utcnow()
        )
        db.add(teacher)
    else:
        teacher.assigned_grades = grades
        teacher.assigned_by = admin.id
        teacher.assigned_at = datetime.utcnow()
    
    await db.flush()
    return {"message": f"Assigned grades: {grades}"}


@router.delete("/{user_id}/grades/{grade}")
async def remove_grade_from_teacher(
    user_id: UUID,
    grade: str,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Remove a grade assignment from teacher"""
    result = await db.execute(
        select(Teacher).where(Teacher.user_id == user_id)
    )
    teacher = result.scalar_one_or_none()
    
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    
    if teacher.assigned_grades and grade in teacher.assigned_grades:
        teacher.assigned_grades = [g for g in teacher.assigned_grades if g != grade]
        await db.flush()
    
    return {"message": f"Removed grade: {grade}"}
