# Spot Finder Feature - Technical Specification

Feature: Individual Spot Discovery & Favorites System
Priority: HIGH (Phase 1 - Post-MVP)
Estimated Effort: 3-4 weeks
Target Release: Q1 2025

---

## FEATURE OVERVIEW

**Spot Finder** is a mini version of the main adventure creator that allows users to:
1. Browse places filtered by a single category (e.g., "Foodie Adventure")
2. Drill down into subcategories (e.g., "Italian", "Arabic", "American")
3. Save favorite spots for later use
4. Create micro-plans (1-2 hour quick adventures)
5. Add saved spots to existing adventures manually

---

## USER STORIES

### Story 1: Discovering Spots
```
As a user
I want to browse restaurants in a specific cuisine category
So that I can find new places to try without planning a full adventure

Acceptance Criteria:
- I can select a filter category (e.g., "Foodie Adventure")
- I can see subcategories specific to that filter
- I can browse spots with photos, ratings, and details
- I can see distance from my current location
- I can filter by price level and rating
```

### Story 2: Saving Favorites
```
As a user
I want to save spots I like to my favorites
So that I can easily find them later and add them to adventures

Acceptance Criteria:
- I can heart/save any spot
- I can add personal notes to saved spots
- I can organize favorites by category
- I can view all my favorites in one place
- I can remove spots from favorites
```

### Story 3: Creating Micro-Plans
```
As a user
I want to create quick 1-2 hour plans from spot finder
So that I can have a spontaneous outing without full adventure planning

Acceptance Criteria:
- I can select 2-3 spots to create a quick plan
- System auto-calculates travel time and duration
- I can save the micro-plan as a full adventure
- Micro-plan respects budget and time constraints
```

### Story 4: Manual Adventure Building
```
As a user
I want to add my favorite spots to adventures I'm creating
So that I can ensure my favorite places are included

Acceptance Criteria:
- When creating adventure, I see "Add from Favorites" option
- I can insert a favorite spot at any step
- AI adjusts the adventure around my inserted spot
- Spots maintain my personal notes and preferences
```

---

## FILTER CATEGORY STRUCTURE

### Complete Category/Subcategory Map

