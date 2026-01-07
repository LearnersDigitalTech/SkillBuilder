# Frontend - React + Vite + Firebase Auth

## Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

## Environment Variables

Copy `.env.example` to `.env` and configure:
- `VITE_API_URL` - Backend API URL
- `VITE_FIREBASE_*` - Firebase config

## Structure

```
src/
├── main.jsx        # App entry
├── App.jsx         # Root component
├── api/            # API client layer
├── components/     # Reusable components
├── pages/          # Route pages
├── contexts/       # React contexts
├── hooks/          # Custom hooks
├── lib/            # Utilities
└── styles/         # Global styles
```

## Scripts

- `npm run dev` - Start dev server
- `npm run build` - Production build
- `npm run preview` - Preview build
