# Motion - AI Adventure Planning App

## Product Vision (Updated 2024-11)

**Motion is evolving from an AI-only planner into a comprehensive place discovery, saving, and planning platform.**

**New Core Features:**
- **"For Me" Page:** Search/discover places with Google Places API, save to albums
- **Dual Creation:** Manual planning (free) + AI generation (premium subscription)
- **Universal Saving:** Save places from anywhere (Discover, friends' plans, AI results) to personal albums
- **Revenue:** Premium AI subscriptions, multi-day trip planner, OpenTable affiliate links

*See `.claude/PRODUCT_VISION_V2.md` for full roadmap*

---

## Tech Stack
**Backend:** Node.js/Express, Supabase PostgreSQL, OpenAI GPT-4o, Google Places API v1, Geocoding API
**Frontend:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
**Key Packages:** tiktoken (token counting), axios (HTTP), dotenv

### Architecture
- **Backend:** `/backend` - Express API on Railway
- **Frontend:** `/motion-web` - Next.js web app
- **Mobile:** `/motion-mobile` - React Native (limited features)

### Key Files

#### Backend Critical Files
```
backend/routes/ai.js          # AI generation, step regeneration, usage stats
backend/routes/albums.js      # Album CRUD operations
backend/routes/places.js      # Saved places and Google Places search proxy
backend/services/GooglePlacesService.js  # Places search, photos, OPERATIONAL filtering
backend/services/GeocodingService.js     # Location → lat/lng, LRU cache
backend/utils/openaiHelpers.js           # Token counting, cost estimation, prompt caching
backend/utils/rateLimiter.js             # Token bucket rate limiting
backend/utils/retryUtils.js              # Exponential backoff retry logic
backend/middleware/errorHandler.js       # Global error handling
```

#### Frontend Critical Files
```
motion-web/src/app/create/page.tsx          # Adventure creation form
motion-web/src/app/for-me/page.tsx          # Place discovery and album management
motion-web/src/app/plans/page.tsx           # Saved adventures list
motion-web/src/app/adventures/local/page.tsx  # Preview & save generated adventure
motion-web/src/app/auth/callback/page.tsx   # OAuth callback with race condition fix
motion-web/src/services/aiService.ts        # Frontend AI service wrapper
motion-web/src/components/TokenUsageBadge.tsx  # Cost tracking UI
motion-web/src/components/Navigation.tsx    # Main navigation with For Me link
motion-web/src/types/adventureTypes.ts      # TypeScript type definitions
```

### Database Schema (Supabase)
- `profiles` - User profiles (linked to auth.users)
- `saved_adventures` - User's saved plans
- `adventure_steps` - Individual steps in adventures
- `adventure_photos` - Photo URLs for adventures
- `community_adventures` - Public shared adventures
- `albums` - User's place collections
- `saved_places` - Individual saved places
- `album_places` - Many-to-many join table (albums ↔ places)

### Critical Business Logic

#### AI Generation Flow
1. User fills filters (location, vibes, budget, duration, dietary)
2. Frontend calls `/api/ai/generate-plan`
3. Backend builds AI prompt with filter context
4. OpenAI GPT-4o generates structured JSON (Structured Outputs)
5. Backend enhances with Google Places (business validation, photos, ratings)
6. Returns adventure with `_meta` (token usage, cost)

#### Google Places Enhancement
- **Search:** Text search with location bias (geocoded coordinates)
- **Validation:** Filter OPERATIONAL businesses only (no closed/temp closed)
- **Multi-stage Lookup:** Try specific location → fallback to broader search
- **Field Mask:** id, name, displayName, address, location, photos, rating, businessStatus, openingHours
- **Rate Limit:** 100 req/min via token bucket

#### Cost Optimization
- **Token Counting:** tiktoken `cl100k_base` encoding
- **Prompt Caching:** Supported (90% potential savings)
- **Rate Limiting:** Prevent excessive API usage
- **Geocoding Cache:** LRU cache, 24hr expiry, 1000 entries

### API Endpoints

#### AI Routes (`/api/ai/...`)
- `POST /generate-plan` - Generate adventure (params: `app_filter`, `radius`)
- `POST /regenerate-step` - Regenerate single step
- `GET /usage-stats/:sessionId?` - Token usage statistics

#### Adventure Routes (`/api/adventures/...`)
- `POST /` - Save adventure
- `GET /user/:userId` - Get user's adventures
- `PUT /:id` - Update adventure
- `DELETE /:id` - Delete adventure

#### Album Routes (`/api/albums/...`) - NEW
- `GET /` - Get user's albums with place counts
- `POST /` - Create album
- `GET /:id` - Get album with all places
- `PUT /:id` - Update album
- `DELETE /:id` - Delete album
- `POST /:id/places` - Add place to album
- `DELETE /:id/places/:placeId` - Remove place from album

#### Places Routes (`/api/places/...`) - NEW
- `GET /saved` - Get user's saved places
- `POST /save` - Save new place
- `DELETE /saved/:id` - Delete saved place
- `GET /search` - Search places (Google Places proxy)

### Environment Variables
```bash
# Backend
OPENAI_API_KEY=sk-...
GOOGLE_PLACES_API_KEY=AIza...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=eyJ...

# Frontend
NEXT_PUBLIC_API_URL=https://api.motionflow.app
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### Recent Major Changes

#### 2024-11 Session Updates (Latest)
1. **For Me Page** - Complete place discovery and album management system
   - Google Places search integration
   - Album CRUD with sidebar UI
   - Save places to albums
   - View album contents with place details
2. **Backend APIs** - Full REST API for albums and saved places
   - `/api/albums` - CRUD operations
   - `/api/places/saved` - Saved places management
   - `/api/places/search` - Google Places proxy
3. **Auth Fix** - Fixed redirect race condition with 500ms delay
4. **Business Validation Fix** - Added OPERATIONAL-only filtering
5. **Geocoding Service** - Fixed hardcoded SF coordinates
6. **TypeScript Cleanup** - Replaced all `any` types with proper typing
7. **Token Usage UI** - Real cache hit detection and cost tracking

### Common Patterns

#### Error Handling
```javascript
try {
  const result = await retryWithBackoff(async () => {
    return await apiCall();
  }, { maxRetries: 3, initialDelay: 1000 });
} catch (error) {
  console.error('Operation failed:', error);
  throw new APIError('Failed to complete operation', 500);
}
```

#### Type Safety
```typescript
import { AdventureStep, SavedAdventure } from '@/types/adventureTypes';

const steps = adventure.adventure_steps.map((step: AdventureStep) => ({
  title: step.title,
  business_name: step.business_name
}));
```

### Known Limitations & Fixes Needed
- ✅ ~~Geocoding API not enabled~~ - User resolved API key restrictions
- ✅ ~~Auth redirect race condition~~ - Fixed with session validation delay
- ✅ ~~GooglePlacesService errors~~ - Fixed singleton instantiation
- **Photo fallback:** No Unsplash/Pexels integration yet
- **Mobile app:** Basic features only, missing new features
- **Testing:** No E2E or unit tests yet
- **Manual Planning:** Not yet implemented (coming in Phase 2)

### Priority Roadmap (Updated 2024-11)
**Phase 1 - Foundation (COMPLETE ✅):**
1. ✅ Fix Google Cloud APIs (User resolved Geocoding API)
2. ✅ Fix "fn is not a function" error
3. ✅ Fix auth redirect race condition
4. ✅ Create "For Me" page with place search
5. ✅ Implement album system (backend + frontend)
6. ✅ View album contents and remove places

**Phase 2 - Core Features (In Progress):**
1. Manual plan creation UI with timeline builder
2. Save places to albums from Discover/Plans pages
3. Dual-tab creation page (Manual + AI)
4. Enhanced place search filters (cuisine, price, rating)
5. Replace AI step with saved place

**Phase 3 - Premium & Revenue:**
1. Multi-day trip planner
2. Subscription billing (Stripe)
3. OpenTable affiliate integration
4. Mobile app parity

*See `.claude/PRODUCT_VISION_V2.md` for detailed roadmap*

### Debugging Tips
- Check backend logs for `💰 Cost:`, `✅ Found:`, `❌ VALIDATION FAILED:`
- Frontend console shows token usage after generation
- Use `/api/metrics` endpoint for performance stats
- Check Supabase logs for database query issues

### Style Guide
- **Colors:** Primary `#3c7660` (green), Accent `#f2cc6c` (gold)
- **Typography:** System fonts, semibold for headings
- **Components:** Use shadcn/ui components (Button, Card, Badge, Dialog)
- **Icons:** lucide-react for UI, react-icons/io5 for specific icons

---
*Last updated: 2024-11-22*
