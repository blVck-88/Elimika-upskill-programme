from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from app.models import UserRole, EnrollmentStatus


# ─── Auth ───────────────────────────────────────────────────────────────────

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None


# ─── User ────────────────────────────────────────────────────────────────────

class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    role: UserRole = UserRole.student
    bio: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None

class UserOut(UserBase):
    id: int
    avatar_url: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Lesson ──────────────────────────────────────────────────────────────────

class LessonBase(BaseModel):
    title: str
    content: Optional[str] = None
    video_url: Optional[str] = None
    order_index: int = 0
    duration_minutes: int = 0

class LessonCreate(LessonBase):
    pass

class LessonOut(LessonBase):
    id: int
    course_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Course ──────────────────────────────────────────────────────────────────

class CourseBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    skill_level: str = "beginner"
    price: float = 0.0
    thumbnail_url: Optional[str] = None

class CourseCreate(CourseBase):
    pass

class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    skill_level: Optional[str] = None
    price: Optional[float] = None
    is_published: Optional[bool] = None
    thumbnail_url: Optional[str] = None

class CourseOut(CourseBase):
    id: int
    is_published: bool
    instructor_id: int
    instructor: Optional[UserOut] = None
    lessons: List[LessonOut] = []
    created_at: datetime

    class Config:
        from_attributes = True

class CourseSummary(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    skill_level: str
    price: float
    thumbnail_url: Optional[str] = None
    is_published: bool
    instructor_id: int
    instructor: Optional[UserOut] = None
    enrollment_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Enrollment ───────────────────────────────────────────────────────────────

class EnrollmentCreate(BaseModel):
    course_id: int

class EnrollmentOut(BaseModel):
    id: int
    student_id: int
    course_id: int
    status: EnrollmentStatus
    progress_percent: float
    enrolled_at: datetime
    course: Optional[CourseSummary] = None

    class Config:
        from_attributes = True


# ─── Exam ─────────────────────────────────────────────────────────────────────

class QuestionBase(BaseModel):
    text: str
    option_a: str
    option_b: str
    option_c: Optional[str] = None
    option_d: Optional[str] = None
    correct_answer: str
    points: float = 1.0

class QuestionCreate(QuestionBase):
    pass

class QuestionOut(QuestionBase):
    id: int
    exam_id: int

    class Config:
        from_attributes = True

class ExamBase(BaseModel):
    title: str
    description: Optional[str] = None
    passing_score: float = 60.0
    time_limit_minutes: Optional[int] = None

class ExamCreate(ExamBase):
    questions: List[QuestionCreate] = []

class ExamOut(ExamBase):
    id: int
    course_id: int
    questions: List[QuestionOut] = []
    created_at: datetime

    class Config:
        from_attributes = True

class ExamAttemptCreate(BaseModel):
    exam_id: int
    answers: dict  # {question_id: "A" | "B" | "C" | "D"}

class ExamAttemptOut(BaseModel):
    id: int
    student_id: int
    exam_id: int
    score: Optional[float]
    passed: Optional[bool]
    started_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True


# ─── Dashboard Stats ──────────────────────────────────────────────────────────

class DashboardStats(BaseModel):
    total_users: int
    total_courses: int
    total_enrollments: int
    total_exams: int
    recent_enrollments: List[EnrollmentOut] = []
