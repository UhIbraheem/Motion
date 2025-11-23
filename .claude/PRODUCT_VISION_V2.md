# Motion App - Product Vision & Roadmap

## 🎯 Core Vision (Updated 2024-11)

**Motion transforms from an AI-only adventure planner into a comprehensive place discovery, saving, and planning platform powered by Google Places API.**

### Primary Value Proposition
Instead of users searching Google Maps, taking screenshots, or writing notes hoping they remember places, Motion becomes their **digital memory** for places they want to visit.

---

## 🚀 New Core Features

### 1. "For Me" Page - Personal Place Library
**Purpose:** Central hub for discovering and saving places using Google Places API

**Features:**
- **Search & Discover:**
  - Search restaurants/cafes/attractions in any location using Google Places API
  - Filter by cuisine, price, rating, distance
  - View place details: photos, hours, reviews, contact info

- **Albums (Collections):**
  - Create custom albums: "Weekend Brunch Spots", "Date Night Ideas", "Miami Food Tour", etc.
  - Save places to multiple albums
  - Quick access to organized collections
  - Share albums with friends

- **Place Cards:**
  - Rich preview with Google Photos
  - Business hours, rating, price level
  - Save to album with one tap
  - Open in Maps or call directly

### 2. Dual Creation Mode - Manual + AI

**Tab 1: Manual Planning**
- Drag-and-drop timeline builder
- Add places from saved albums
- Set custom timestamps
- Add notes/instructions per step
- Reorder steps easily
- Save to Plans

**Tab 2: AI Creation** (Premium/Subscription)
- Current AI generation flow
- NEW: Replace any AI step with saved place from albums before saving
- Enhanced with manual editing post-generation

### 3. Universal Place Saving
**Save places from anywhere in the app:**
- From Discover page (public adventures)
- From friend's shared plans
- From your own plans
- From AI-generated adventures (before/after saving)

### 4. Enhanced Plans Management
- View all saved plans
- Each step shows place details from Google Places
- Quick "Save this place" button on any step
- Schedule plans with calendar integration

---

## 💰 Revenue Model

### 1. Premium AI Subscriptions (Primary Revenue)
**Tiers:**
- **Free:** 3 AI generations/month, basic features
- **Pro:** $9.99/mo - Unlimited AI generations, multi-day trip planner
- **Team:** $29.99/mo - Collaborative planning, shared albums

**Premium Features:**
- Multi-day trip planner (coming soon)
- Advanced AI customization
- Priority support
- Offline plan access (mobile)
- Export to PDF/Calendar

### 2. OpenTable Affiliate Links
- Integrate reservation links for restaurants
- Commission on completed bookings
- Seamless in-app booking experience

### 3. Sponsorships & Partnerships
- Featured place listings
- "Recommended by Motion" badges
- Local tourism board partnerships
- Restaurant/venue partnerships

---

## 📅 Implementation Roadmap

### Phase 1: Foundation (Current Sprint)
- [x] Fix Google Places API integration
- [x] Fix geocoding service
- [ ] Enable Geocoding API in Google Cloud
- [ ] Create "For Me" page shell
- [ ] Implement basic place search with Google Places
- [ ] Create album system (backend + frontend)

### Phase 2: Core Features (Week 2-3)
- [ ] Album CRUD operations
- [ ] Save place to album functionality
- [ ] Manual plan creation UI
  - [ ] Timeline builder
  - [ ] Add places from albums
  - [ ] Set timestamps
  - [ ] Save to Plans
- [ ] Dual-tab creation page (Manual + AI)
- [ ] Replace AI step with saved place

### Phase 3: Enhanced Discovery (Week 4)
- [ ] Advanced place search filters
- [ ] Place detail modal with rich info
- [ ] Map view for saved places
- [ ] Share albums feature
- [ ] Import places from Google Maps (if possible)

### Phase 4: Mobile Parity (Week 5-6)
- [ ] React Native "For Me" page
- [ ] Mobile album management
- [ ] Mobile manual planning
- [ ] Mobile AI generation improvements

### Phase 5: Premium Features (Week 7-8)
- [ ] Multi-day trip planner
- [ ] Collaborative planning
- [ ] OpenTable integration
- [ ] Subscription billing (Stripe)
- [ ] Analytics dashboard

### Phase 6: Polish & Launch (Week 9-10)
- [ ] UI/UX refinements
- [ ] Performance optimization
- [ ] SEO optimization
- [ ] Marketing site
- [ ] App Store / Play Store submission