```typescript
export const SPOT_FINDER_CATEGORIES = {
  "Foodie Adventure": {
    icon: "🍽️",
    color: "#FF6B6B",
    subcategories: [
      { key: "italian", label: "Italian", tags: ["pasta", "pizza", "wine"] },
      { key: "arabic", label: "Arabic", tags: ["halal", "mediterranean", "shawarma"] },
      { key: "american", label: "American", tags: ["burgers", "bbq", "diner"] },
      { key: "asian", label: "Asian", tags: ["sushi", "ramen", "thai", "chinese"] },
      { key: "mexican", label: "Mexican", tags: ["tacos", "margaritas", "authentic"] },
      { key: "french", label: "French", tags: ["bistro", "fine-dining", "pastries"] },
      { key: "indian", label: "Indian", tags: ["curry", "tandoori", "vegetarian"] },
      { key: "vegan", label: "Vegan/Vegetarian", tags: ["plant-based", "healthy"] },
      { key: "desserts", label: "Desserts & Sweets", tags: ["bakery", "ice-cream", "cafe"] },
      { key: "fine-dining", label: "Fine Dining", tags: ["upscale", "michelin", "tasting-menu"] },
      { key: "casual", label: "Casual Dining", tags: ["family-friendly", "affordable"] },
      { key: "brunch", label: "Brunch Spots", tags: ["breakfast", "coffee", "weekend"] }
    ]
  },

  "Academic Weapon": {
    icon: "📚",
    color: "#4ECDC4",
    subcategories: [
      { key: "cafes", label: "Study Cafes", tags: ["wifi", "quiet", "coffee"] },
      { key: "libraries", label: "Libraries", tags: ["free", "books", "quiet"] },
      { key: "coworking", label: "Coworking Spaces", tags: ["professional", "networking"] },
      { key: "bookstores", label: "Bookstores", tags: ["independent", "reading"] },
      { key: "museums", label: "Museums", tags: ["educational", "cultural"] },
      { key: "workshops", label: "Workshops & Classes", tags: ["learning", "skills"] }
    ]
  },

  "Nature": {
    icon: "🌳",
    color: "#95E1D3",
    subcategories: [
      { key: "parks", label: "Parks", tags: ["picnic", "walking", "dogs"] },
      { key: "hiking", label: "Hiking Trails", tags: ["outdoor", "exercise", "scenic"] },
      { key: "beaches", label: "Beaches", tags: ["water", "sunset", "relaxing"] },
      { key: "gardens", label: "Botanical Gardens", tags: ["flowers", "peaceful"] },
      { key: "viewpoints", label: "Scenic Viewpoints", tags: ["photos", "sunset", "romantic"] },
      { key: "waterfalls", label: "Waterfalls", tags: ["nature", "hiking", "scenic"] }
    ]
  },

  "Artsy": {
    icon: "🎨",
    color: "#F38181",
    subcategories: [
      { key: "galleries", label: "Art Galleries", tags: ["contemporary", "exhibits"] },
      { key: "street-art", label: "Street Art/Murals", tags: ["urban", "photography"] },
      { key: "studios", label: "Craft Studios", tags: ["pottery", "diy", "workshops"] },
      { key: "theaters", label: "Theaters & Performance", tags: ["shows", "live-music"] },
      { key: "classes", label: "Art Classes", tags: ["painting", "drawing", "creative"] },
      { key: "markets", label: "Art Markets", tags: ["handmade", "local-artists"] }
    ]
  },

  "Wellness": {
    icon: "🧘",
    color: "#A8E6CF",
    subcategories: [
      { key: "yoga", label: "Yoga Studios", tags: ["fitness", "meditation", "classes"] },
      { key: "spas", label: "Spas & Massage", tags: ["relaxation", "treatment", "luxury"] },
      { key: "meditation", label: "Meditation Centers", tags: ["mindfulness", "peaceful"] },
      { key: "gyms", label: "Gyms & Fitness", tags: ["workout", "training", "equipment"] },
      { key: "healthy-food", label: "Healthy Eateries", tags: ["smoothies", "organic", "salads"] },
      { key: "outdoor", label: "Outdoor Fitness", tags: ["running", "cycling", "fresh-air"] }
    ]
  },

  "Partier": {
    icon: "🎉",
    color: "#FFD93D",
    subcategories: [
      { key: "bars", label: "Bars & Pubs", tags: ["drinks", "nightlife", "social"] },
      { key: "clubs", label: "Nightclubs", tags: ["dancing", "dj", "late-night"] },
      { key: "lounges", label: "Lounges", tags: ["cocktails", "upscale", "music"] },
      { key: "breweries", label: "Breweries", tags: ["craft-beer", "tours", "casual"] },
      { key: "wine-bars", label: "Wine Bars", tags: ["wine-tasting", "sophisticated"] },
      { key: "rooftops", label: "Rooftop Bars", tags: ["views", "sunset", "upscale"] }
    ]
  },

  "Hidden Gem": {
    icon: "💎",
    color: "#B39CD0",
    subcategories: [
      { key: "local-spots", label: "Local Favorites", tags: ["authentic", "off-beaten-path"] },
      { key: "secret-spots", label: "Secret Spots", tags: ["hidden", "exclusive"] },
      { key: "vintage", label: "Vintage & Antique Shops", tags: ["unique", "treasures"] },
      { key: "independent", label: "Independent Businesses", tags: ["small-business", "local"] },
      { key: "specialty", label: "Specialty Stores", tags: ["niche", "unique-finds"] }
    ]
  },

  "Explorer": {
    icon: "🗺️",
    color: "#6C5CE7",
    subcategories: [
      { key: "landmarks", label: "Landmarks & Monuments", tags: ["historic", "famous", "photos"] },
      { key: "neighborhoods", label: "Unique Neighborhoods", tags: ["walking-tour", "culture"] },
      { key: "markets", label: "Markets & Bazaars", tags: ["shopping", "local", "food"] },
      { key: "architecture", label: "Architecture", tags: ["buildings", "design", "historic"] },
      { key: "viewpoints", label: "City Viewpoints", tags: ["skyline", "panoramic"] }
    ]
  },

  "Special Occasion": {
    icon: "🎊",
    color: "#FD79A8",
    subcategories: [
      { key: "fine-dining", label: "Fine Dining", tags: ["upscale", "romantic", "celebration"] },
      { key: "experiences", label: "Unique Experiences", tags: ["memorable", "special"] },
      { key: "romantic", label: "Romantic Spots", tags: ["couples", "intimate", "date-night"] },
      { key: "event-venues", label: "Event Venues", tags: ["party", "celebration", "gatherings"] },
      { key: "luxury", label: "Luxury Services", tags: ["premium", "exclusive", "high-end"] }
    ]
  },

  "Culture Dive": {
    icon: "🏛️",
    color: "#74B9FF",
    subcategories: [
      { key: "museums", label: "Museums", tags: ["history", "art", "science"] },
      { key: "historic-sites", label: "Historic Sites", tags: ["heritage", "tours"] },
      { key: "cultural-centers", label: "Cultural Centers", tags: ["community", "events"] },
      { key: "religious-sites", label: "Religious Sites", tags: ["spiritual", "architecture"] },
      { key: "festivals", label: "Cultural Festivals", tags: ["events", "tradition", "celebration"] }
    ]
  },

  "Sweet Treat": {
    icon: "🍰",
    color: "#FFA5C1",
    subcategories: [
      { key: "bakeries", label: "Bakeries", tags: ["pastries", "bread", "fresh"] },
      { key: "ice-cream", label: "Ice Cream Shops", tags: ["gelato", "frozen-yogurt"] },
      { key: "dessert-bars", label: "Dessert Bars", tags: ["cakes", "chocolate", "sweets"] },
      { key: "cafes", label: "Dessert Cafes", tags: ["coffee", "pastries", "cozy"] },
      { key: "specialty", label: "Specialty Sweets", tags: ["macarons", "donuts", "unique"] }
    ]
  },

  "Puzzle Solver": {
    icon: "🧩",
    color: "#A29BFE",
    subcategories: [
      { key: "escape-rooms", label: "Escape Rooms", tags: ["team", "challenge", "puzzle"] },
      { key: "game-cafes", label: "Board Game Cafes", tags: ["strategy", "social", "fun"] },
      { key: "arcades", label: "Arcades", tags: ["retro", "gaming", "entertainment"] },
      { key: "mystery", label: "Mystery Experiences", tags: ["interactive", "immersive"] },
      { key: "trivia", label: "Trivia & Quiz Nights", tags: ["bars", "social", "competition"] }
    ]
  }
};
```

