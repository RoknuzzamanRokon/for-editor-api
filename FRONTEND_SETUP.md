# Frontend Setup Guide

This guide will help you set up the Next.js frontend for your PDF Converter application.

## Prerequisites

- Node.js 18+ and npm installed
- Backend already running on port 8000

## Quick Start

### 1. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 2. Start Development Servers

#### Option A: Start Both Services Together (Recommended)

From the project root:

```bash
./start-dev.sh
```

This will start:
- Backend on http://localhost:8000
- Frontend on http://localhost:3000

#### Option B: Start Services Separately

Terminal 1 - Backend:
```bash
cd backend
pipenv run uvicorn main:app --reload --port 8000
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

### 3. Access the Application

Open your browser and navigate to:
- **Frontend UI**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main page with tabs
│   └── globals.css         # Global styles
├── components/
│   ├── ExcelConverter.tsx  # PDF to Excel converter
│   └── DocsConverter.tsx   # PDF to Word converter
├── next.config.js          # Next.js configuration (API proxy)
├── package.json
└── tsconfig.json
```

## Features

### PDF to Excel Conversion
- Upload PDF files (max 50MB)
- Extract tables to Excel format
- View and download converted files
- Track conversion statistics

### PDF to Word Conversion
- Upload PDF files (max 50MB)
- Extract text and formatting to Word
- View and download converted files
- Track conversion statistics

## API Integration

The frontend connects to the backend through Next.js API rewrites configured in `next.config.js`:

```javascript
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: 'http://127.0.0.1:8000/:path*',
    },
  ];
}
```

All API calls use the `/api` prefix which is automatically proxied to the backend.

## Backend Changes

The backend has been updated with CORS support in `backend/main.py`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Production Deployment

### Build the Frontend

```bash
cd frontend
npm run build
```

### Start Production Server

```bash
npm start
```

### Nginx Configuration

Use the provided `nginx-nextjs.conf` for production deployment with Nginx:

```bash
sudo cp nginx-nextjs.conf /etc/nginx/sites-available/pdf-converter
sudo ln -s /etc/nginx/sites-available/pdf-converter /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Troubleshooting

### Port Already in Use

If port 3000 is already in use:

```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

### API Connection Issues

1. Ensure backend is running on port 8000
2. Check CORS configuration in `backend/main.py`
3. Verify API proxy in `frontend/next.config.js`

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Development Tips

- Hot reload is enabled for both frontend and backend
- Use browser DevTools Network tab to debug API calls
- Check backend logs for API errors
- Frontend uses localStorage for statistics persistence

## Environment Variables (Optional)

Create `frontend/.env.local` for custom configuration:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Then update the API calls to use this variable.
