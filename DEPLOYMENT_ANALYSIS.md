# CRITICAL Railway Environment Variables Required

## Backend (Railway) Required Environment Variables:
NODE_ENV=production
PORT=8080 (automatic)
OPENAI_API_KEY=your-openai-key
GOOGLE_PLACES_API_KEY=your-google-places-key
SUPABASE_URL=https://zhroxsksewvoipaufpsk.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

## Frontend (Vercel) Required Environment Variables:
NEXT_PUBLIC_API_URL=https://api.motionflow.app
NEXT_PUBLIC_SUPABASE_URL=https://zhroxsksewvoipaufpsk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=https://app.motionflow.app
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id

## Issue Analysis:
1. If NODE_ENV is not 'production' on Railway, CORS will allow "*" instead of specific domains
2. This causes browser security issues when trying to connect from Vercel
3. Railway auto-sets PORT but other env vars must be manually configured