---

## DATABASE SCHEMA

### New Tables

```sql
-- Main spots table (cached Google Places data + user-generated)
CREATE TABLE spots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  google_place_id VARCHAR(255) UNIQUE,
  business_name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL, -- maps to experience type
  subcategory VARCHAR(100) NOT NULL,
  location VARCHAR(255) NOT NULL, -- city, state
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  address TEXT,
  phone VARCHAR(50),
  website TEXT,
  google_rating DECIMAL(3,2),
  price_level INT CHECK (price_level >= 1 AND price_level <= 4),
  photo_urls JSONB DEFAULT '[]',
  opening_hours JSONB,
  tags TEXT[] DEFAULT '{}',
  opentable_id VARCHAR(255), -- for OpenTable integration
  opentable_booking_url TEXT,
  user_submitted BOOLEAN DEFAULT false,
  submitted_by UUID REFERENCES profiles(id),
  verified BOOLEAN DEFAULT false,
  last_validated TIMESTAMP,
  view_count INT DEFAULT 0,
  save_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User's favorite spots
CREATE TABLE user_favorite_spots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  spot_id UUID REFERENCES spots(id) ON DELETE CASCADE,
  category VARCHAR(100),
  subcategory VARCHAR(100),
  personal_notes TEXT,
  custom_tags TEXT[] DEFAULT '{}',
  visited BOOLEAN DEFAULT false,
  visit_date DATE,
  personal_rating INT CHECK (personal_rating >= 1 AND personal_rating <= 5),
  favorited_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, spot_id)
);

-- Spot reviews (separate from adventure reviews)
CREATE TABLE spot_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  spot_id UUID REFERENCES spots(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  visit_date DATE,
  photos JSONB DEFAULT '[]',
  helpful_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, spot_id) -- one review per user per spot
);

-- Track which spots are in which adventures
CREATE TABLE adventure_spots (
  adventure_id UUID REFERENCES adventures(id) ON DELETE CASCADE,
  spot_id UUID REFERENCES spots(id),
  step_index INT NOT NULL,
  added_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (adventure_id, spot_id, step_index)
);

-- Indexes for performance
CREATE INDEX idx_spots_category ON spots(category, subcategory);
CREATE INDEX idx_spots_location ON spots USING GIST (ll_to_earth(latitude, longitude));
CREATE INDEX idx_spots_rating ON spots(google_rating DESC);
CREATE INDEX idx_spots_verified ON spots(verified) WHERE verified = true;
CREATE INDEX idx_favorite_spots_user ON user_favorite_spots(user_id);
CREATE INDEX idx_favorite_spots_category ON user_favorite_spots(category, subcategory);
CREATE INDEX idx_spot_reviews_spot ON spot_reviews(spot_id);
```

