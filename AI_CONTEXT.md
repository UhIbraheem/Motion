# AI Context for Motion Project
**Last Updated:** 2025-10-28
**Purpose:** Help AI assistants quickly understand Motion's architecture and implementation

---

## 🏗️ Project Architecture

### **Tech Stack Summary:**
- **Frontend:** Next.js 15 (App Router), React, TypeScript, Tailwind CSS
- **Backend:** Node.js/Express, hosted on Railway
- **Database:** Supabase (PostgreSQL with Row Level Security)
- **Authentication:** Supabase Auth with Google OAuth
- **APIs:** Google Places API (New), Google Geocoding API, OpenAI GPT-4
- **Deployment:** Vercel (frontend), Railway (backend)
- **Domain:** app.motionflow.app (production)

### **Directory Structure:**
```
Motion/
├── motion-web/           # Next.js frontend application
│   ├── src/
│   │   ├── app/         # Next.js 15 app router pages
│   │   │   ├── auth/    # Authentication pages
│   │   │   ├── plans/   # Saved adventures page
│   │   │   ├── generate-plan/  # Adventure creation
│   │   │   └── discover/       # Public adventures
│   │   ├── components/  # Reusable React components
│   │   ├── contexts/    # React contexts (AuthContext)
│   │   ├── services/    # API service layers
│   │   └── utils/       # Helper functions
│   └── public/          # Static assets
├── backend/             # Express API server
│   ├── routes/          # API endpoints
│   │   ├── ai.js        # Adventure generation
│   │   └── adventures.js # Adventure CRUD
│   └── services/        # Business logic
│       └── GooglePlacesService.js  # Google Places integration
└── docs/                # Documentation

```

---

## 🔐 Services & APIs

### **Supabase: Authentication & Database**

**Configuration:**
- URL: `NEXT_PUBLIC_SUPABASE_URL`
- Anon Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Service Role Key: `SUPABASE_SERVICE_ROLE_KEY` (backend only)

**Key Tables:**

1. **profiles** - User account data
   ```sql
   - id (uuid, PK, references auth.users)
   - display_name (text)
   - first_name, last_name (text)
   - profile_picture_url (text)
   - membership_tier (text) - 'free' | 'explorer' | 'pro'
   - monthly_generations, monthly_edits (integer)
   - generations_limit, edits_limit (integer)
   - subscription_status (text) - 'active' | 'inactive' | 'canceled'
   - last_reset_date (timestamp)
   ```

2. **adventures** - Saved adventure plans
   ```sql
   - id (uuid, PK)
   - user_id (uuid, FK to profiles)
   - title, description (text)
   - location (text)
   - steps (jsonb) - array of adventure steps
   - scheduled_date (timestamp) - when user scheduled it
   - is_scheduled (boolean) - scheduling flag
   - is_completed (boolean)
   - duration_hours (numeric)
   - estimated_cost (text) - '$', '$$', '$$$'
   - filters_used (jsonb)
   - google_places_validated (boolean)
   - created_at, updated_at (timestamps)
   ```

3. **google_places_cache** - Cached Google Places data
   ```sql
   - place_id (text, PK)
   - name, formatted_address (text)
   - rating, user_ratings_total (numeric)
   - photos (jsonb array)
   - last_updated (timestamp)
   ```

**RLS Policies:**
- Users can only access their own adventures (user_id = auth.uid())
- Users can only update their own profiles
- Google Places cache is readable by all authenticated users

---

### **Railway: Backend Deployment**

**Environment Variables Required:**
```
GOOGLE_PLACES_API_KEY=...
GOOGLE_API_KEY=...
OPENAI_API_KEY=...
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
PORT=3001
```

**Deployment Triggers:**
- Auto-deploy on push to `main` branch
- Manual deploy via Railway dashboard

**Monitoring:**
- Logs: Railway dashboard → Deployments → Logs
- Metrics: Railway dashboard → Deployments → Metrics

---

### **Google APIs**

