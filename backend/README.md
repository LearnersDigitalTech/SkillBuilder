# Backend - FastAPI + PostgreSQL + Firebase Auth

## Setup

```bash
# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn app.main:app --reload --port 8000
```

## Environment Variables

Copy `.env.example` to `.env` and configure:
- `DATABASE_URL` - PostgreSQL connection string
- `FIREBASE_*` - Firebase credentials

## Structure

```
app/
├── main.py          # FastAPI app entry
├── config.py        # Environment config
├── database.py      # SQLAlchemy setup
├── models/          # Database models
├── schemas/         # Pydantic schemas
├── routers/         # API endpoints
├── services/        # Business logic
├── middleware/      # Auth & CORS
└── utils/           # Helpers
```