---

## API ENDPOINTS

### Spot Discovery

```typescript
/**
 * GET /api/spots/discover
 * Discover spots by category/subcategory
 */
interface DiscoverSpotsRequest {
  category: string; // e.g., "Foodie Adventure"
  subcategory?: string; // e.g., "Italian"
  location: string; // "San Francisco, CA"
  latitude?: number;
  longitude?: number;
  radius?: number; // miles, default 10
  minRating?: number; // 1-5, default 3.5
  priceLevel?: number[]; // [1,2,3,4]
  openNow?: boolean;
  page?: number; // default 1
  limit?: number; // default 20, max 50
  sortBy?: 'rating' | 'distance' | 'popular' | 'newest';
}

interface DiscoverSpotsResponse {
  spots: {
    id: string;
    businessName: string;
    category: string;
    subcategory: string;
    rating: number;
    priceLevel: number;
    photoUrl: string;
    address: string;
    distance: number; // miles from search center
    isFavorite: boolean; // for authenticated user
    saveCount: number;
    tags: string[];
    openNow: boolean;
    openTableAvailable: boolean;
  }[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Implementation
router.get('/api/spots/discover', async (req, res) => {
  const {
    category,
    subcategory,
    location,
    latitude,
    longitude,
    radius = 10,
    minRating = 3.5,
    priceLevel,
    openNow,
    page = 1,
    limit = 20,
    sortBy = 'rating'
  } = req.query;

  const userId = req.user?.id; // from auth middleware

  // Step 1: Geocode location if lat/lng not provided
  let coords = { lat: latitude, lng: longitude };
  if (!coords.lat || !coords.lng) {
    coords = await geocodeLocation(location);
  }

  // Step 2: Build query
  let query = supabase
    .from('spots')
    .select('*')
    .eq('category', category);

  if (subcategory) {
    query = query.eq('subcategory', subcategory);
  }

  // Step 3: Filter by distance (using PostGIS)
  const radiusMeters = radius * 1609.34; // convert miles to meters
  query = query.filter(
    'location',
    'st_distance',
    `POINT(${coords.lng} ${coords.lat})`,
    radiusMeters
  );

  // Step 4: Filter by rating
  query = query.gte('google_rating', minRating);

  // Step 5: Filter by price level
  if (priceLevel) {
    query = query.in('price_level', priceLevel);
  }

  // Step 6: Sort
  if (sortBy === 'rating') {
    query = query.order('google_rating', { ascending: false });
  } else if (sortBy === 'distance') {
    // Already filtered by distance
  } else if (sortBy === 'popular') {
    query = query.order('save_count', { ascending: false });
  }

  // Step 7: Paginate
  const offset = (page - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  const { data: spots, error } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Step 8: Check which are favorited by user
  let favoriteSpotIds = new Set();
  if (userId) {
    const { data: favorites } = await supabase
      .from('user_favorite_spots')
      .select('spot_id')
      .eq('user_id', userId);
    favoriteSpotIds = new Set(favorites?.map(f => f.spot_id) || []);
  }

  // Step 9: Format response
  const formattedSpots = spots.map(spot => ({
    id: spot.id,
    businessName: spot.business_name,
    category: spot.category,
    subcategory: spot.subcategory,
    rating: spot.google_rating,
    priceLevel: spot.price_level,
    photoUrl: spot.photo_urls?.[0] || null,
    address: spot.address,
    distance: calculateDistance(coords, { lat: spot.latitude, lng: spot.longitude }),
    isFavorite: favoriteSpotIds.has(spot.id),
    saveCount: spot.save_count,
    tags: spot.tags,
    openNow: isOpenNow(spot.opening_hours),
    openTableAvailable: !!spot.opentable_id
  }));

  res.json({
    spots: formattedSpots,
    totalCount: spots.length, // TODO: get accurate total
    page,
    pageSize: limit,
    hasMore: spots.length === limit
  });
});
```

### Favorite Management

