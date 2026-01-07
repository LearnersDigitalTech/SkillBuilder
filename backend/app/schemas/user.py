"""
User Schemas
Pydantic models for user-related API requests/responses
"""
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field
from enum import Enum


class UserType(str, Enum):
    STUDENT = "student"
    PARENT = "parent"
    TEACHER = "teacher"
    ADMIN = "admin"


# ============ Child Schemas ============

class ChildBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    grade: Optional[str] = None
    school: Optional[str] = None
    date_of_birth: Optional[datetime] = None


class ChildCreate(ChildBase):
    pass


class ChildUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    grade: Optional[str] = None
    school: Optional[str] = None
    date_of_birth: Optional[datetime] = None


class ChildResponse(ChildBase):
    id: UUID
    parent_id: UUID
    child_key: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============ User Schemas ============

class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    name: Optional[str] = None


class UserCreate(UserBase):
    firebase_uid: str
    user_type: UserType = UserType.PARENT


class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    phone_number: Optional[str] = None
    profile_picture: Optional[str] = None


class UserResponse(UserBase):
    id: UUID
    firebase_uid: str
    user_type: UserType
    auth_provider: Optional[str] = None
    profile_picture: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    last_login_at: Optional[datetime] = None
    children: List[ChildResponse] = []

    class Config:
        from_attributes = True


class UserProfileResponse(BaseModel):
    """Simplified user profile for UI"""
    id: UUID
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    user_type: UserType
    profile_picture: Optional[str] = None
    is_teacher: bool = False
    active_child: Optional[ChildResponse] = None
    children: List[ChildResponse] = []

    class Config:
        from_attributes = True


# ============ Teacher Schemas ============

class TeacherAssignment(BaseModel):
    grades: List[str] = []
    students: List[dict] = []  # [{uid, childId, grade}]


class TeacherPermissions(BaseModel):
    can_view_reports: bool = True
    can_edit_questions: bool = False
    can_manage_students: bool = False


class TeacherResponse(BaseModel):
    id: UUID
    user_id: UUID
    ticket_code: Optional[str] = None
    assigned_grades: List[str] = []
    assigned_students: List[dict] = []
    permissions: Optional[dict] = None
    assigned_at: Optional[datetime] = None
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True


# ============ Auth Schemas ============

class LoginResponse(BaseModel):
    user: UserProfileResponse
    access_token: str
    token_type: str = "bearer"


class RegisterRequest(BaseModel):
    """Registration data for new users"""
    name: str = Field(..., min_length=1, max_length=255)
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    user_type: UserType = UserType.PARENT
    children: List[ChildCreate] = []
