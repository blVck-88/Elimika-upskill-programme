import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/api/exams", tags=["exams"])


@router.post("/", response_model=schemas.ExamOut, status_code=201)
def create_exam(
    exam_in: schemas.ExamCreate,
    course_id: int,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db),
):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if course.instructor_id != current_user.id and current_user.role != models.UserRole.admin:
        raise HTTPException(status_code=403, detail="Not authorized")

    exam = models.Exam(
        course_id=course_id,
        title=exam_in.title,
        description=exam_in.description,
        passing_score=exam_in.passing_score,
        time_limit_minutes=exam_in.time_limit_minutes,
    )
    db.add(exam)
    db.flush()

    for q in exam_in.questions:
        question = models.Question(**q.model_dump(), exam_id=exam.id)
        db.add(question)

    db.commit()
    db.refresh(exam)
    return exam


@router.get("/course/{course_id}", response_model=List[schemas.ExamOut])
def get_exams_for_course(course_id: int, db: Session = Depends(get_db)):
    return db.query(models.Exam).filter(models.Exam.course_id == course_id).all()


@router.get("/{exam_id}", response_model=schemas.ExamOut)
def get_exam(exam_id: int, db: Session = Depends(get_db)):
    exam = db.query(models.Exam).filter(models.Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    return exam


@router.post("/attempt", response_model=schemas.ExamAttemptOut)
def submit_exam(
    attempt_in: schemas.ExamAttemptCreate,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db),
):
    exam = db.query(models.Exam).filter(models.Exam.id == attempt_in.exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    total_points = sum(q.points for q in exam.questions)
    earned_points = 0.0
    for question in exam.questions:
        answer = attempt_in.answers.get(str(question.id))
        if answer and answer.upper() == question.correct_answer.upper():
            earned_points += question.points

    score = (earned_points / total_points * 100) if total_points > 0 else 0
    passed = score >= exam.passing_score

    attempt = models.ExamAttempt(
        student_id=current_user.id,
        exam_id=exam.id,
        score=score,
        passed=passed,
        answers=json.dumps(attempt_in.answers),
        completed_at=datetime.now(timezone.utc),
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    return attempt


@router.get("/my-attempts", response_model=List[schemas.ExamAttemptOut])
def my_attempts(
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db),
):
    return db.query(models.ExamAttempt).filter(
        models.ExamAttempt.student_id == current_user.id
    ).all()