```typescript
/**
 * POST /api/spots/favorite
 * Add spot to user's favorites
 */
router.post('/api/spots/favorite', requireAuth, async (req, res) => {
  const { spotId, category, subcategory, personalNotes, customTags } = req.body;
  const userId = req.user.id;

  // Check if already favorited
  const { data: existing } = await supabase
    .from('user_favorite_spots')
    .select('id')
    .eq('user_id', userId)
    .eq('spot_id', spotId)
    .single();

  if (existing) {
    return res.status(400).json({ error: 'Spot already in favorites' });
  }

  // Add to favorites
  const { data, error } = await supabase
    .from('user_favorite_spots')
    .insert({
      user_id: userId,
      spot_id: spotId,
      category,
      subcategory,
      personal_notes: personalNotes,
      custom_tags: customTags
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Increment save count on spot
  await supabase
    .from('spots')
    .update({ save_count: supabase.raw('save_count + 1') })
    .eq('id', spotId);

  res.json({ favorite: data });
});

/**
 * DELETE /api/spots/favorite/:spotId
 * Remove spot from favorites
 */
router.delete('/api/spots/favorite/:spotId', requireAuth, async (req, res) => {
  const { spotId } = req.params;
  const userId = req.user.id;

  const { error } = await supabase
    .from('user_favorite_spots')
    .delete()
    .eq('user_id', userId)
    .eq('spot_id', spotId);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Decrement save count
  await supabase
    .from('spots')
    .update({ save_count: supabase.raw('save_count - 1') })
    .eq('id', spotId);

  res.json({ success: true });
});

/**
 * GET /api/spots/favorites/:userId
 * Get user's favorite spots
 */
router.get('/api/spots/favorites/:userId', async (req, res) => {
  const { userId } = req.params;
  const { category, subcategory } = req.query;

  let query = supabase
    .from('user_favorite_spots')
    .select(`
      *,
      spots (*)
    `)
    .eq('user_id', userId);

  if (category) {
    query = query.eq('category', category);
  }
  if (subcategory) {
    query = query.eq('subcategory', subcategory);
  }

  query = query.order('favorited_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ favorites: data });
});
```

---

## UI COMPONENTS

### 1. SpotFinderPage.tsx

```typescript
// Main spot finder interface
export default function SpotFinderPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [filters, setFilters] = useState({
    minRating: 3.5,
    priceLevel: [1, 2, 3, 4],
    radius: 10,
    openNow: false
  });

  return (
    <div className="spot-finder-page">
      {/* Category Selector */}
      {!selectedCategory && (
        <CategoryGrid onSelect={setSelectedCategory} />
      )}

      {/* Subcategory Selector */}
      {selectedCategory && !selectedSubcategory && (
        <SubcategoryGrid
          category={selectedCategory}
          onSelect={setSelectedSubcategory}
          onBack={() => setSelectedCategory(null)}
        />
      )}

      {/* Spot List */}
      {selectedCategory && selectedSubcategory && (
        <SpotList
          category={selectedCategory}
          subcategory={selectedSubcategory}
          filters={filters}
          onBack={() => setSelectedSubcategory(null)}
        />
      )}
    </div>
  );
}
```

### 2. SpotCard.tsx

```typescript
// Individual spot display card
interface SpotCardProps {
  spot: Spot;
  onFavorite: (spotId: string) => void;
  onViewDetails: (spot: Spot) => void;
}

export function SpotCard({ spot, onFavorite, onViewDetails }: SpotCardProps) {
  return (
    <div className="spot-card" onClick={() => onViewDetails(spot)}>
      <img src={spot.photoUrl} alt={spot.businessName} />

      <div className="spot-card-content">
        <h3>{spot.businessName}</h3>
        <div className="spot-meta">
          <Rating value={spot.rating} />
          <PriceLevel level={spot.priceLevel} />
          <Distance value={spot.distance} />
        </div>

        <p className="spot-address">{spot.address}</p>

        <div className="spot-tags">
          {spot.tags.slice(0, 3).map(tag => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>

        {spot.openTableAvailable && (
          <Badge variant="success">OpenTable Available</Badge>
        )}
      </div>

      <button
        className="favorite-button"
        onClick={(e) => {
          e.stopPropagation();
          onFavorite(spot.id);
        }}
      >
        <Heart filled={spot.isFavorite} />
      </button>
    </div>
  );
}
```

### 3. SpotDetailModal.tsx

