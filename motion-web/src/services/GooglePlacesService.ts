import { supabase } from '@/lib/supabaseClient';

interface GooglePlaceDetails {
  place_id: string;
  name: string;
  formatted_address?: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  types?: string[];
  photo_references?: string[];
  photo_url?: string; // Full photo URL from Google Places API
  opening_hours?: any;
  website?: string;
  formatted_phone_number?: string;
  business_status?: string;
  geometry?: any;
  reviews?: any[];
}

interface CachedPlace {
  place_id: string;
  name: string;
  formatted_address?: string;
  lat?: number;
  lng?: number;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  types?: string[];
  phone_number?: string;
  website?: string;
  google_maps_url?: string;
  opening_hours?: any;
  primary_photo_url?: string;
  photos?: any;
  raw_data?: any;
  last_updated: string;
}

interface GooglePlacePhoto {
  photo_reference: string;
  photo_url?: string;
  width: number;
  height: number;
  attribution?: string;
  is_primary: boolean;
}

class GooglePlacesService {
  private static instance: GooglePlacesService;
  private apiKey: string;
  private cacheTTLDays = 7;

  constructor() {
    this.apiKey = process.env.GOOGLE_PLACES_API_KEY || '';
  }

  static getInstance(): GooglePlacesService {
    if (!GooglePlacesService.instance) {
      GooglePlacesService.instance = new GooglePlacesService();
    }
    return GooglePlacesService.instance;
  }

  /**
   * Check if cached data is still fresh
   */
  private isCacheFresh(lastUpdated: string): boolean {
    if (!lastUpdated) return false;
    const cacheDate = new Date(lastUpdated);
    const now = new Date();
    const diffDays = (now.getTime() - cacheDate.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays < this.cacheTTLDays;
  }

  /**
   * Convert cached data to GooglePlaceDetails format
   */
  private cachedToDetails(cached: CachedPlace): GooglePlaceDetails {
    return {
      place_id: cached.place_id,
      name: cached.name,
      formatted_address: cached.formatted_address,
      rating: cached.rating,
      user_ratings_total: cached.user_ratings_total,
      price_level: cached.price_level,
      types: cached.types,
      photo_references: [],
      photo_url: cached.primary_photo_url,
      opening_hours: cached.opening_hours,
      website: cached.website,
      formatted_phone_number: cached.phone_number,
      business_status: 'OPERATIONAL',
      geometry: cached.lat && cached.lng ? {
        location: { lat: cached.lat, lng: cached.lng }
      } : null,
      reviews: []
    };
  }

  /**
   * Convert Google Places API v1 price level string to integer
   */
  private convertPriceLevel(priceLevel: any): number {
    if (typeof priceLevel === 'number') return priceLevel;
    if (typeof priceLevel !== 'string') return 0;
    
    const priceLevelMap: Record<string, number> = {
      'PRICE_LEVEL_FREE': 0,
      'PRICE_LEVEL_INEXPENSIVE': 1,
      'PRICE_LEVEL_MODERATE': 2,
      'PRICE_LEVEL_EXPENSIVE': 3,
      'PRICE_LEVEL_VERY_EXPENSIVE': 4
    };
    
    return priceLevelMap[priceLevel] ?? 0;
  }

  /**
   * Search for a place by business name and location
   * NOW WITH DATABASE CACHING
   */
  async searchPlace(businessName: string, location?: string): Promise<GooglePlaceDetails | null> {
    try {
      // STEP 1: Check cache first
      const cached = await this.searchCachedPlaces(businessName, location);
      if (cached) {
        console.log('📦 Cache HIT for:', businessName);
        return this.cachedToDetails(cached);
      }
      
      console.log('🔍 Cache MISS, calling API for:', businessName);
      
      // STEP 2: Call API
      const response = await fetch('/api/ai/google-places', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessName,
          location
        })
      });
      
      const data = await response.json();
      
      if (data.success && data.place) {
        return {
          place_id: data.place.place_id,
          name: typeof data.place.name === 'object' ? data.place.name?.text : data.place.name,
          formatted_address: data.place.address,
          rating: data.place.rating,
          user_ratings_total: data.place.user_rating_count,
          price_level: this.convertPriceLevel(data.place.price_level),
          types: data.place.types,
          photo_references: [], // Backend returns full URLs, not references
          photo_url: data.place.photo_url, // Store full photo URL here
          opening_hours: data.place.opening_hours,
          website: data.place.website,
          formatted_phone_number: data.place.phone,
          business_status: 'OPERATIONAL',
          geometry: null,
          reviews: []
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error searching place:', error);
      return null;
    }
  }

  /**
   * Search cache by business name and location
   */
  private async searchCachedPlaces(businessName: string, location?: string): Promise<CachedPlace | null> {
    try {
      let query = supabase
        .from('google_places_cache')
        .select('*')
        .ilike('name', `%${businessName}%`);
      
      // Add location filter if provided
      if (location) {
        query = query.ilike('formatted_address', `%${location}%`);
      }
      
      const { data, error } = await query.limit(3);
      
      if (error || !data || data.length === 0) return null;
      
      // Find freshest matching result
      const fresh = data.find((d: CachedPlace) => this.isCacheFresh(d.last_updated));
      return fresh || null;
    } catch (err) {
      console.error('Cache search error:', err);
      return null;
    }
  }

