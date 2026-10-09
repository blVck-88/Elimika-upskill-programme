from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from app import models
from app.routers import auth, courses, enrollments, exams, dashboard

# Create all database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Elimika Upskill Platform",
    description="Peer-to-peer teaching and learning platform for marketable skills",
    version="1.0.0",
)

# CORS — allow the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://frontend:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(courses.router)
app.include_router(enrollments.router)
app.include_router(exams.router)
app.include_router(dashboard.router)


@app.get("/")
def root():
    return {"message": "Elimika API is running", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}
