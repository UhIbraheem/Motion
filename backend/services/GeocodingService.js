const axios = require('axios');

/**
 * Geocoding Service
 * Converts location strings (addresses, city names) to latitude/longitude coordinates
 * Uses Google Geocoding API
 */
class GeocodingService {
  constructor() {
    this.apiKey = process.env.GOOGLE_PLACES_API_KEY
      || process.env.GOOGLE_API_KEY
      || process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

    // Cache geocoding results to reduce API calls
    this.cache = new Map();
    this.cacheMaxSize = 1000;
    this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours

    if (!this.apiKey) {
      console.log('⚠️ Geocoding API key not configured');
    } else {
      console.log('✅ Geocoding Service initialized');
    }
  }

  /**
   * Get cache key for a location string
   */
  getCacheKey(location) {
    return location.toLowerCase().trim();
  }

  /**
   * Check if cached result is still valid
   */
  isCacheValid(cacheEntry) {
    if (!cacheEntry) return false;
    const age = Date.now() - cacheEntry.timestamp;
    return age < this.cacheExpiry;
  }

  /**
   * Add result to cache
   */
  addToCache(location, result) {
    const key = this.getCacheKey(location);

    // Implement simple LRU: if cache is full, remove oldest entry
    if (this.cache.size >= this.cacheMaxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      result,
      timestamp: Date.now()
    });
  }

  /**
   * Get result from cache if valid
   */
  getFromCache(location) {
    const key = this.getCacheKey(location);
    const cached = this.cache.get(key);

    if (this.isCacheValid(cached)) {
      console.log(`📦 Geocoding cache hit: ${location}`);
      return cached.result;
    }

    // Remove expired entry
    if (cached) {
      this.cache.delete(key);
    }

    return null;
  }

  /**
   * Geocode a location string to coordinates
   * @param {string} location - Location string (e.g., "San Francisco, CA" or "1600 Amphitheatre Parkway, Mountain View, CA")
   * @returns {Promise<{latitude: number, longitude: number, formattedAddress: string} | null>}
   */
  async geocode(location) {
    if (!this.apiKey) {
      console.log('⚠️ No API key configured for geocoding');
      return this.getDefaultCoordinates(location);
    }

    if (!location || typeof location !== 'string') {
      console.log('⚠️ Invalid location provided to geocode');
      return this.getDefaultCoordinates();
    }

    // Check cache first
    const cached = this.getFromCache(location);
    if (cached) {
      return cached;
    }

    try {
      console.log(`🌍 Geocoding: "${location}"`);

      const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: {
          address: location,
          key: this.apiKey
        },
        timeout: 5000
      });

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const result = response.data.results[0];
        const coords = {
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
          formattedAddress: result.formatted_address,
          placeId: result.place_id,
          types: result.types
        };

        console.log(`✅ Geocoded: "${location}" → ${coords.latitude}, ${coords.longitude}`);

        // Cache the result
        this.addToCache(location, coords);

        return coords;
      } else {
        console.log(`⚠️ Geocoding returned status: ${response.data.status}`);
        return this.getDefaultCoordinates(location);
      }
    } catch (error) {
      console.error('❌ Geocoding error:', error.message);
      return this.getDefaultCoordinates(location);
    }
  }

  /**
   * Get default coordinates based on common city names
   * Fallback when geocoding fails
   */
  getDefaultCoordinates(location) {
    const locationLower = location ? location.toLowerCase().trim() : '';

    // Major US cities fallback
    const cityCoordinates = {
      'san francisco': { latitude: 37.7749, longitude: -122.4194, formattedAddress: 'San Francisco, CA, USA' },
      'new york': { latitude: 40.7128, longitude: -74.0060, formattedAddress: 'New York, NY, USA' },
      'los angeles': { latitude: 34.0522, longitude: -118.2437, formattedAddress: 'Los Angeles, CA, USA' },
      'chicago': { latitude: 41.8781, longitude: -87.6298, formattedAddress: 'Chicago, IL, USA' },
      'miami': { latitude: 25.7617, longitude: -80.1918, formattedAddress: 'Miami, FL, USA' },
      'fort lauderdale': { latitude: 26.1224, longitude: -80.1373, formattedAddress: 'Fort Lauderdale, FL, USA' },
      'seattle': { latitude: 47.6062, longitude: -122.3321, formattedAddress: 'Seattle, WA, USA' },
      'boston': { latitude: 42.3601, longitude: -71.0589, formattedAddress: 'Boston, MA, USA' },
      'austin': { latitude: 30.2672, longitude: -97.7431, formattedAddress: 'Austin, TX, USA' },
      'denver': { latitude: 39.7392, longitude: -104.9903, formattedAddress: 'Denver, CO, USA' },
      'portland': { latitude: 45.5152, longitude: -122.6784, formattedAddress: 'Portland, OR, USA' },
      'atlanta': { latitude: 33.7490, longitude: -84.3880, formattedAddress: 'Atlanta, GA, USA' },
      'nashville': { latitude: 36.1627, longitude: -86.7816, formattedAddress: 'Nashville, TN, USA' },
      'las vegas': { latitude: 36.1699, longitude: -115.1398, formattedAddress: 'Las Vegas, NV, USA' },
      'phoenix': { latitude: 33.4484, longitude: -112.0740, formattedAddress: 'Phoenix, AZ, USA' }
    };

    // Check for city match
    for (const [city, coords] of Object.entries(cityCoordinates)) {
      if (locationLower.includes(city)) {
        console.log(`📍 Using default coordinates for ${city}`);
        return coords;
      }
    }

    // Ultimate fallback: San Francisco
    console.log(`📍 Using default fallback coordinates (San Francisco)`);
    return cityCoordinates['san francisco'];
  }

  /**
   * Batch geocode multiple locations
   * @param {string[]} locations - Array of location strings
   * @returns {Promise<Array<{location: string, coords: object}>>}
   */
  async batchGeocode(locations) {
    console.log(`🌍 Batch geocoding ${locations.length} locations...`);

    const results = [];

    for (const location of locations) {
      const coords = await this.geocode(location);
      results.push({ location, coords });

      // Small delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return results;
  }

  /**
   * Calculate distance between two coordinates (in miles)
   * Uses Haversine formula
   */
  calculateDistance(coord1, coord2) {
    const R = 3958.8; // Earth's radius in miles

    const lat1 = coord1.latitude * Math.PI / 180;
    const lat2 = coord2.latitude * Math.PI / 180;
    const deltaLat = (coord2.latitude - coord1.latitude) * Math.PI / 180;
    const deltaLon = (coord2.longitude - coord1.longitude) * Math.PI / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Validate if a coordinate is within radius of center point
   */
  isWithinRadius(centerCoords, targetCoords, radiusMiles) {
    const distance = this.calculateDistance(centerCoords, targetCoords);
    return distance <= radiusMiles;
  }

  /**
   * Clear the cache (useful for testing or memory management)
   */
  clearCache() {
    this.cache.clear();
    console.log('🗑️ Geocoding cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.cacheMaxSize,
      expiryMs: this.cacheExpiry
    };
  }
}

module.exports = new GeocodingService();