  /**
   * Get detailed place information by place_id
   * NOW WITH CACHE CHECK FIRST
   */
  async getPlaceDetails(placeId: string): Promise<GooglePlaceDetails | null> {
    try {
      // Check cache first
      const cached = await this.getCachedPlaceData(placeId);
      if (cached) {
        console.log('📦 Cache HIT for place_id:', placeId);
        return cached;
      }
      
      console.log('🔍 Cache MISS for place_id:', placeId);
      
      const fields = [
        'place_id', 'name', 'formatted_address', 'rating', 'user_ratings_total',
        'price_level', 'types', 'photos', 'opening_hours', 'website',
        'formatted_phone_number', 'business_status', 'geometry', 'reviews'
      ].join(',');

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${this.apiKey}`
      );
      
      const data = await response.json();
      
      if (data.result) {
        return this.formatPlaceDetails(data.result);
      }
      
      return null;
    } catch (error) {
      console.error('Error getting place details:', error);
      return null;
    }
  }

  /**
   * Get photo URL from photo reference
   */
  getPhotoUrl(photoReference: string, maxWidth: number = 400): string {
    return `https://maps.googleapis.com/maps/api/place/photo?photo_reference=${photoReference}&maxwidth=${maxWidth}&key=${this.apiKey}`;
  }

  /**
   * Cache place data in Supabase
   * Note: Client-side caching requires proper RLS policies
   * Backend handles caching with service_role key
   */
  async cachePlaceData(placeDetails: GooglePlaceDetails): Promise<void> {
    // Client-side writes are now supported with proper RLS
    // But backend is the primary cache writer using service_role key
    console.log('💾 Cache write delegated to backend for:', placeDetails.name);
    return;
  }

  /**
   * Get cached place data from Supabase by place_id
   */
  async getCachedPlaceData(placeId: string): Promise<GooglePlaceDetails | null> {
    try {
      const { data, error } = await supabase
        .from('google_places_cache')
        .select('*')
        .eq('place_id', placeId)
        .single();

      if (error || !data) {
        return null;
      }

      // Check if cache is fresh (7 days)
      if (!this.isCacheFresh(data.last_updated)) {
        console.log('📦 Cache stale for:', placeId);
        return null;
      }

      return this.cachedToDetails(data as CachedPlace);
    } catch (error) {
      console.error('Error getting cached place data:', error);
      return null;
    }
  }

  /**
   * Get or fetch place data with caching
   * This is the main method that should be used for all place lookups
   */
  async getPlaceDataWithCache(businessName: string, location?: string): Promise<GooglePlaceDetails | null> {
    try {
      // Use the unified searchCachedPlaces method
      const cached = await this.searchCachedPlaces(businessName, location);
      
      if (cached) {
        console.log('📦 Cache HIT for:', businessName);
        return this.cachedToDetails(cached);
      }

      // If not in cache, search via API (backend will cache it)
      console.log('🔍 Cache MISS, searching API for:', businessName);
      const placeData = await this.searchPlace(businessName, location);
      
      return placeData;
    } catch (error) {
      console.error('Error getting place data with cache:', error);
      return null;
    }
  }

  /**
   * Format place details from Google Places API response
   */
  private formatPlaceDetails(place: any): GooglePlaceDetails {
    const photoReferences = place.photos?.map((photo: any) => photo.photo_reference) || [];
    
    return {
      place_id: place.place_id,
      name: place.name,
      formatted_address: place.formatted_address,
      rating: place.rating,
      user_ratings_total: place.user_ratings_total,
      price_level: place.price_level,
      types: place.types,
      photo_references: photoReferences,
      opening_hours: place.opening_hours,
      website: place.website,
      formatted_phone_number: place.formatted_phone_number,
      business_status: place.business_status,
      geometry: place.geometry,
      reviews: place.reviews
    };
  }

  /**
   * Get formatted price level text
   */
  getPriceLevelText(priceLevel?: number): string {
    switch (priceLevel) {
      case 0: return 'Free';
      case 1: return '$';
      case 2: return '$$';
      case 3: return '$$$';
      case 4: return '$$$$';
      default: return 'Price not available';
    }
  }

  /**
   * Get opening hours status
   */
  getOpeningStatus(openingHours?: any): { isOpen: boolean; status: string } {
    if (!openingHours) {
      return { isOpen: false, status: 'Hours not available' };
    }

    if (openingHours.open_now !== undefined) {
      return {
        isOpen: openingHours.open_now,
        status: openingHours.open_now ? 'Open now' : 'Closed now'
      };
    }

    return { isOpen: false, status: 'Hours not available' };
  }
}

export default GooglePlacesService.getInstance();
