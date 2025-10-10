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
   */
  async searchPlace(businessName: string, location?: string): Promise<GooglePlaceDetails | null> {
    try {
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
   * Get detailed place information by place_id
   */
  async getPlaceDetails(placeId: string): Promise<GooglePlaceDetails | null> {
    try {
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
   * Cache place data in Supabase (disabled due to RLS issues)
   */
  async cachePlaceData(placeDetails: GooglePlaceDetails): Promise<void> {
    // Caching disabled - RLS policy prevents writes from client
    // TODO: Move caching to backend API
    return;
  }

  /**
   * Get cached place data from Supabase
   */
  async getCachedPlaceData(placeId: string): Promise<GooglePlaceDetails | null> {
    try {
      const { data, error } = await supabase
        .from('google_places_cache')
        .select('*')
        .eq('place_id', placeId)
        .gte('last_updated', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // 7 days
        .single();

      if (error || !data) {
        return null;
      }

      return data as GooglePlaceDetails;
    } catch (error) {
      console.error('Error getting cached place data:', error);
      return null;
    }
  }

  /**
   * Get or fetch place data with caching
   */
  async getPlaceDataWithCache(businessName: string, location?: string): Promise<GooglePlaceDetails | null> {
    try {
      // First try to find in cache by name
      const { data: cachedData, error } = await supabase
        .from('google_places_cache')
        .select('*')
        .ilike('name', `%${businessName}%`)
        .gte('last_updated', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .limit(1);

      if (!error && cachedData && cachedData.length > 0) {
        console.log('📋 Using cached place data for:', businessName);
        return cachedData[0] as GooglePlaceDetails;
      }

      // If not in cache, search and cache
      console.log('🔍 Searching Google Places for:', businessName);
      const placeData = await this.searchPlace(businessName, location);
      
      if (placeData) {
        await this.cachePlaceData(placeData);
        return placeData;
      }

      return null;
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
