"""
Quiz Models
SQLAlchemy models for quizzes, questions, and attempts
"""
import uuid
from datetime import datetime
from enum import Enum as PyEnum
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Enum, Boolean, JSON, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class QuestionType(str, PyEnum):
    """Question type enumeration"""
    MULTIPLE_CHOICE = "multiple_choice"
    TRUE_FALSE = "true_false"
    FILL_BLANK = "fill_blank"
    NUMERIC = "numeric"
    MATCHING = "matching"


class Quiz(Base):
    """
    Quiz model - represents a quiz/test
    """
    __tablename__ = "quizzes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Basic info
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    grade = Column(String(50), nullable=False, index=True)  # "Grade 1", "NEET", "SAT"
    subject = Column(String(100), nullable=False, index=True)  # "Math", "Physics", etc.
    
    # Settings
    duration_minutes = Column(Integer, default=30)
    total_questions = Column(Integer, default=0)
    passing_score = Column(Integer, default=40)  # Percentage
    shuffle_questions = Column(Boolean, default=False)
    shuffle_options = Column(Boolean, default=False)
    show_answers_after = Column(Boolean, default=True)
    
    # Visibility
    is_active = Column(Boolean, default=True)
    is_practice = Column(Boolean, default=False)  # Practice vs Official test
    
    # Additional settings as JSON
    settings = Column(JSON, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    created_by = Column(UUID(as_uuid=True), nullable=True)
    
    # Relationships
    questions = relationship("Question", back_populates="quiz", cascade="all, delete-orphan", order_by="Question.order_index")
    attempts = relationship("QuizAttempt", back_populates="quiz", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Quiz {self.title} - {self.grade}>"


class Question(Base):
    """
    Question model - represents individual questions in a quiz
    """
    __tablename__ = "questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    quiz_id = Column(UUID(as_uuid=True), ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False)
    
    # Question content
    question_text = Column(Text, nullable=False)
    question_type = Column(Enum(QuestionType), default=QuestionType.MULTIPLE_CHOICE, nullable=False)
    
    # Options for MCQ (stored as JSON array)
    # e.g., [{"id": "a", "text": "Option A"}, {"id": "b", "text": "Option B"}]
    options = Column(JSON, nullable=True)
    
    # Correct answer(s) - format depends on question type
    # MCQ: "a" or ["a", "b"] for multiple correct
    # True/False: true/false
    # Numeric: number
    correct_answer = Column(JSON, nullable=False)
    
    # Explanation shown after answering
    explanation = Column(Text, nullable=True)
    
    # Media
    image_url = Column(Text, nullable=True)
    audio_url = Column(Text, nullable=True)
    
    # Ordering and metadata
    order_index = Column(Integer, default=0)
    points = Column(Integer, default=1)
    difficulty = Column(String(20), nullable=True)  # "easy", "medium", "hard"
    
    # For KaTeX/LaTeX math rendering
    has_math = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    quiz = relationship("Quiz", back_populates="questions")

    def __repr__(self):
        return f"<Question {self.id} - {self.question_type}>"


class QuizAttempt(Base):
    """
    QuizAttempt model - represents a user's attempt at a quiz
    Maps from Firebase quiz result storage
    """
    __tablename__ = "quiz_attempts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # References
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    child_id = Column(UUID(as_uuid=True), ForeignKey("children.id", ondelete="SET NULL"), nullable=True)
    quiz_id = Column(UUID(as_uuid=True), ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False)
    
    # Answers submitted
    # Format: {"question_id": {"answer": "a", "time_taken": 15}}
    answers = Column(JSON, nullable=True)
    
    # Results
    score = Column(Integer, default=0)
    total_questions = Column(Integer, default=0)
    correct_answers = Column(Integer, default=0)
    wrong_answers = Column(Integer, default=0)
    skipped = Column(Integer, default=0)
    percentage = Column(Integer, default=0)
    
    # Timing
    started_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    time_taken_seconds = Column(Integer, nullable=True)
    
    # Status
    is_completed = Column(Boolean, default=False)
    is_submitted = Column(Boolean, default=False)
    
    # Security logs for proctoring
    security_logs = Column(JSON, nullable=True)  # Tab switches, violations, etc.
    violation_count = Column(Integer, default=0)
    
    # Relationships
    user = relationship("User", back_populates="quiz_attempts")
    child = relationship("Child", back_populates="quiz_attempts")
    quiz = relationship("Quiz", back_populates="attempts")

    def __repr__(self):
        return f"<QuizAttempt {self.id} - Score: {self.score}/{self.total_questions}>"
