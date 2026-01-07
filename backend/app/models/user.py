"""
User Models
SQLAlchemy models for users, children, and teachers
"""
import uuid
from datetime import datetime
from enum import Enum as PyEnum
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum, Boolean, JSON, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class UserType(str, PyEnum):
    """User type enumeration"""
    STUDENT = "student"
    PARENT = "parent"
    TEACHER = "teacher"
    ADMIN = "admin"


class User(Base):
    """
    User model - represents all authenticated users
    Maps from Firebase NMD_2025/Registrations/{uid}
    """
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    firebase_uid = Column(String(128), unique=True, nullable=False, index=True)
    email = Column(String(255), nullable=True, index=True)
    phone_number = Column(String(20), nullable=True, index=True)
    user_type = Column(Enum(UserType), default=UserType.PARENT, nullable=False)
    name = Column(String(255), nullable=True)
    auth_provider = Column(String(50), nullable=True)  # "google", "phone"
    
    # Profile fields
    profile_picture = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    last_login_at = Column(DateTime, nullable=True)
    
    # Relationships
    children = relationship("Child", back_populates="parent", cascade="all, delete-orphan")
    teacher_profile = relationship("Teacher", back_populates="user", uselist=False, cascade="all, delete-orphan")
    quiz_attempts = relationship("QuizAttempt", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User {self.email or self.phone_number}>"


class Child(Base):
    """
    Child model - represents student profiles under a parent
    Maps from Firebase NMD_2025/Registrations/{uid}/children/{childId}
    """
    __tablename__ = "children"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    parent_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    child_key = Column(String(50), nullable=True)  # Original Firebase key like "default" or "child_1"
    
    # Student info
    name = Column(String(255), nullable=False)
    grade = Column(String(50), nullable=True)  # "Grade 1", "Grade 10", etc.
    school = Column(String(255), nullable=True)
    date_of_birth = Column(DateTime, nullable=True)
    
    # Additional fields
    metadata_json = Column(JSON, nullable=True)  # For any extra Firebase fields
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    parent = relationship("User", back_populates="children")
    quiz_attempts = relationship("QuizAttempt", back_populates="child", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Child {self.name} - {self.grade}>"


class Teacher(Base):
    """
    Teacher model - additional profile for teacher users
    Maps from Firebase NMD_2025/Registrations/{uid} where userType='teacher'
    """
    __tablename__ = "teachers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    ticket_code = Column(String(50), unique=True, nullable=True)  # For lottery winners
    
    # Assigned grades and students
    assigned_grades = Column(JSON, nullable=True)  # ["Grade 1", "Grade 2"]
    assigned_students = Column(JSON, nullable=True)  # [{uid, childId, grade}]
    
    # Permissions
    permissions = Column(JSON, nullable=True)  # {canViewReports, canEditQuestions, etc.}
    
    # Admin who assigned
    assigned_by = Column(UUID(as_uuid=True), nullable=True)
    assigned_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="teacher_profile")

    def __repr__(self):
        return f"<Teacher {self.user_id}>"
