# Motion - AI-Powered Local Adventure Discovery Platform

## Project Overview

Motion is a web and mobile application that uses AI to help users discover and plan personalized local adventures. The platform generates custom itineraries based on user preferences, integrates with Google Places for real-world business data, and provides an intuitive interface for managing and completing adventures.

## Technology Stack

### Frontend
- **Web App**: Next.js 14 (TypeScript, React, Tailwind CSS)
  - Location: `/motion-web`
  - Main components in `/motion-web/src/components`
  - Pages in `/motion-web/src/app`

- **Mobile App**: React Native (Expo)
  - Location: `/frontend`
  - Components in `/frontend/src/components`
  - Screens in `/frontend/src/screens`

### Backend
- **API**: Node.js/Express
  - Location: `/backend`
  - AI integration with OpenAI GPT-4
  - Google Places API (v1) integration
  - Routes in `/backend/routes`

### Database & Auth
- **Supabase**: PostgreSQL database with real-time subscriptions
- **Authentication**: Supabase Auth (Email/Password + Google OAuth)

## Key Features

### 1. AI-Powered Itinerary Generation
- Uses OpenAI GPT-4 with structured outputs
- Filters for high-quality venues (3.5+ star ratings)
- Integrates real Google Places data
- Path: `/backend/routes/ai.js`

### 2. Plans/Adventures Management
- Create, schedule, and complete adventures
- Track progress with step completion
- Drag-and-drop step reordering
- Smooth sliding navigation between steps
- Path: `/motion-web/src/components/EnhancedPlansModal.tsx`

### 3. Google Places Integration
- Real-time business data (ratings, hours, photos, reviews)
- Caching system for performance
- Path: `/motion-web/src/services/GooglePlacesService.ts`

## Code Style & Best Practices

### TypeScript
```typescript
// ✅ Good - Use 'unknown' for caught errors
catch (error: unknown) {
  console.error("Error:", error);
}

// ❌ Bad - Don't use 'any'
catch (error: any) {
  console.error("Error:", error);
}
```

### React Components
- Use functional components with hooks
- Prefer TypeScript interfaces over types for props
- Keep components focused and composable
- Use Tailwind CSS for styling (no inline styles)

### UI/UX Guidelines
- **Animations**: Use smooth transitions (300ms duration)
- **Colors**:
  - Primary: `#3c7660` (sage green)
  - Secondary: `#f2cc6c` (gold)
  - Accent: `#4d987b` (teal)
- **Spacing**: Use consistent padding/margin (4, 8, 12, 16, 24 px)
- **Modals**: Prevent background scrolling when open
- **Loading States**: Always show loading indicators for async operations

### Git Workflow
- **Branch Naming**: `claude/<feature-description>-<session-id>`
- **Commit Messages**: Use conventional commits format
  ```
  feat: Add drag-and-drop step reordering
  fix: Prevent background scroll in modal
  refactor: Simplify status card layout
  ```

## Important Files & Directories

### Core Components
- `/motion-web/src/components/EnhancedPlansModal.tsx` - Main adventure detail modal
- `/motion-web/src/app/plans/page.tsx` - Plans management page
- `/motion-web/src/app/auth/signin/page.tsx` - Authentication
- `/backend/routes/ai.js` - AI itinerary generation

### Configuration
- `/motion-web/src/app/globals.css` - Global styles & animations
- `/motion-web/.env.local` - Environment variables (not in git)
- `/backend/.env` - Backend env vars (not in git)

### Services
- `/motion-web/src/services/aiService.ts` - AI service wrapper
- `/motion-web/src/services/GooglePlacesService.ts` - Google Places API
- `/backend/services/GooglePlacesServiceV1.js` - Backend Places integration

## Common Tasks

### Adding a New Feature
1. Create feature branch: `git checkout -b claude/feature-name-<session-id>`
2. Implement changes following code style
3. Test thoroughly (manual testing for now)
4. Commit with descriptive message
5. Push to remote: `git push -u origin <branch-name>`

### Fixing UI Issues
1. Check `/motion-web/src/components` for relevant component
2. Use Tailwind classes for styling
3. Test responsiveness (mobile + desktop)
4. Ensure accessibility (ARIA labels, keyboard navigation)
5. Verify no background scroll issues in modals

### Updating AI Prompts
1. Edit `/backend/routes/ai.js`
2. Update system prompt in `generateAdventure` function
3. Test with various inputs
4. Ensure structured outputs schema is maintained