#### **Places API (New):**
- **Purpose:** Business lookup and validation
- **Endpoint:** `https://places.googleapis.com/v1`
- **Rate Limits:** 100 requests/minute (adjust as needed)
- **Key:** `GOOGLE_PLACES_API_KEY`

**Implementation Details:**
- Located in: `backend/services/GooglePlacesService.js`
- Methods:
  - `geocodeLocation(locationString)` - Convert location to coordinates
  - `textSearch({ textQuery, biasCenter, biasRadiusMeters })` - Search places
  - `filterByLocationRelevance(places, targetLocation)` - Score and filter results
  - `validateDistance(place, targetCoords, maxRadiusMiles)` - Distance validation
  - `lookupBusiness(businessName, localityHint, bias, userRadiusMiles)` - Main lookup

**Caching:**
- Geocoding results cached in memory (7-day TTL)
- Fallback coordinates for top 50 US cities + 20 international

#### **Geocoding API:**
- **Purpose:** Convert location strings to coordinates
- **Rate Limits:** Part of Places API quota
- **Key:** Same as Places API key

---

### **OpenAI: Adventure Generation**

**Configuration:**
- Model: `gpt-4o` (GPT-4 Optimized)
- Key: `OPENAI_API_KEY`
- Rate Limits: Monitor usage in OpenAI dashboard

**Prompt Structure:**
Located in: `backend/routes/ai.js`

**System Prompt:**
- Instructs AI to generate JSON-formatted adventures
- Specifies output schema (title, description, steps array)
- Emphasizes local, authentic experiences
- Requires specific location targeting

**User Prompt Includes:**
- Location with full city, state, country
- Radius in miles
- Experience type filters (foodie, cultural, etc.)
- Budget level ($, $$, $$$)
- Duration (Quick, Half Day, Full Day, Extended)
- Dietary restrictions
- Group size

**Error Handling:**
- Timeout after 30 seconds
- Retry logic for transient failures
- Fallback to simpler generation if detailed fails

---

### **Vercel: Frontend Hosting**

**Deployment:**
- Auto-deploy from `main` branch
- Environment variables set in Vercel dashboard
- Domain: app.motionflow.app

**Environment Variables:**
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SITE_URL=https://app.motionflow.app
```

---

## 🗂️ Database Schema

### **Key Relationships:**
```
auth.users (Supabase Auth)
    ↓ (one-to-one)
profiles
    ↓ (one-to-many)
adventures
    ↓ (many-to-many via jsonb)
