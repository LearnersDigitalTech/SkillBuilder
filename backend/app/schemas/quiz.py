"""
Quiz Schemas
Pydantic models for quiz-related API requests/responses
"""
from typing import Optional, List, Any
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field
from enum import Enum


class QuestionType(str, Enum):
    MULTIPLE_CHOICE = "multiple_choice"
    TRUE_FALSE = "true_false"
    FILL_BLANK = "fill_blank"
    NUMERIC = "numeric"
    MATCHING = "matching"


# ============ Question Schemas ============

class QuestionOption(BaseModel):
    id: str
    text: str
    image_url: Optional[str] = None


class QuestionBase(BaseModel):
    question_text: str
    question_type: QuestionType = QuestionType.MULTIPLE_CHOICE
    options: Optional[List[QuestionOption]] = None
    correct_answer: Any
    explanation: Optional[str] = None
    image_url: Optional[str] = None
    points: int = 1
    difficulty: Optional[str] = None
    has_math: bool = False


class QuestionCreate(QuestionBase):
    order_index: int = 0


class QuestionUpdate(BaseModel):
    question_text: Optional[str] = None
    question_type: Optional[QuestionType] = None
    options: Optional[List[QuestionOption]] = None
    correct_answer: Optional[Any] = None
    explanation: Optional[str] = None
    image_url: Optional[str] = None
    points: Optional[int] = None
    difficulty: Optional[str] = None
    has_math: Optional[bool] = None
    order_index: Optional[int] = None


class QuestionResponse(QuestionBase):
    id: UUID
    quiz_id: UUID
    order_index: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class QuestionForQuiz(BaseModel):
    """Question data sent to frontend during quiz (without correct answer)"""
    id: UUID
    question_text: str
    question_type: QuestionType
    options: Optional[List[QuestionOption]] = None
    image_url: Optional[str] = None
    has_math: bool = False
    order_index: int


# ============ Quiz Schemas ============

class QuizBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    grade: str
    subject: str
    duration_minutes: int = 30
    passing_score: int = 40
    shuffle_questions: bool = False
    shuffle_options: bool = False
    show_answers_after: bool = True
    is_practice: bool = False


class QuizCreate(QuizBase):
    questions: List[QuestionCreate] = []


class QuizUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    grade: Optional[str] = None
    subject: Optional[str] = None
    duration_minutes: Optional[int] = None
    passing_score: Optional[int] = None
    shuffle_questions: Optional[bool] = None
    shuffle_options: Optional[bool] = None
    show_answers_after: Optional[bool] = None
    is_active: Optional[bool] = None
    is_practice: Optional[bool] = None


class QuizResponse(QuizBase):
    id: UUID
    total_questions: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    questions: List[QuestionResponse] = []

    class Config:
        from_attributes = True


class QuizListItem(BaseModel):
    """Quiz item for listing (without questions)"""
    id: UUID
    title: str
    description: Optional[str] = None
    grade: str
    subject: str
    duration_minutes: int
    total_questions: int
    is_active: bool
    is_practice: bool

    class Config:
        from_attributes = True


class QuizForAttempt(BaseModel):
    """Quiz data sent to frontend for taking quiz"""
    id: UUID
    title: str
    description: Optional[str] = None
    grade: str
    subject: str
    duration_minutes: int
    total_questions: int
    shuffle_questions: bool
    shuffle_options: bool
    questions: List[QuestionForQuiz]


# ============ Quiz Attempt Schemas ============

class AnswerSubmission(BaseModel):
    question_id: UUID
    answer: Any
    time_taken_seconds: Optional[int] = None


class QuizAttemptCreate(BaseModel):
    quiz_id: UUID
    child_id: Optional[UUID] = None


class QuizAttemptSubmit(BaseModel):
    answers: List[AnswerSubmission]


class QuizAttemptResponse(BaseModel):
    id: UUID
    user_id: UUID
    child_id: Optional[UUID] = None
    quiz_id: UUID
    score: int
    total_questions: int
    correct_answers: int
    wrong_answers: int
    skipped: int
    percentage: int
    is_completed: bool
    started_at: datetime
    completed_at: Optional[datetime] = None
    time_taken_seconds: Optional[int] = None

    class Config:
        from_attributes = True


class QuizResultDetail(BaseModel):
    """Detailed quiz result with answers"""
    attempt: QuizAttemptResponse
    quiz: QuizListItem
    answers: List[dict]  # Question with user answer and correct answer
    child_name: Optional[str] = None
