from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/api/courses", tags=["courses"])


@router.get("/", response_model=List[schemas.CourseSummary])
def list_courses(
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    skill_level: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(models.Course).filter(models.Course.is_published == True)
    if search:
        query = query.filter(
            or_(
                models.Course.title.ilike(f"%{search}%"),
                models.Course.description.ilike(f"%{search}%"),
            )
        )
    if category:
        query = query.filter(models.Course.category == category)
    if skill_level:
        query = query.filter(models.Course.skill_level == skill_level)

    courses = query.all()
    result = []
    for c in courses:
        enrollment_count = db.query(models.Enrollment).filter(models.Enrollment.course_id == c.id).count()
        result.append(schemas.CourseSummary(
            id=c.id, title=c.title, description=c.description,
            category=c.category, skill_level=c.skill_level, price=c.price,
            thumbnail_url=c.thumbnail_url, is_published=c.is_published,
            instructor_id=c.instructor_id, instructor=c.instructor,
            enrollment_count=enrollment_count, created_at=c.created_at,
        ))
    return result


@router.get("/my-courses", response_model=List[schemas.CourseSummary])
def my_courses(
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db),
):
    courses = db.query(models.Course).filter(models.Course.instructor_id == current_user.id).all()
    result = []
    for c in courses:
        enrollment_count = db.query(models.Enrollment).filter(models.Enrollment.course_id == c.id).count()
        result.append(schemas.CourseSummary(
            id=c.id, title=c.title, description=c.description,
            category=c.category, skill_level=c.skill_level, price=c.price,
            thumbnail_url=c.thumbnail_url, is_published=c.is_published,
            instructor_id=c.instructor_id, instructor=c.instructor,
            enrollment_count=enrollment_count, created_at=c.created_at,
        ))
    return result


@router.get("/{course_id}", response_model=schemas.CourseOut)
def get_course(course_id: int, db: Session = Depends(get_db)):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@router.post("/", response_model=schemas.CourseOut, status_code=201)
def create_course(
    course_in: schemas.CourseCreate,
    current_user: models.User = Depends(auth.require_instructor_or_admin),
    db: Session = Depends(get_db),
):
    course = models.Course(**course_in.model_dump(), instructor_id=current_user.id)
    db.add(course)
    db.commit()
    db.refresh(course)
    return course


@router.put("/{course_id}", response_model=schemas.CourseOut)
def update_course(
    course_id: int,
    course_in: schemas.CourseUpdate,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db),
):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if course.instructor_id != current_user.id and current_user.role != models.UserRole.admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    for field, value in course_in.model_dump(exclude_unset=True).items():
        setattr(course, field, value)
    db.commit()
    db.refresh(course)
    return course


@router.delete("/{course_id}", status_code=204)
def delete_course(
    course_id: int,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db),
):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if course.instructor_id != current_user.id and current_user.role != models.UserRole.admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    db.delete(course)
    db.commit()


# ─── Lessons ──────────────────────────────────────────────────────────────────

@router.post("/{course_id}/lessons", response_model=schemas.LessonOut, status_code=201)
def add_lesson(
    course_id: int,
    lesson_in: schemas.LessonCreate,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db),
):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if course.instructor_id != current_user.id and current_user.role != models.UserRole.admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    lesson = models.Lesson(**lesson_in.model_dump(), course_id=course_id)
    db.add(lesson)
    db.commit()
    db.refresh(lesson)
    return lesson


@router.delete("/{course_id}/lessons/{lesson_id}", status_code=204)
def delete_lesson(
    course_id: int,
    lesson_id: int,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db),
):
    lesson = db.query(models.Lesson).filter(
        models.Lesson.id == lesson_id,
        models.Lesson.course_id == course_id
    ).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    course = lesson.course
    if course.instructor_id != current_user.id and current_user.role != models.UserRole.admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    db.delete(lesson)
    db.commit()