---

## 🏗️ Architecture Changes

### New Database Tables
```sql
-- Albums (Collections)
CREATE TABLE albums (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Saved Places
CREATE TABLE saved_places (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  google_place_id VARCHAR(255) NOT NULL,
  business_name VARCHAR(255),
  address TEXT,
  lat DECIMAL,
  lng DECIMAL,
  photo_url TEXT,
  rating DECIMAL,
  price_level INT,
  google_data JSONB, -- Full Google Places response
  saved_at TIMESTAMP DEFAULT NOW()
);

-- Album Places (Many-to-Many)
CREATE TABLE album_places (
  id UUID PRIMARY KEY,
  album_id UUID REFERENCES albums(id) ON DELETE CASCADE,
  saved_place_id UUID REFERENCES saved_places(id) ON DELETE CASCADE,
  added_at TIMESTAMP DEFAULT NOW(),
  notes TEXT,
  UNIQUE(album_id, saved_place_id)
);
```

### New API Endpoints
```
# Albums
GET    /api/albums                    # Get user's albums
POST   /api/albums                    # Create album
PUT    /api/albums/:id               # Update album
DELETE /api/albums/:id               # Delete album
GET    /api/albums/:id/places        # Get places in album

# Saved Places
POST   /api/places/save              # Save place to collection
DELETE /api/places/:id               # Remove saved place
POST   /api/places/:id/add-to-album  # Add to specific album

# Place Search (proxy to Google Places)
GET    /api/places/search            # Search places
GET    /api/places/nearby            # Nearby places
GET    /api/places/details/:placeId  # Place details
```

---

## 🎨 UI/UX Considerations

### "For Me" Page Layout
```
┌─────────────────────────────────────┐
│  🔍 Search: Restaurants in Miami    │
├──────────────┬──────────────────────┤
│              │                      │
│  Albums      │   Search Results     │
│  ────────    │   ────────────       │
│  📁 Date     │   [Place Card]       │
│     Night    │   [Place Card]       │
│  📁 Brunch   │   [Place Card]       │
│  📁 Miami    │   [Place Card]       │
│  + New Album │                      │
│              │   [Load More]        │
└──────────────┴──────────────────────┘
```

### Manual Planning Flow
```
1. Click "Create" → Select "Manual Planning"
2. Add step → Choose from:
   - Select from albums
   - Search new place
   - Custom location (no business)
3. Set time for step
4. Add notes/instructions
5. Reorder steps by drag-drop
6. Save adventure
```

---

## 📊 Success Metrics

### User Engagement
- Places saved per user
- Albums created per user
- Manual vs AI plan creation ratio
- Plans created per month
- Return user rate

### Revenue
- Free → Pro conversion rate
- Churn rate
- Average revenue per user (ARPU)
- OpenTable referral conversion
- Lifetime value (LTV)

### Technical
- Google Places API usage
- AI generation costs vs revenue
- Cache hit rates
- API response times

---

## 🔒 Security & Privacy

- User albums can be private or public
- Saved places are private by default
- Can share albums with specific users or public link
- Cannot see other users' private collections
- Data export for GDPR compliance

---

## 📱 Mobile App Enhancements

### Priority Features for Mobile
1. Quick place saving from Maps
2. Offline access to saved albums
3. "Nearby" quick search
4. Share album link via SMS/social
5. Camera integration for place photos

---

## 🎯 Competitive Advantages

1. **Integrated Discovery + Planning:** Unlike Google Maps (no planning) or TripAdvisor (clunky), we combine both seamlessly
2. **AI-Powered Intelligence:** Auto-generate plans from preferences
3. **Personal Memory:** Albums act as your "places I want to try" list
4. **Social Discovery:** See friends' favorite places and plans
5. **One Platform:** No need for screenshots, notes apps, or bookmarks

---

## 🚧 Technical Debt & Fixes Needed

### Immediate Fixes
- [x] Fix "fn is not a function" error in Google Places lookups
- [ ] Enable Geocoding API in Google Cloud Console
- [ ] Fix auth redirect race condition
- [ ] Add proper error handling for API failures

### Optimization
- [ ] Implement place data caching
- [ ] Reduce redundant Google Places API calls
- [ ] Optimize image loading
- [ ] Add loading states everywhere

---

**Last Updated:** 2024-11-22
**Status:** Phase 1 - Foundation in progress
