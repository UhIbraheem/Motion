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
motion-web/src/app/plans/page.tsx           # Saved adventures list
motion-web/src/app/adventures/local/page.tsx  # Preview & save generated adventure
motion-web/src/services/aiService.ts        # Frontend AI service wrapper
motion-web/src/components/TokenUsageBadge.tsx  # Cost tracking UI
motion-web/src/types/adventureTypes.ts      # TypeScript type definitions
```

### Database Schema (Supabase)
- `profiles` - User profiles (linked to auth.users)
- `saved_adventures` - User's saved plans
- `adventure_steps` - Individual steps in adventures
- `adventure_photos` - Photo URLs for adventures
- `community_adventures` - Public shared adventures

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

#### 2024-11 Session Updates
1. **Business Validation Fix** - Added OPERATIONAL-only filtering, enhanced AI prompts to prevent suggesting closed businesses
2. **Geocoding Service** - Fixed hardcoded SF coordinates, now dynamically geocodes user locations
3. **TypeScript Cleanup** - Replaced all `any` types with proper `AdventureStep` typing
4. **Token Usage UI** - Added TokenUsageBadge component showing cost breakdown and savings potential
5. **Error Handling** - Comprehensive retry logic, circuit breakers, global error middleware
6. **Performance Monitoring** - P50/P95/P99 percentile tracking for all operations

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
- **CRITICAL:** Geocoding API not enabled in Google Cloud (causes REQUEST_DENIED errors)
  → See `GOOGLE_CLOUD_SETUP.md` for fix instructions
- **Auth:** Race condition on redirect (user appears logged out until refresh)
  → Need to wait for session validation before redirect
- **Photo fallback:** No Unsplash/Pexels integration yet
- **Mobile app:** Basic features only, missing adventure creation
- **Testing:** No E2E or unit tests yet
- **Manual Planning:** Not yet implemented (coming in Phase 2)

### Priority Roadmap (Updated 2024-11)
**Phase 1 - Foundation (Current):**
1. Fix Google Cloud APIs (Geocoding API, Places API)
2. Fix "fn is not a function" error (✅ Fixed)
3. Fix auth redirect race condition
4. Create "For Me" page shell
5. Implement album system (backend + frontend)

**Phase 2 - Core Features:**
1. Manual plan creation UI with timeline builder
2. Save places to albums from anywhere
3. Dual-tab creation page (Manual + AI)
4. Enhanced place search and filters

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
