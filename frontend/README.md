# PDF Converter Frontend

Next.js frontend for the PDF Converter application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

The frontend will run on http://localhost:3000

## Backend Connection

The frontend connects to the FastAPI backend running on http://127.0.0.1:8000 through Next.js API rewrites.

All requests to `/api/*` are automatically proxied to the backend.

For client-side API base configuration, copy `frontend/.env.example` to `.env.local` and set:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

## Features

- PDF to Excel conversion
- PDF to Word conversion
- File upload with validation
- Converted files listing
- File download
- Conversion statistics tracking

## Build for Production

```bash
npm run build
npm start
```
