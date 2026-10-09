# Elimika Upskill Programme 🎓

A **peer-to-peer teaching and learning platform** for marketable skills, built with:
- ⚡ **React + Vite** — fast, modern frontend
- 🐍 **Python + FastAPI** — high-performance REST API
- 🗃️ **SQLite** — lightweight, file-based database
- 🐳 **Docker + Docker Compose** — containerised deployment

---

## Features

| Feature | Details |
|---|---|
| 🔐 **Auth** | JWT-based registration & login, role-based access (Student / Instructor / Admin) |
| 📚 **Courses** | CRUD, search & filter by category/level, publish/draft toggle |
| 🎯 **Enrollment** | One-click enroll, progress tracking |
| 📝 **Exams** | Create MCQ exams, auto-grade submissions |
| 📊 **Dashboard** | Platform-wide stats, recent activity |

---

## Quick Start

### Option A — Docker (Recommended)

```bash
# Build and run everything
docker-compose up --build

# App will be available at:
# Frontend: http://localhost
# API docs: http://localhost:8000/docs
```

### Option B — Local Development

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend (in a new terminal):**
```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

---

## Project Structure

```
Elimika-upskill-programme/
├── backend/
│   ├── app/
│   │   ├── main.py         # FastAPI app
│   │   ├── models.py       # SQLAlchemy models
│   │   ├── schemas.py      # Pydantic schemas
│   │   ├── auth.py         # JWT auth
│   │   ├── database.py     # DB connection
│   │   └── routers/        # Route handlers
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/          # Page components
│   │   ├── components/     # Shared components
│   │   ├── context/        # React context
│   │   ├── api.js          # API client
│   │   └── index.css       # Global styles
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
└── docker-compose.dev.yml
```

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login & get JWT |
| GET | `/api/auth/me` | Current user |
| GET | `/api/courses` | List published courses |
| POST | `/api/courses` | Create course (instructor) |
| PUT | `/api/courses/{id}` | Update course |
| DELETE | `/api/courses/{id}` | Delete course |
| POST | `/api/enrollments` | Enroll in course |
| GET | `/api/enrollments/my` | My enrollments |
| GET | `/api/dashboard/stats` | Platform stats |
| POST | `/api/exams` | Create exam |
| POST | `/api/exams/attempt` | Submit exam |

Full interactive docs at **http://localhost:8000/docs**
