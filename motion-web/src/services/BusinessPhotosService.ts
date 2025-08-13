// Business photos service for Google Places API integration
interface PlaceSearchResult {
  place_id: string;
  name: string;
  vicinity: string;
  rating: number;
  price_level: number;
  types?: string[];
  photos: Array<{
    name: string;
    widthPx: number;
    heightPx: number;
  }>;
}

interface BusinessPhoto {
  url: string;
  width: number;
  height: number;
  source: 'google' | 'ai_generated';
  photo_reference?: string;
  label?: string; // resolved business display name
  place_id?: string;
  address?: string;
  step_index?: number; // when returned in bulk context
  photo_order?: number; // order within a step (0 primary, 1 secondary)
}

interface BusinessInfo {
  business_id: string;
  name: string;
  photos: BusinessPhoto[];
  description: string;
  hours: string;
  avg_price: string;
  ai_description: string;
  rating: number;
  review_count: number;
  categories: string[];
  address: string;
  place_id: string;
}

class BusinessPhotosService {
  private readonly GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
  private readonly PLACES_BASE_URL = 'https://places.googleapis.com/v1';
  
  /**
   * Search for places using Google Places API Text Search
   */
  async searchPlaces(query: string, location?: string): Promise<PlaceSearchResult[]> {
    if (!this.GOOGLE_PLACES_API_KEY) {
      console.warn('Google Places API key not found, using mock data');
      return this.getMockPlaceSearchResults();
    }

    try {
      const searchQuery = location ? `${query} in ${location}` : query;
      
    const response = await fetch(`${this.PLACES_BASE_URL}/places:searchText`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.GOOGLE_PLACES_API_KEY,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.priceLevel,places.photos,places.types'
        },
        body: JSON.stringify({
          textQuery: searchQuery,
          maxResultCount: 10
        })
      });

      if (!response.ok) {
        throw new Error(`Google Places API error: ${response.status}`);
      }

      const data = await response.json();
      
