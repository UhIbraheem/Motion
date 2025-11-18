# Motion Backend

Node.js + Express API for Motion adventure platform.

## Tech Stack

- Node.js 18+
- Express.js
- OpenAI GPT-4
- Google Places API v1
- Supabase PostgreSQL

## Setup

```bash
npm install
cp .env.example .env  # Add your API keys
npm start
```

## Environment Variables

Required in `.env`:
- `OPENAI_API_KEY`
- `GOOGLE_PLACES_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Key Endpoints

- `POST /api/ai/generate-plan` - Generate adventures
- `POST /api/adventures/create-enhanced` - Create adventure
- `PATCH /api/adventures/:id/schedule` - Schedule adventure
- `GET /health` - Health check

See `.claude/project.md` for full API documentation.