## Known Issues & Limitations

### Current Limitations
- Step reordering saves optimistically (backend API endpoint needed)
- Image loading can be slow for steps without cached Google Places photos
- No offline support yet
- Mobile app needs updates to match web app features

### Planned Features
- Completed plans management system (archive, share, stats)
- Social features (sharing adventures to community)
- Backend API for step reordering persistence
- Photo upload for completed adventures
- Friends/group adventures

## Development Commands

### Web App
```bash
cd motion-web
npm install
npm run dev  # Starts on localhost:3000
```

### Backend
```bash
cd backend
npm install
npm start    # Starts on configured port (Railway deployment)
```

### Mobile App
```bash
cd frontend
npm install
npx expo start
```

## Environment Variables

### Web App (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
NEXT_PUBLIC_API_URL=<backend-url>
```

### Backend (.env)
```
OPENAI_API_KEY=<your-openai-key>
GOOGLE_PLACES_API_KEY=<your-google-places-key>
SUPABASE_URL=<your-supabase-url>
SUPABASE_SERVICE_ROLE_KEY=<your-service-key>
```

## Database Schema (Key Tables)

### `adventures`
- User-created adventure plans
- Fields: title, description, location, steps, scheduled_for, is_completed

### `adventure_steps`
- Individual steps within adventures
- Fields: title, location, business_name, time, step_order, completed, google_places

### `profiles`
- User profiles with membership tiers
- Fields: membership_tier, monthly_generations, generations_limit

### `google_places_cache` (ENHANCED 2025-11-25)
- Cached Google Places data with comprehensive fields
- Fields: place_id (PK), name, formatted_address, lat, lng, rating, user_ratings_total, price_level, types[], phone_number, website, google_maps_url, opening_hours (JSONB), primary_photo_url, photos (JSONB), raw_data (JSONB), last_updated, last_api_fetch, fetch_count
- 7-day TTL for cache freshness
- Functions: upsert_google_place(), search_cached_places(), is_cache_fresh()

### `google_places_photos`
- Multiple photos per cached place
- Fields: id, place_id (FK), photo_url, photo_reference, width_px, height_px, is_primary, attribution, created_at

### `geocoding_cache`
- Cached location string → coordinates lookups
- Fields: id, location_query (unique), lat, lng, formatted_address, country, state, city, hit_count

### `place_usage_log`
- Tracks place usage for cache prioritization
- Fields: id, place_id, adventure_id, user_id, usage_type (generation/save/view/share), created_at

## Testing & Quality Assurance

### Manual Testing Checklist
- [ ] Sign in/Sign up flows work
- [ ] Adventure generation completes successfully
- [ ] All Google Places data displays correctly
- [ ] Step navigation works smoothly
- [ ] Drag-and-drop reordering functions
- [ ] Scheduling prevents same-day restrictions
- [ ] Modal prevents background scrolling
- [ ] Mobile responsive layout works
- [ ] Images load with proper fallbacks

### Code Quality
- Use TypeScript strict mode
- No `any` types (use `unknown` for errors)
- Prefer `const` over `let`
- Use async/await over promises
- Add error handling for all API calls
- Use meaningful variable/function names

## Deployment

### Web App
- Platform: Vercel (automatic deployments from `main` branch)
- Preview deployments for all PRs

### Backend
- Platform: Railway (automatic deployments from `main` branch)
- Environment variables configured in Railway dashboard

### Database
- Platform: Supabase (hosted PostgreSQL)
- Migrations in `/supabase/migrations`

## Support & Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Supabase Docs](https://supabase.com/docs)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Google Places API](https://developers.google.com/maps/documentation/places/web-service/overview)

### Key Contacts
- Project Lead: User
- AI Development: Claude (via Claude Code)

---

## Recent Updates (Session Log)

### 2025-01-18 - UI Improvements & Bug Fixes
- Fixed place names display (business name + address)
- Added county/locality extraction from addresses
- Improved business details section with better hierarchy
- Implemented step navigation with clickable numbers
- Added smooth sliding animations for step transitions
- Added drag-and-drop step reordering functionality
- Removed same-day scheduling restrictions
- Updated AI prompt to filter for 3.5+ star ratings
- Fixed `any` type errors to `unknown` in auth pages
- Removed duplicate UI in sign-in page
- Prevented background scrolling when modal is open
- Simplified status display to compact row layout
- Removed arrow connector (incompatible with sliding view)