      return data.places?.map((place: any) => ({
        place_id: place.id,
        name: place.displayName?.text || 'Unknown Place',
        vicinity: place.formattedAddress || '',
        rating: place.rating || 0,
        price_level: place.priceLevel || 0,
        types: place.types || [],
        photos: place.photos?.slice(0, 2).map((photo: any) => ({
          name: photo.name,
          widthPx: photo.widthPx,
          heightPx: photo.heightPx
        })) || []
      })) || [];

    } catch (error) {
      console.error('Error searching places:', error);
      return this.getMockPlaceSearchResults();
    }
  }

  /**
   * Get place photos using Google Places API Photo service
   */
  async getPlacePhotos(photoName: string, maxWidth: number = 800, maxHeight: number = 600): Promise<string> {
    if (!this.GOOGLE_PLACES_API_KEY || !photoName) {
      return this.getMockPhoto();
    }

    try {
      const photoUrl = `${this.PLACES_BASE_URL}/${photoName}/media?key=${this.GOOGLE_PLACES_API_KEY}&maxWidthPx=${maxWidth}&maxHeightPx=${maxHeight}`;
      return photoUrl;
    } catch (error) {
      console.error('Error getting place photo:', error);
      return this.getMockPhoto();
    }
  }

  /**
   * Get detailed business information for a place
   */
  async getBusinessInfo(placeName: string, location?: string): Promise<BusinessInfo | null> {
    try {
      // First search for the place
      const places = await this.searchPlaces(placeName, location);
      if (places.length === 0) {
        return null;
      }
      // Pick the best match using simple scoring against name, address, and types
      const place = this.pickBestPlaceMatch(placeName, location, places);
      
      // Get photos for the place
      const photos: BusinessPhoto[] = [];
      if (place.photos && place.photos.length > 0) {
        for (const photo of place.photos.slice(0, 2)) {
          const photoUrl = await this.getPlacePhotos(photo.name);
          photos.push({
            url: photoUrl,
            width: photo.widthPx,
            height: photo.heightPx,
            source: 'google',
            photo_reference: photo.name,
            label: place.name,
            place_id: place.place_id,
            address: place.vicinity
          });
        }
      }

      // If no photos from Google, add a mock photo
      if (photos.length === 0) {
        photos.push({
          url: this.getMockPhoto(),
          width: 800,
          height: 600,
          source: 'ai_generated'
        });
      }

      return {
        business_id: place.place_id,
        name: place.name,
        photos: photos,
        description: `Experience ${place.name} - a highly-rated destination in the area.`,
        hours: 'Hours vary',
        avg_price: this.getPriceLevelText(place.price_level || 2),
        ai_description: `${place.name} offers a unique experience that's perfect for your adventure. Located at ${place.vicinity}, this spot has earned a ${place.rating} star rating from visitors.`,
        rating: place.rating,
        review_count: Math.floor(Math.random() * 500) + 50,
        categories: ['Experience', 'Local Attraction'],
        address: place.vicinity,
        place_id: place.place_id
      };

    } catch (error) {
      console.error('Error getting business info:', error);
      return null;
    }
  }

  /**
   * Get multiple business photos for adventure steps - one photo per step
   */
  async getAdventurePhotos(steps: Array<{name: string, location?: string}>): Promise<BusinessPhoto[]> {
    const photos: BusinessPhoto[] = [];
    const seenUrls = new Set<string>(); // Track unique URLs
    
    for (const step of steps) { // Process ALL steps, not just first 5
      try {
        const businessInfo = await this.getBusinessInfo(step.name, step.location);
        if (businessInfo && businessInfo.photos.length > 0) {
          // Try to find a unique photo from this business
          let photoAdded = false;
          for (const photo of businessInfo.photos) {
            if (!seenUrls.has(photo.url)) {
              photos.push(photo);
              seenUrls.add(photo.url);
              photoAdded = true;
              break;
            }
          }
          
          // If no unique photo found, still add the first one but with a unique identifier
          if (!photoAdded) {
            const photo = businessInfo.photos[0];
            const uniqueUrl = `${photo.url}?step=${photos.length}`;
            photos.push({
              ...photo,
              url: uniqueUrl
            });
            seenUrls.add(uniqueUrl);
          }
        } else {
          // No business photos found, add mock photo for this step
          const mockUrl = this.getMockPhoto();
          photos.push({
            url: mockUrl,
            width: 800,
            height: 600,
            source: 'ai_generated',
            label: step.name
          });
          seenUrls.add(mockUrl);
        }
      } catch (error) {
        console.error(`Error getting photos for ${step.name}:`, error);
        // Always add a fallback photo for each step
        const mockUrl = this.getMockPhoto();
        photos.push({
          url: mockUrl,
          width: 800,
          height: 600,
          source: 'ai_generated',
          label: step.name
        });
        seenUrls.add(mockUrl);
      }
    }

    // Ensure we have at least one photo
    if (photos.length === 0) {
      const fallbackUrl = this.getMockPhoto();
      photos.push({
        url: fallbackUrl,
        width: 800,
        height: 600,
        source: 'ai_generated'
      });
    }

    return photos;
  }

  /** New multi-photo (up to perStep per step) retrieval while preserving step index metadata */
  async getAdventurePhotosMulti(steps: Array<{ name: string; location?: string }>, perStep: number = 2): Promise<BusinessPhoto[]> {
    const out: BusinessPhoto[] = [];
    const per = Math.max(1, Math.min(perStep, 4)); // safety cap
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      try {
        const info = await this.getBusinessInfo(step.name, step.location);
        if (info && info.photos.length) {
          let count = 0;
            for (const p of info.photos) {
              if (count >= per) break;
              out.push({ ...p, step_index: i, photo_order: count });
              count++;
            }
          // If not enough photos, add mock to reach at least 1
          if (count === 0) {
            out.push({
              url: this.getMockPhoto(),
              width: 800,
              height: 600,
              source: 'ai_generated',
              label: step.name,
              step_index: i,
              photo_order: 0
            });
          }
        } else {
          out.push({
            url: this.getMockPhoto(),
            width: 800,
            height: 600,
            source: 'ai_generated',
            label: step.name,
            step_index: i,
            photo_order: 0
          });
        }
      } catch (e) {
        console.error('Multi photo step error:', e);
        out.push({
          url: this.getMockPhoto(),
          width: 800,
          height: 600,
          source: 'ai_generated',
          label: step.name,
          step_index: i,
          photo_order: 0
        });
      }
    }
    return out;
  }

  /** Pick the best match using simple heuristics to reduce mismatches (e.g., chain names in wrong city) */
  private pickBestPlaceMatch(queryName: string, location: string | undefined, places: PlaceSearchResult[]): PlaceSearchResult {
    const q = (queryName || '').toLowerCase();
    const loc = (location || '').toLowerCase();

    const keywordHints: Array<{kw: string; types: string[]}> = [
      { kw: 'dessert', types: ['bakery', 'dessert', 'ice_cream_shop', 'cafe', 'restaurant'] },
      { kw: 'ice cream', types: ['ice_cream_shop', 'dessert', 'bakery'] },
      { kw: 'coffee', types: ['cafe', 'coffee_shop', 'restaurant'] },
      { kw: 'steak', types: ['restaurant', 'steak_house'] },
      { kw: 'museum', types: ['museum', 'tourist_attraction'] },
      { kw: 'park', types: ['park', 'tourist_attraction'] },
    ];

    const hinted = keywordHints.find(h => q.includes(h.kw));

    const score = (p: PlaceSearchResult) => {
      const name = (p.name || '').toLowerCase();
      const addr = (p.vicinity || '').toLowerCase();
      const types = (p.types || []).map(t => (t || '').toLowerCase());

      let s = 0;
      if (name === q) s += 6;
      if (name.includes(q)) s += 4;
      if (addr && loc && addr.includes(loc)) s += 3;
      if (hinted) {
        if (types.some(t => hinted.types.includes(t))) s += 3;
        if (name.includes(hinted.kw)) s += 1;
      }
      // Prefer places with photos
      if (p.photos && p.photos.length > 0) s += 1;
      // Prefer higher ratings slightly
      s += Math.min(2, Math.floor((p.rating || 0) / 2.5));
      return s;
    };

    return places.slice().sort((a, b) => score(b) - score(a))[0];
  }

  private getPriceLevelText(priceLevel: number): string {
    switch (priceLevel) {
      case 0: return 'Free';
      case 1: return '$';
      case 2: return '$$';
      case 3: return '$$$';
      case 4: return '$$$$';
      default: return '$$';
    }
  }

  private getMockPhoto(): string {
    const mockPhotos = [
      'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571019613914-85e41d6060f5?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1590073844006-33379778ae09?w=800&h=600&fit=crop'
    ];
    return mockPhotos[Math.floor(Math.random() * mockPhotos.length)];
  }

  private getMockPlaceSearchResults(): PlaceSearchResult[] {
    return [
      {
        place_id: 'mock_place_1',
        name: 'Local Favorite Cafe',
        vicinity: '123 Main St, Downtown',
        rating: 4.5,
        price_level: 2,
        photos: [
          {
            name: 'mock_photo_1',
            widthPx: 800,
            heightPx: 600
          }
        ]
      }
    ];
  }
}

const businessPhotosService = new BusinessPhotosService();
export default businessPhotosService;