```typescript
// Full spot info modal
export function SpotDetailModal({ spot, isOpen, onClose }: SpotDetailModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="spot-detail-modal">
        {/* Photo Carousel */}
        <ImageCarousel images={spot.photoUrls} />

        {/* Basic Info */}
        <div className="spot-header">
          <h1>{spot.businessName}</h1>
          <Rating value={spot.rating} count={spot.reviewCount} />
        </div>

        {/* Contact & Hours */}
        <div className="spot-info">
          <InfoRow icon={<MapPin />} text={spot.address} />
          <InfoRow icon={<Phone />} text={spot.phone} />
          <InfoRow icon={<Globe />} text={spot.website} link />
          <InfoRow icon={<Clock />} text={getCurrentStatus(spot.openingHours)} />
        </div>

        {/* OpenTable Integration */}
        {spot.openTableAvailable && (
          <OpenTableButton
            restaurantId={spot.opentableId}
            bookingUrl={spot.opentableBookingUrl}
          />
        )}

        {/* Actions */}
        <div className="spot-actions">
          <Button onClick={() => handleAddToFavorites(spot)}>
            <Heart /> Save to Favorites
          </Button>
          <Button onClick={() => handleCreateMicroPlan(spot)}>
            <Zap /> Create Quick Plan
          </Button>
          <Button variant="secondary" onClick={() => handleAddToAdventure(spot)}>
            <Plus /> Add to Adventure
          </Button>
        </div>

        {/* Reviews */}
        <SpotReviewsSection spotId={spot.id} />
      </div>
    </Modal>
  );
}
```

---

## INTEGRATION WITH EXISTING FEATURES

### 1. Add to Adventure Creation Flow

```typescript
// In CreatePage.tsx or AdventureModal.tsx
function AdventureStepEditor({ step, index, onUpdate }) {
  const [showFavorites, setShowFavorites] = useState(false);
  const { favorites } = useFavoriteSpots();

  return (
    <div className="step-editor">
      {/* Existing step editing UI */}

      <Button
        variant="outline"
        onClick={() => setShowFavorites(true)}
      >
        <Star /> Add from Favorites
      </Button>

      {showFavorites && (
        <FavoritesPickerModal
          favorites={favorites}
          onSelect={(spot) => {
            onUpdate({
              ...step,
              business_name: spot.businessName,
              location: spot.address,
              google_place_id: spot.googlePlaceId,
              google_rating: spot.rating,
              // ... other spot data
            });
            setShowFavorites(false);
          }}
          onClose={() => setShowFavorites(false)}
        />
      )}
    </div>
  );
}
```

### 2. AI-Aware Favorite Spots

```typescript
// Enhance AI prompt to consider user's favorites
async function generateAdventure(filters, userId) {
  // Fetch user's favorite spots in relevant categories
  const favorites = await getFavoriteSpots(userId, {
    categories: filters.experienceTypes
  });

  // Add to prompt
  const enhancedPrompt = `
    ${basePrompt}

    USER'S FAVORITE SPOTS (prioritize if relevant):
    ${favorites.map(f => `- ${f.businessName} (${f.subcategory})`).join('\n')}
  `;

  // Generate with enhanced context
  return await generateWithOpenAI(enhancedPrompt);
}
```

---

## TESTING PLAN

### Unit Tests
- [ ] Spot discovery API returns correct results
- [ ] Filtering by category/subcategory works
- [ ] Distance calculation is accurate
- [ ] Favorite add/remove persists correctly
- [ ] Pagination works correctly

### Integration Tests
- [ ] End-to-end spot discovery flow
- [ ] Add spot to favorites → appears in favorites list
- [ ] Create micro-plan from spot finder
- [ ] Add favorite spot to existing adventure

### User Acceptance Tests
- [ ] User can browse spots by category
- [ ] User can save favorite spots
- [ ] User can view favorite spots library
- [ ] User can create quick plan from spots
- [ ] User can add favorites to adventures

---

## ROLLOUT PLAN

### Phase 1: MVP (Week 1-2)
- [ ] Database schema setup
- [ ] Basic API endpoints (discover, favorite)
- [ ] Simple UI (category selector, spot list)
- [ ] Add to favorites functionality

### Phase 2: Enhanced Discovery (Week 3)
- [ ] Advanced filtering (price, rating, distance)
- [ ] Spot detail modal
- [ ] Reviews integration
- [ ] OpenTable availability display

### Phase 3: Integration (Week 4)
- [ ] Add to adventure from favorites
- [ ] Micro-plan creation
- [ ] AI-aware favorite spots
- [ ] Analytics tracking

### Phase 4: Polish & Launch
- [ ] Performance optimization
- [ ] Mobile responsiveness
- [ ] Beta testing
- [ ] Public launch

---

**Status**: Specification Complete
**Next Step**: Begin Phase 1 implementation
**Owner**: Development Team