google_places_cache
```

### **Adventure Step Schema (jsonb):**
```typescript
{
  step_number: number,
  time: string, // "10:00 AM"
  duration_minutes: number,
  business_name: string,
  location: string,
  description: string,
  category: string,
  rating?: number,
  google_places?: {
    place_id: string,
    name: string,
    address: string,
    rating: number,
    photo_url?: string,
    opening_hours?: object,
    last_updated: string
  },
  photo_url?: string,
  photos?: [{ url: string, isPrimary: boolean }]
}
```

---

## 🐛 Common Issues and Solutions

### **Issue: Auth Redirect Loops**
**Solution:** Implemented in Task 2
- Session verification with retry logic (3 attempts)
- Increased wait time to 1500ms for cookie propagation
- Clear stale data before OAuth processing
- **File:** `motion-web/src/app/auth/callback/page.tsx`

### **Issue: Scheduling Not Persisting**
**Solution:** Implemented in Task 1
- Check BOTH `scheduled_date` AND `is_scheduled` flag
- Return full adventure object after scheduling
- Force refresh from database after save
- **Files:**
  - `motion-web/src/services/AdventureService.ts`
  - `motion-web/src/app/plans/page.tsx`

### **Issue: Location Filtering (Wrong City)**
**Solution:** Implemented in Task 5
- Geocode location to get real coordinates
- Implement scoring system (country, state, city matches)
- Use Haversine distance validation
- Filter threshold: score ≥ 70 (US) or ≥ 40 (international)
- **File:** `backend/services/GooglePlacesService.js`

### **Issue: Sign Out Not Clearing Session**
**Solution:** Implemented in Task 3
- Aggressive storage clearing (localStorage + sessionStorage)
- Retry verification (3 attempts)
- Hard reload with `window.location.href`
- **File:** `motion-web/src/contexts/AuthContext.tsx`

### **Issue: Photos Not Loading**
**Solution:** Implemented in Task 6
- Multi-tier fallback system (7 sources)
- localStorage cache with 24hr TTL
- Unsplash generic images as backup
- **File:** `motion-web/src/app/plans/page.tsx`

---

## 🔄 Development Workflow

### **Local Development:**

1. **Frontend (motion-web):**
   ```bash
   cd motion-web
   npm install
   npm run dev
   # Runs on http://localhost:3000
   ```

2. **Backend:**
   ```bash
   cd backend
   npm install
   node index.js
   # Runs on http://localhost:3001
   ```

3. **Environment Setup:**
   - Copy `.env.example` to `.env.local` (frontend)
   - Copy `.env.example` to `.env` (backend)
   - Fill in all API keys

### **Testing:**
- **Frontend:** `npm run build` - Check for TypeScript errors
- **Backend:** Test endpoints with Postman or curl
- **Integration:** Test full flow locally before deploying

### **Deployment:**
1. **Frontend:** Push to `main` → Auto-deploys to Vercel
2. **Backend:** Push to `main` → Auto-deploys to Railway
3. **Database:** Migrations run automatically via Supabase

### **Branching Strategy:**
- `main` - Production-ready code
- `claude/*` - Claude Code feature branches
- Create PR from claude branch to main

---

## 📝 Code Standards

### **Naming Conventions:**
- **Files:** `PascalCase.tsx` for components, `camelCase.ts` for utilities
- **Functions:** `camelCase` for functions, `PascalCase` for React components
- **Variables:** `camelCase` for local variables, `UPPER_SNAKE_CASE` for constants
- **Database:** `snake_case` for table and column names

### **File Organization:**
- **One component per file** (except for small helpers)
- **Export default** for main component/function
- **Named exports** for supporting functions/types
- **Imports order:** React/Next → Third-party → Local components → Utils → Types

### **TypeScript Usage:**
- **Use interfaces** for object shapes
- **Use types** for unions and primitives
- **Avoid `any`** - use `unknown` or proper typing
- **Export types** from same file as usage when possible

### **Component Structure:**
```typescript
// 1. Imports
import React, { useState } from 'react';

// 2. Types/Interfaces
interface Props {
  title: string;
}

// 3. Component
export default function MyComponent({ title }: Props) {
  // 4. State
  const [data, setData] = useState(null);

  // 5. Effects
  useEffect(() => {
    // ...
  }, []);

  // 6. Event Handlers
  const handleClick = () => {
    // ...
  };

  // 7. Render
  return (
    <div>
      {/* ... */}
    </div>
  );
}
```

---

## 🚨 Important Notes

### **Security:**
- **Never commit** `.env` files
- **Use** `NEXT_PUBLIC_` prefix for client-safe env vars
- **Keep** service role keys backend-only
- **Validate** all user inputs before database operations

### **Performance:**
- **Use** React.memo() for expensive components
- **Implement** lazy loading for images
- **Cache** API responses when possible
- **Minimize** re-renders with useCallback/useMemo

### **Error Handling:**
- **Always** catch and log errors
- **Provide** user-friendly error messages
- **Include** enough context for debugging
- **Use** try-catch in async functions

### **Logging:**
- **Prefix** logs with emoji for easy scanning: 🔐 Auth, 📷 Photos, 📍 Location, etc.
- **Include** relevant context (IDs, states)
- **Log** both success and failure cases
- **Use** console.error for actual errors

---

## 🔗 Useful Links

- **Supabase Dashboard:** https://app.supabase.com
- **Railway Dashboard:** https://railway.app
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Google Cloud Console:** https://console.cloud.google.com
- **OpenAI Dashboard:** https://platform.openai.com

---

**Last Updated:** 2025-10-28
**Maintained By:** Claude Code
**For Questions:** Refer to IMPLEMENTATION_SUMMARY.md or project README.md
