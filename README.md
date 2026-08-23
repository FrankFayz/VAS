# VAS — Virtual Assistant Supervisor

AI-powered exam integrity platform with Django REST API, React frontend, Neon PostgreSQL, and Cloudinary evidence storage.

## Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Django + Django REST Framework + JWT
- **Database:** PostgreSQL (Neon)
- **Media:** Cloudinary (images & videos — URLs stored in DB)

## Quick Start

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Default admin (auto-created on migrate):
- **Email:** admin@vas.edu
- **Username:** admin
- **Password:** Admin@VAS2026

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Features

- Supervisor sign-up with **admin approval workflow**
- Admin dashboard to approve/reject/suspend users
- Live supervisor dashboard with AI-detected incidents
- Incident detail with evidence viewer (Cloudinary)
- Evidence upload to Cloudinary (images & videos)
- Exam session & hall management
- Camera evidence library (admin) with delete rights

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/signup/` | Supervisor registration |
| `POST /api/auth/login/` | JWT login |
| `GET /api/auth/admin/pending/` | Pending approvals |
| `POST /api/auth/admin/users/:id/approve/` | Approve supervisor |
| `GET /api/incidents/` | List incidents |
| `POST /api/incidents/:id/evidence/` | Camera/admin evidence ingest |
| `DELETE /api/incidents/:id/evidence/:eid/` | Delete evidence |
| `GET /api/incidents/evidence/` | Admin evidence library |

## Environment

Copy `backend/.env` and `frontend/.env` with your credentials. Never commit secrets to git.
