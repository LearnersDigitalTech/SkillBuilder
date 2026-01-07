"""
Quiz Router
Handles quiz management and attempts - PRIORITY FEATURE
"""
from typing import List, Optional
from uuid import UUID
from datetime import datetime
import random
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.middleware.firebase_auth import require_auth, require_teacher
from app.models.user import User, Child
from app.models.quiz import Quiz, Question, QuizAttempt, QuestionType
from app.schemas.quiz import (
    QuizCreate, QuizUpdate, QuizResponse, QuizListItem, QuizForAttempt,
    QuestionCreate, QuestionUpdate, QuestionResponse, QuestionForQuiz,
    QuizAttemptCreate, QuizAttemptSubmit, QuizAttemptResponse, QuizResultDetail,
    AnswerSubmission
)

router = APIRouter()


# ============ Quiz Management ============

@router.get("/", response_model=List[QuizListItem])
async def list_quizzes(
    grade: Optional[str] = Query(None),
    subject: Optional[str] = Query(None),
    is_practice: Optional[bool] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """List available quizzes with optional filters"""
    query = select(Quiz).where(Quiz.is_active == True)
    
    if grade:
        query = query.where(Quiz.grade == grade)
    if subject:
        query = query.where(Quiz.subject == subject)
    if is_practice is not None:
        query = query.where(Quiz.is_practice == is_practice)
    
    query = query.order_by(Quiz.created_at.desc())
    result = await db.execute(query)
    quizzes = result.scalars().all()
    
    return [QuizListItem.model_validate(q) for q in quizzes]


@router.get("/grades")
async def get_available_grades(db: AsyncSession = Depends(get_db)):
    """Get list of grades with available quizzes"""
    result = await db.execute(
        select(Quiz.grade).where(Quiz.is_active == True).distinct()
    )
    grades = [row[0] for row in result.all()]
    return {"grades": sorted(grades)}


@router.get("/subjects")
async def get_available_subjects(
    grade: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Get list of subjects, optionally filtered by grade"""
    query = select(Quiz.subject).where(Quiz.is_active == True)
    if grade:
        query = query.where(Quiz.grade == grade)
    query = query.distinct()
    
    result = await db.execute(query)
    subjects = [row[0] for row in result.all()]
    return {"subjects": sorted(subjects)}


@router.get("/{quiz_id}", response_model=QuizResponse)
async def get_quiz(
    quiz_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get quiz details with questions"""
    result = await db.execute(
        select(Quiz).where(Quiz.id == quiz_id)
    )
    quiz = result.scalar_one_or_none()
    
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    # Load questions
    questions_result = await db.execute(
        select(Question).where(Question.quiz_id == quiz_id).order_by(Question.order_index)
    )
    questions = questions_result.scalars().all()
    
    return QuizResponse(
        id=quiz.id,
        title=quiz.title,
        description=quiz.description,
        grade=quiz.grade,
        subject=quiz.subject,
        duration_minutes=quiz.duration_minutes,
        passing_score=quiz.passing_score,
        shuffle_questions=quiz.shuffle_questions,
        shuffle_options=quiz.shuffle_options,
        show_answers_after=quiz.show_answers_after,
        is_practice=quiz.is_practice,
        total_questions=len(questions),
        is_active=quiz.is_active,
        created_at=quiz.created_at,
        updated_at=quiz.updated_at,
        questions=[QuestionResponse.model_validate(q) for q in questions]
    )


@router.post("/", response_model=QuizResponse)
async def create_quiz(
    data: QuizCreate,
    user: User = Depends(require_teacher),
    db: AsyncSession = Depends(get_db)
):
    """Create a new quiz with questions (teacher/admin only)"""
    quiz = Quiz(
        title=data.title,
        description=data.description,
        grade=data.grade,
        subject=data.subject,
        duration_minutes=data.duration_minutes,
        passing_score=data.passing_score,
        shuffle_questions=data.shuffle_questions,
        shuffle_options=data.shuffle_options,
        show_answers_after=data.show_answers_after,
        is_practice=data.is_practice,
        total_questions=len(data.questions),
        created_by=user.id
    )
    db.add(quiz)
    await db.flush()
    
    # Add questions
    questions = []
    for i, q_data in enumerate(data.questions):
        question = Question(
            quiz_id=quiz.id,
            question_text=q_data.question_text,
            question_type=QuestionType(q_data.question_type.value),
            options=[opt.model_dump() for opt in q_data.options] if q_data.options else None,
            correct_answer=q_data.correct_answer,
            explanation=q_data.explanation,
            image_url=q_data.image_url,
            points=q_data.points,
            difficulty=q_data.difficulty,
            has_math=q_data.has_math,
            order_index=q_data.order_index if q_data.order_index else i
        )
        db.add(question)
        questions.append(question)
    
    await db.flush()
    
    return QuizResponse(
        id=quiz.id,
        title=quiz.title,
        description=quiz.description,
        grade=quiz.grade,
        subject=quiz.subject,
        duration_minutes=quiz.duration_minutes,
        passing_score=quiz.passing_score,
        shuffle_questions=quiz.shuffle_questions,
        shuffle_options=quiz.shuffle_options,
        show_answers_after=quiz.show_answers_after,
        is_practice=quiz.is_practice,
        total_questions=len(questions),
        is_active=quiz.is_active,
        created_at=quiz.created_at,
        updated_at=quiz.updated_at,
        questions=[QuestionResponse.model_validate(q) for q in questions]
    )


# ============ Quiz Attempts ============

@router.post("/{quiz_id}/start", response_model=QuizForAttempt)
async def start_quiz(
    quiz_id: UUID,
    child_id: Optional[UUID] = Query(None),
    user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """Start a quiz attempt and get questions (without answers)"""
    # Get quiz
    result = await db.execute(
        select(Quiz).where(Quiz.id == quiz_id, Quiz.is_active == True)
    )
    quiz = result.scalar_one_or_none()
    
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    # Validate child_id if provided
    if child_id:
        child_result = await db.execute(
            select(Child).where(Child.id == child_id, Child.parent_id == user.id)
        )
        child = child_result.scalar_one_or_none()
        if not child:
            raise HTTPException(status_code=404, detail="Child not found")
    
    # Create attempt record
    attempt = QuizAttempt(
        user_id=user.id,
        child_id=child_id,
        quiz_id=quiz.id,
        total_questions=quiz.total_questions,
        started_at=datetime.utcnow()
    )
    db.add(attempt)
    await db.flush()
    
    # Get questions
    questions_result = await db.execute(
        select(Question).where(Question.quiz_id == quiz_id).order_by(Question.order_index)
    )
    questions = list(questions_result.scalars().all())
    
    # Shuffle if enabled
    if quiz.shuffle_questions:
        random.shuffle(questions)
    
    # Convert to response (without correct answers)
    question_responses = []
    for q in questions:
        options = q.options
        if quiz.shuffle_options and options:
            options = random.sample(options, len(options))
        
        question_responses.append(QuestionForQuiz(
            id=q.id,
            question_text=q.question_text,
            question_type=q.question_type.value,
            options=options,
            image_url=q.image_url,
            has_math=q.has_math,
            order_index=q.order_index
        ))
    
    return QuizForAttempt(
        id=quiz.id,
        title=quiz.title,
        description=quiz.description,
        grade=quiz.grade,
        subject=quiz.subject,
        duration_minutes=quiz.duration_minutes,
        total_questions=quiz.total_questions,
        shuffle_questions=quiz.shuffle_questions,
        shuffle_options=quiz.shuffle_options,
        questions=question_responses
    )


@router.post("/{quiz_id}/submit", response_model=QuizAttemptResponse)
async def submit_quiz(
    quiz_id: UUID,
    data: QuizAttemptSubmit,
    user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """Submit quiz answers and calculate score"""
    # Find active attempt
    result = await db.execute(
        select(QuizAttempt).where(
            QuizAttempt.quiz_id == quiz_id,
            QuizAttempt.user_id == user.id,
            QuizAttempt.is_completed == False
        ).order_by(QuizAttempt.started_at.desc())
    )
    attempt = result.scalar_one_or_none()
    
    if not attempt:
        raise HTTPException(status_code=404, detail="No active attempt found")
    
    # Get questions with correct answers
    questions_result = await db.execute(
        select(Question).where(Question.quiz_id == quiz_id)
    )
    questions = {str(q.id): q for q in questions_result.scalars().all()}
    
    # Calculate score
    correct = 0
    wrong = 0
    skipped = 0
    answers_dict = {}
    
    answered_ids = set()
    for answer in data.answers:
        q_id = str(answer.question_id)
        answered_ids.add(q_id)
        
        if q_id in questions:
            question = questions[q_id]
            is_correct = answer.answer == question.correct_answer
            
            if is_correct:
                correct += 1
            else:
                wrong += 1
            
            answers_dict[q_id] = {
                "answer": answer.answer,
                "time_taken": answer.time_taken_seconds,
                "is_correct": is_correct
            }
    
    # Count skipped
    for q_id in questions:
        if q_id not in answered_ids:
            skipped += 1
            answers_dict[q_id] = {"answer": None, "skipped": True}
    
    # Update attempt
    total = len(questions)
    attempt.answers = answers_dict
    attempt.correct_answers = correct
    attempt.wrong_answers = wrong
    attempt.skipped = skipped
    attempt.score = correct
    attempt.total_questions = total
    attempt.percentage = int((correct / total * 100)) if total > 0 else 0
    attempt.is_completed = True
    attempt.is_submitted = True
    attempt.completed_at = datetime.utcnow()
    
    if attempt.started_at:
        attempt.time_taken_seconds = int((attempt.completed_at - attempt.started_at).total_seconds())
    
    await db.flush()
    
    return QuizAttemptResponse.model_validate(attempt)


@router.get("/{quiz_id}/results", response_model=List[QuizAttemptResponse])
async def get_quiz_results(
    quiz_id: UUID,
    user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """Get user's attempt history for a quiz"""
    result = await db.execute(
        select(QuizAttempt).where(
            QuizAttempt.quiz_id == quiz_id,
            QuizAttempt.user_id == user.id,
            QuizAttempt.is_completed == True
        ).order_by(QuizAttempt.completed_at.desc())
    )
    attempts = result.scalars().all()
    
    return [QuizAttemptResponse.model_validate(a) for a in attempts]


@router.get("/attempts/history", response_model=List[QuizAttemptResponse])
async def get_attempt_history(
    child_id: Optional[UUID] = Query(None),
    limit: int = Query(20, le=100),
    user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """Get attempt history for user or specific child"""
    query = select(QuizAttempt).where(
        QuizAttempt.user_id == user.id,
        QuizAttempt.is_completed == True
    )
    
    if child_id:
        query = query.where(QuizAttempt.child_id == child_id)
    
    query = query.order_by(QuizAttempt.completed_at.desc()).limit(limit)
    
    result = await db.execute(query)
    attempts = result.scalars().all()
    
    return [QuizAttemptResponse.model_validate(a) for a in attempts]
