from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/api/enrollments", tags=["enrollments"])


@router.post("/", response_model=schemas.EnrollmentOut, status_code=201)
def enroll(
    enrollment_in: schemas.EnrollmentCreate,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db),
):
    course = db.query(models.Course).filter(
        models.Course.id == enrollment_in.course_id,
        models.Course.is_published == True
    ).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found or not published")

    existing = db.query(models.Enrollment).filter(
        models.Enrollment.student_id == current_user.id,
        models.Enrollment.course_id == enrollment_in.course_id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already enrolled")

    enrollment = models.Enrollment(
        student_id=current_user.id,
        course_id=enrollment_in.course_id,
    )
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    return enrollment


@router.get("/my", response_model=List[schemas.EnrollmentOut])
def my_enrollments(
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db),
):
    return db.query(models.Enrollment).filter(
        models.Enrollment.student_id == current_user.id
    ).all()


@router.put("/{enrollment_id}/progress")
def update_progress(
    enrollment_id: int,
    progress: float,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db),
):
    enrollment = db.query(models.Enrollment).filter(
        models.Enrollment.id == enrollment_id,
        models.Enrollment.student_id == current_user.id
    ).first()
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    enrollment.progress_percent = min(100.0, max(0.0, progress))
    if enrollment.progress_percent >= 100.0:
        enrollment.status = models.EnrollmentStatus.completed
        from datetime import datetime, timezone
        enrollment.completed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(enrollment)
    return enrollment
