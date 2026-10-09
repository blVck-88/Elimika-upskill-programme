from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=schemas.DashboardStats)
def get_stats(
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db),
):
    total_users = db.query(models.User).count()
    total_courses = db.query(models.Course).count()
    total_enrollments = db.query(models.Enrollment).count()
    total_exams = db.query(models.Exam).count()

    recent_enrollments = (
        db.query(models.Enrollment)
        .order_by(models.Enrollment.enrolled_at.desc())
        .limit(5)
        .all()
    )

    return schemas.DashboardStats(
        total_users=total_users,
        total_courses=total_courses,
        total_enrollments=total_enrollments,
        total_exams=total_exams,
        recent_enrollments=recent_enrollments,
    )
