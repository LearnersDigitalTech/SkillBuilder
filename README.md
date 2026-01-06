# SkillBuilder - React + Express Migration

This project has been migrated from Next.js to a separate React frontend and Express backend architecture.

## Project Structure

```
SkillBuilder/
├── backend/          # Express API server
│   ├── src/
│   ├── prisma/
│   └── package.json
├── frontend/         # React application
│   ├── src/
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Redis (optional, for caching)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `env.example`):
```bash
cp env.example .env
```

4. Update `.env` with your database credentials

5. Run Prisma migrations:
```bash
npm run migrate
```

6. Start development server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `env.example`):
```bash
cp env.example .env
```

4. Start development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## Development

- **Backend**: Express server with TypeScript, Prisma ORM, JWT authentication
- **Frontend**: React with Vite, TypeScript, Tailwind CSS, TanStack Query, Zustand

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Quiz
- `GET /api/quiz/questions/:grade` - Get quiz questions
- `POST /api/quiz/submit` - Submit quiz answers
- `GET /api/quiz/results/:id` - Get quiz result

## Next Steps

1. Install dependencies in both backend and frontend
2. Setup PostgreSQL database
3. Run database migrations
4. Migrate existing components from old Next.js app
5. Implement remaining features

## Migration Status

✅ Backend structure setup
✅ Frontend structure setup
✅ Authentication system
⏳ Component migration in progress
⏳ Database migration pending
