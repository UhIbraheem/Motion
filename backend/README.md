# Motion Backend API ⚙️

Node.js + Express backend API for Motion - AI-powered local adventure discovery.

## Overview

The Motion backend provides RESTful API endpoints for AI adventure generation, Google Places integration, authentication, and data management. Deployed on Railway for production use.

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: JavaScript
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4
- **Maps**: Google Places API v1

## Project Structure

```
backend/
├── routes/
│   ├── adventures.js    # Adventure CRUD and scheduling
│   ├── ai.js            # AI generation endpoints
│   ├── auth.js          # Authentication routes
│   ├── photos.js        # Google Places photos
│   └── places.js        # Places enhancement
├── services/
│   ├── GooglePlacesService.js    # Places API integration
│   └── PlaceValidationService.js # Location validation
├── utils/
│   └── jsonExtractor.js # JSON parsing utilities
└── index.js             # Server entry point
```

## API Endpoints

### Health Check
```
GET /health
```

### AI Generation
```
POST /api/ai/generate-plan
POST /api/ai/regenerate-step
```

### Adventures
```
POST /api/adventures/create-enhanced
PATCH /api/adventures/:id/schedule
PATCH /api/adventures/:id/steps/:stepId/toggle
PATCH /api/adventures/:id/complete
DELETE /api/adventures/:id
GET /api/adventures/calendar/:userId
```

### Google Places
```
POST /api/places/photos
POST /api/places/enhance
```

## Setup

### Prerequisites
- Node.js 18+
- Supabase account
- OpenAI API key
- Google Places API key

### Installation

```bash
# Install dependencies
cd backend
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

Server runs on `http://localhost:3001`

## Environment Variables

Create `.env` file with:

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_key

# Google Places
GOOGLE_PLACES_API_KEY=your_google_places_key

# Server
PORT=3001
NODE_ENV=development
```

## Development

```bash
# Run development server with auto-reload
npm run dev

# Run production server
npm start
```

## Deployment

### Railway

The backend is deployed on Railway at `https://api.motionflow.app`

**Environment Variables (Railway):**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `GOOGLE_PLACES_API_KEY`
- `NODE_ENV=production`

**Auto-Deployment:**
- Connected to GitHub main branch
- Deploys automatically on push

### Manual Deployment

```bash
# Push to GitHub
git push origin main

# Railway will auto-deploy
```

## API Documentation

### Generate Adventure

```bash
POST /api/ai/generate-plan
Content-Type: application/json

{
  "location": "San Francisco, CA",
  "vibe": "adventurous",
  "budget": "moderate",
  "duration": "4-6 hours",
  "categories": ["food", "culture"],
  "groupSize": "2-4",
  "dietaryRestrictions": []
}
```

### Schedule Adventure

```bash
PATCH /api/adventures/:id/schedule
Content-Type: application/json

{
  "scheduledDate": "2025-10-20T10:00:00Z",
  "userId": "user-id"
}
```

## CORS Configuration

Allowed origins:
- `https://app.motionflow.app` (production web)
- `https://motionflow.app` (landing page)
- `http://localhost:3000` (local web)
- `http://localhost:3001` (local backend)
- `*` (development mode only)

## Health Check

```bash
curl https://api.motionflow.app/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-13T12:00:00.000Z"
}
```

---

For more information, see the [main README](../README.md)

