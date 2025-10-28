const axios = require('axios');

class GooglePlacesService {
  constructor() {
    // Prefer a dedicated Places key, but accept a generic GOOGLE_API_KEY as fallback
    this.apiKey = process.env.GOOGLE_PLACES_API_KEY
      || process.env.GOOGLE_API_KEY
      || process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    this.baseUrl = 'https://places.googleapis.com/v1';

    // In-memory cache for geocoding results (prevents redundant API calls)
    this.geocodeCache = new Map();
    this.GEOCODE_CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

    if (!this.apiKey) {
      console.log('⚠️ Google Places API key not configured');
    } else {
      console.log('✅ Google Places API v1 initialized');
    }
  }

  // Small helpers
  async delay(ms) { return new Promise(r => setTimeout(r, ms)); }

  /**
   * Geocode a location string to coordinates using Google Geocoding API
   * Includes caching and fallback coordinates for common cities
   */
  async geocodeLocation(locationString) {
    if (!locationString?.trim()) return null;

    const cleanLocation = locationString.trim().toLowerCase();

    // Check cache first
    const cached = this.geocodeCache.get(cleanLocation);
    if (cached && (Date.now() - cached.cachedAt) < this.GEOCODE_CACHE_TTL) {
      console.log(`📍 [Geocode] Cache hit for: ${locationString}`);
      return { lat: cached.lat, lng: cached.lng };
    }

    // Fallback coordinates for top 50 US cities + top 20 international destinations
    const fallbackCoordinates = {
      // US Cities
      'new york, ny': { lat: 40.7128, lng: -74.0060 },
      'new york': { lat: 40.7128, lng: -74.0060 },
      'los angeles, ca': { lat: 34.0522, lng: -118.2437 },
      'los angeles': { lat: 34.0522, lng: -118.2437 },
      'chicago, il': { lat: 41.8781, lng: -87.6298 },
      'chicago': { lat: 41.8781, lng: -87.6298 },
      'houston, tx': { lat: 29.7604, lng: -95.3698 },
      'houston': { lat: 29.7604, lng: -95.3698 },
      'phoenix, az': { lat: 33.4484, lng: -112.0740 },
      'phoenix': { lat: 33.4484, lng: -112.0740 },
      'philadelphia, pa': { lat: 39.9526, lng: -75.1652 },
      'philadelphia': { lat: 39.9526, lng: -75.1652 },
      'san antonio, tx': { lat: 29.4241, lng: -98.4936 },
      'san antonio': { lat: 29.4241, lng: -98.4936 },
      'san diego, ca': { lat: 32.7157, lng: -117.1611 },
      'san diego': { lat: 32.7157, lng: -117.1611 },
      'dallas, tx': { lat: 32.7767, lng: -96.7970 },
      'dallas': { lat: 32.7767, lng: -96.7970 },
      'san jose, ca': { lat: 37.3382, lng: -121.8863 },
      'san jose': { lat: 37.3382, lng: -121.8863 },
      'austin, tx': { lat: 30.2672, lng: -97.7431 },
      'austin': { lat: 30.2672, lng: -97.7431 },
      'fort worth, tx': { lat: 32.7555, lng: -97.3308 },
      'fort worth': { lat: 32.7555, lng: -97.3308 },
      'columbus, oh': { lat: 39.9612, lng: -82.9988 },
      'columbus': { lat: 39.9612, lng: -82.9988 },
      'charlotte, nc': { lat: 35.2271, lng: -80.8431 },
      'charlotte': { lat: 35.2271, lng: -80.8431 },
      'san francisco, ca': { lat: 37.7749, lng: -122.4194 },
      'san francisco': { lat: 37.7749, lng: -122.4194 },
      'seattle, wa': { lat: 47.6062, lng: -122.3321 },
      'seattle': { lat: 47.6062, lng: -122.3321 },
      'denver, co': { lat: 39.7392, lng: -104.9903 },
      'denver': { lat: 39.7392, lng: -104.9903 },
      'washington, dc': { lat: 38.9072, lng: -77.0369 },
      'washington': { lat: 38.9072, lng: -77.0369 },
      'boston, ma': { lat: 42.3601, lng: -71.0589 },
      'boston': { lat: 42.3601, lng: -71.0589 },
      'nashville, tn': { lat: 36.1627, lng: -86.7816 },
      'nashville': { lat: 36.1627, lng: -86.7816 },
      'detroit, mi': { lat: 42.3314, lng: -83.0458 },
      'detroit': { lat: 42.3314, lng: -83.0458 },
      'portland, or': { lat: 45.5155, lng: -122.6789 },
      'portland': { lat: 45.5155, lng: -122.6789 },
      'las vegas, nv': { lat: 36.1699, lng: -115.1398 },
      'las vegas': { lat: 36.1699, lng: -115.1398 },
      'miami, fl': { lat: 25.7617, lng: -80.1918 },
      'miami': { lat: 25.7617, lng: -80.1918 },
      'fort lauderdale, fl': { lat: 26.1224, lng: -80.1373 },
      'fort lauderdale': { lat: 26.1224, lng: -80.1373 },
      'atlanta, ga': { lat: 33.7490, lng: -84.3880 },
      'atlanta': { lat: 33.7490, lng: -84.3880 },

      // International Cities
      'london, uk': { lat: 51.5074, lng: -0.1278 },
      'london': { lat: 51.5074, lng: -0.1278 },
      'paris, france': { lat: 48.8566, lng: 2.3522 },
      'paris': { lat: 48.8566, lng: 2.3522 },
      'tokyo, japan': { lat: 35.6762, lng: 139.6503 },
      'tokyo': { lat: 35.6762, lng: 139.6503 },
      'sydney, australia': { lat: -33.8688, lng: 151.2093 },
      'sydney': { lat: -33.8688, lng: 151.2093 },
      'toronto, canada': { lat: 43.6532, lng: -79.3832 },
      'toronto': { lat: 43.6532, lng: -79.3832 },
      'dubai, uae': { lat: 25.2048, lng: 55.2708 },
      'dubai': { lat: 25.2048, lng: 55.2708 },
      'singapore': { lat: 1.3521, lng: 103.8198 },
      'hong kong': { lat: 22.3193, lng: 114.1694 },
      'barcelona, spain': { lat: 41.3851, lng: 2.1734 },
      'barcelona': { lat: 41.3851, lng: 2.1734 },
      'rome, italy': { lat: 41.9028, lng: 12.4964 },
      'rome': { lat: 41.9028, lng: 12.4964 },
      'amsterdam, netherlands': { lat: 52.3676, lng: 4.9041 },
      'amsterdam': { lat: 52.3676, lng: 4.9041 },
      'berlin, germany': { lat: 52.5200, lng: 13.4050 },
      'berlin': { lat: 52.5200, lng: 13.4050 },
      'bangkok, thailand': { lat: 13.7563, lng: 100.5018 },
      'bangkok': { lat: 13.7563, lng: 100.5018 },
      'mexico city, mexico': { lat: 19.4326, lng: -99.1332 },
      'mexico city': { lat: 19.4326, lng: -99.1332 },
      'nassau, bahamas': { lat: 25.0443, lng: -77.3504 },
      'nassau': { lat: 25.0443, lng: -77.3504 },
      'bahamas': { lat: 25.0343, lng: -77.3963 },
      'cancun, mexico': { lat: 21.1619, lng: -86.8515 },
      'cancun': { lat: 21.1619, lng: -86.8515 },
      'vancouver, canada': { lat: 49.2827, lng: -123.1207 },
      'vancouver': { lat: 49.2827, lng: -123.1207 },
      'montreal, canada': { lat: 45.5017, lng: -73.5673 },
      'montreal': { lat: 45.5017, lng: -73.5673 },
    };

    // Check fallback coordinates
    if (fallbackCoordinates[cleanLocation]) {
      console.log(`📍 [Geocode] Using fallback coordinates for: ${locationString}`);
      const coords = fallbackCoordinates[cleanLocation];
      // Cache the fallback
      this.geocodeCache.set(cleanLocation, {
        lat: coords.lat,
        lng: coords.lng,
        cachedAt: Date.now()
      });
      return coords;
    }

    // Call Google Geocoding API
    try {
      console.log(`📍 [Geocode] Calling Geocoding API for: ${locationString}`);
      const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: {
          address: locationString,
          key: this.apiKey
        },
        timeout: 8000
      });

      if (response.data?.status === 'OK' && response.data.results?.length > 0) {
        const location = response.data.results[0].geometry.location;
        const coords = { lat: location.lat, lng: location.lng };

        // Cache the result
        this.geocodeCache.set(cleanLocation, {
          ...coords,
          cachedAt: Date.now()
        });

        console.log(`📍 [Geocode] ✅ Found: ${locationString} → ${coords.lat}, ${coords.lng}`);
        return coords;
      }

      console.warn(`📍 [Geocode] ⚠️ No results for: ${locationString}`);
      return null;

    } catch (error) {
      console.error(`📍 [Geocode] ❌ Error for ${locationString}:`, error.message);
      return null;
    }
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   * Returns distance in miles
   */
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 3959; // Earth radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  /**
   * Validate that a place is within the specified distance from target coordinates
   */
  validateDistance(place, targetCoords, maxRadiusMiles) {
    if (!place?.location || !targetCoords || !maxRadiusMiles) {
      return true; // If we can't validate, allow it through
    }

    const placeLat = place.location.latitude;
    const placeLng = place.location.longitude;
    const targetLat = targetCoords.lat;
    const targetLng = targetCoords.lng;

    const distance = this.calculateDistance(targetLat, targetLng, placeLat, placeLng);

    console.log(`📏 [Distance] ${place.displayName?.text || place.name}: ${distance.toFixed(1)} miles from target`);

    if (distance > maxRadiusMiles) {
      console.log(`🚫 [Distance] Rejected: ${place.displayName?.text} (${distance.toFixed(1)} miles > ${maxRadiusMiles} miles limit)`);
      return false;
    }

    return true;
  }

  cleanBusinessName(raw) {
    if (!raw) return '';
    let name = String(raw).trim();
    // Strip common AI prefixes like "Lunch at", "Explore", "Indulge in", etc.
    name = name.replace(/^(breakfast|brunch|lunch|dinner|coffee|drinks)\s+(at|in)\s+/i, '');
    name = name.replace(/^(explore|visit|discover|experience|check out|indulge(?:\s+in)?)\s+/i, '');
    // If still contains " at ", drop the leading phrase
    name = name.replace(/^.*?\s+at\s+/i, '');
    return name.trim();
  }

  /**
   * Text Search using Google Places API v1 (New)
   * Finds places by business name with optional location bias
   */
  async textSearch({ textQuery, biasCenter, biasRadiusMeters, pageSize = 1 }) {
    if (!this.apiKey) return [];

    const body = { textQuery, pageSize };

    // Add location bias if provided
    if (biasCenter && biasRadiusMeters) {
      body.locationBias = {
        circle: { 
          center: biasCenter, 
          radius: biasRadiusMeters 
        }
      };
    }

    const fieldMask = [
      'places.id',
      'places.name',
      'places.displayName',
      'places.formattedAddress',
      'places.location',
      'places.types',
      'places.photos',
      'places.rating',
      'places.userRatingCount',
      'places.priceLevel'
    ].join(',');

    try {
      const response = await axios.post(
        `${this.baseUrl}/places:searchText`,
        body,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': this.apiKey,
            'X-Goog-FieldMask': fieldMask
          },
          timeout: 8000
        }
      );

      return response.data?.places || [];
    } catch (error) {
  const status = error.response?.status;
  const details = error.response?.data || error.message;
  console.error('❌ Text search error:', status, details);
      // Fallback: legacy Text Search API if v1 is restricted (403)
      if (status === 403) {
        const legacy = await this.legacyTextSearch(textQuery, pageSize);
        if (legacy.length) return legacy;
      }
      return [];
    }
  }

  // Legacy Text Search fallback (Places API - Text Search)
  async legacyTextSearch(query, pageSize = 1) {
    try {
      const url = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
      const { data } = await axios.get(url, {
        params: {
          query,
          key: this.apiKey
        },
        timeout: 8000
      });
      if (data.status !== 'OK' || !data.results?.length) return [];

      // Map legacy results to approximate v1 shape used by our code
      return data.results.slice(0, pageSize).map(r => ({
        id: r.place_id,
        name: r.name,
        displayName: { text: r.name },
        formattedAddress: r.formatted_address,
        location: r.geometry?.location ? { latitude: r.geometry.location.lat, longitude: r.geometry.location.lng } : undefined,
        types: r.types || [],
        rating: r.rating,
        userRatingCount: r.user_ratings_total,
        photos: (r.photos || []).map(p => ({ photo_reference: p.photo_reference, widthPx: p.width, heightPx: p.height }))
      }));
    } catch (e) {
      console.error('❌ Legacy text search error:', e.message);
      return [];
    }
  }

  /**
   * Get detailed place information by ID
   */
  async getPlaceDetailsById(placeId) {
    if (!this.apiKey || !placeId) return null;

    const fieldMask = [
      'id',
      'displayName',
      'formattedAddress',
      'shortFormattedAddress',
      'location',
      'types',
      'rating',
      'userRatingCount',
      'priceLevel',
      'nationalPhoneNumber',
      'internationalPhoneNumber',
      'websiteUri',
      'googleMapsUri',
      'currentOpeningHours',
      'regularOpeningHours',
      'photos'
    ].join(',');

    try {
      const response = await axios.get(
        `${this.baseUrl}/places/${placeId}`,
        {
          headers: {
            'X-Goog-Api-Key': this.apiKey,
            'X-Goog-FieldMask': fieldMask
          },
          timeout: 8000
        }
      );

      return response.data;
    } catch (error) {
  const status = error.response?.status;
  const details = error.response?.data || error.message;
  console.error(`❌ Place details error for ${placeId}:`, status, details);
      if (status === 403) {
        // Fallback to legacy details
        const legacy = await this.legacyPlaceDetails(placeId);
        if (legacy) return legacy;
      }
      return null;
    }
  }

  // Legacy Place Details fallback
  async legacyPlaceDetails(placeId) {
    try {
      const url = 'https://maps.googleapis.com/maps/api/place/details/json';
      const { data } = await axios.get(url, {
        params: {
          place_id: placeId,
          key: this.apiKey,
          fields: 'place_id,name,formatted_address,geometry,types,rating,user_ratings_total,international_phone_number,website,opening_hours,photos,url'
        },
        timeout: 8000
      });
      if (data.status !== 'OK' || !data.result) return null;
      const r = data.result;
      return {
        id: r.place_id,
        displayName: { text: r.name },
        formattedAddress: r.formatted_address,
        shortFormattedAddress: r.formatted_address,
        location: r.geometry?.location ? { latitude: r.geometry.location.lat, longitude: r.geometry.location.lng } : undefined,
        types: r.types || [],
        rating: r.rating,
        userRatingCount: r.user_ratings_total,
        priceLevel: r.price_level,
        nationalPhoneNumber: r.international_phone_number,
        internationalPhoneNumber: r.international_phone_number,
        websiteUri: r.website,
        googleMapsUri: r.url,
        currentOpeningHours: r.opening_hours,
        regularOpeningHours: r.opening_hours,
        photos: (r.photos || []).map(p => ({ photo_reference: p.photo_reference, widthPx: p.width, heightPx: p.height }))
      };
    } catch (e) {
      console.error('❌ Legacy details error:', e.message);
      return null;
    }
  }

  /**
   * Get direct photo URL from photo name
   * Uses skipHttpRedirect=true to get stable photoUri
   */
  async getPhotoUri(photoName, maxWidth = 800) {
    if (!this.apiKey || !photoName) return null;

    try {
      // If "photoName" is a legacy photo_reference, use legacy photo endpoint
      if (photoName.startsWith('A') || photoName.startsWith('Cm')) {
        return await this.getLegacyPhotoUrl(photoName, maxWidth);
      }

      const response = await axios.get(
        `${this.baseUrl}/${photoName}/media`,
        {
          params: {
            maxWidthPx: maxWidth,
            key: this.apiKey,
            skipHttpRedirect: true
          },
          timeout: 8000
        }
      );

      // skipHttpRedirect=true returns JSON with photoUri
      return response.data?.photoUri || null;
    } catch (error) {
  const status = error.response?.status;
  const details = error.response?.data || error.message;
  console.error(`❌ Photo URI error for ${photoName}:`, status, details);
      if (status === 403) {
        // Try legacy photo endpoint as fallback
        return await this.getLegacyPhotoUrl(photoName, maxWidth);
      }
      return null;
    }
  }

  // Legacy Photo URL (extract redirect Location)
  async getLegacyPhotoUrl(photoReference, maxWidth = 800) {
    try {
      const url = 'https://maps.googleapis.com/maps/api/place/photo';
      const response = await axios.get(url, {
        params: {
          maxwidth: maxWidth,
          photoreference: photoReference,
          key: this.apiKey
        },
        maxRedirects: 0, // capture redirect
        validateStatus: (status) => status >= 200 && status < 400,
        timeout: 8000
      });
      // If redirect, the CDN URL is in the Location header
      if (response.status === 302 || response.status === 301) {
        return response.headers['location'] || null;
      }
      // Some providers may return direct image when optimization disabled
      return response.request?.res?.responseUrl || null;
    } catch (e) {
      // If we tried with a v1 style name, there's no legacy ref, skip
      return null;
    }
  }

  /**
   * Enhanced location processing to ensure accurate geographic targeting
   */
  processLocationContext(locationHint) {
    if (!locationHint || locationHint === "current location") {
      return "United States"; // Default fallback
    }

    // Clean and standardize location
    let cleanLocation = locationHint.trim();
    
    // Add state/country if missing for US cities
    const commonUSCities = {
      'fort lauderdale': 'Fort Lauderdale, FL, USA',
      'miami': 'Miami, FL, USA',
      'san francisco': 'San Francisco, CA, USA',
      'los angeles': 'Los Angeles, CA, USA',
      'new york': 'New York, NY, USA',
      'chicago': 'Chicago, IL, USA',
      'boston': 'Boston, MA, USA',
      'seattle': 'Seattle, WA, USA',
      'portland': 'Portland, OR, USA',
      'austin': 'Austin, TX, USA',
      'denver': 'Denver, CO, USA'
    };

    const lowerLocation = cleanLocation.toLowerCase();
    if (commonUSCities[lowerLocation]) {
      cleanLocation = commonUSCities[lowerLocation];
    } else if (!cleanLocation.includes(',')) {
      // If no comma, assume it needs state/country
      cleanLocation = `${cleanLocation}, USA`;
    }

    console.log(`📍 Location context: "${locationHint}" → "${cleanLocation}"`);
    return cleanLocation;
  }

  /**
   * Enhanced filter: places by location relevance with scoring system
   * Score based on country, state/province, and city matches
   */
  filterByLocationRelevance(places, targetLocation, targetCoords = null, maxRadiusMiles = null) {
    if (!targetLocation || places.length === 0) return places;

    console.log(`🎯 [Filter] Filtering ${places.length} places for relevance to: ${targetLocation}`);

    // Extract country from target location
    const locationParts = targetLocation.split(',').map(p => p.trim().toLowerCase());
    const targetCountry = this.extractCountry(targetLocation);
    const targetState = locationParts.length > 1 ? locationParts[1] : null;
    const targetCity = locationParts[0].toLowerCase();

    console.log(`🎯 [Filter] Target - City: ${targetCity}, State: ${targetState}, Country: ${targetCountry}`);

    // Score each place
    const scoredPlaces = places.map(place => {
      const address = (place.formattedAddress || '').toLowerCase();
      let score = 0;
      let reasons = [];

      // Country match (40 points)
      if (targetCountry && address.includes(targetCountry.toLowerCase())) {
        score += 40;
        reasons.push(`country:${targetCountry}`);
      }

      // State/Province match (30 points)
      if (targetState && address.includes(targetState.toLowerCase())) {
        score += 30;
        reasons.push(`state:${targetState}`);
      }

      // City mentioned in address (30 points)
      if (address.includes(targetCity)) {
        score += 30;
        reasons.push(`city:${targetCity}`);
      }

      // Distance validation (bonus points for proximity)
      if (targetCoords && maxRadiusMiles && place.location) {
        const distance = this.calculateDistance(
          targetCoords.lat,
          targetCoords.lng,
          place.location.latitude,
          place.location.longitude
        );

        if (distance <= maxRadiusMiles) {
          // Bonus points based on proximity
          const proximityBonus = Math.max(0, 20 - (distance / maxRadiusMiles) * 20);
          score += proximityBonus;
          reasons.push(`distance:${distance.toFixed(1)}mi`);
        } else {
          // Penalize places outside radius
          score = Math.max(0, score - 50);
          reasons.push(`TOO_FAR:${distance.toFixed(1)}mi`);
        }
      }

      const placeName = place.displayName?.text || place.name || 'Unknown';
      console.log(`🎯 [Filter] ${placeName}: score=${score}, reasons=[${reasons.join(', ')}]`);

      return {
        place,
        score,
        reasons: reasons.join(', ')
      };
    });

    // Filter places with score >= 70 (or >= 40 for international to be more lenient)
    const minScore = targetCountry && targetCountry !== 'usa' && targetCountry !== 'united states' ? 40 : 70;
    const filteredPlaces = scoredPlaces.filter(scored => {
      if (scored.score < minScore) {
        console.log(`🚫 [Filter] Rejected: ${scored.place.displayName?.text} (score ${scored.score} < ${minScore})`);
        return false;
      }
      return true;
    });

    // Sort by score descending
    filteredPlaces.sort((a, b) => b.score - a.score);

    console.log(`🎯 [Filter] ✅ Kept ${filteredPlaces.length}/${places.length} places`);

    return filteredPlaces.map(scored => scored.place);
  }

  /**
   * Extract country from location string
   */
  extractCountry(locationString) {
    const lower = locationString.toLowerCase();

    // Common country patterns
    const countryPatterns = {
      'usa': ['usa', 'united states', 'us', ', fl', ', ca', ', ny', ', tx'],
      'uk': ['uk', 'united kingdom', 'england', 'scotland', 'wales'],
      'canada': ['canada', 'ca'],
      'bahamas': ['bahamas'],
      'mexico': ['mexico'],
      'france': ['france'],
      'germany': ['germany'],
      'italy': ['italy'],
      'spain': ['spain'],
      'japan': ['japan'],
      'australia': ['australia'],
      'thailand': ['thailand'],
      'singapore': ['singapore'],
    };

    for (const [country, patterns] of Object.entries(countryPatterns)) {
      for (const pattern of patterns) {
        if (lower.includes(pattern)) {
          return country;
        }
      }
    }

    // Default to USA if no country specified and looks like US format
    if (locationString.match(/,\s*[A-Z]{2}$/)) {
      return 'usa';
    }

    return null;
  }

  /**
   * Main function: Find and enrich business with full Google Places data
   * Now uses geocoding for accurate location targeting
   */
  async lookupBusiness(businessName, localityHint, bias, userRadiusMiles = 10) {
    if (!businessName?.trim()) return null;

    // Process and enhance location context
    const enhancedLocation = this.processLocationContext(localityHint);
    const cleanedName = this.cleanBusinessName(businessName);
    const textQuery = `${cleanedName} in ${enhancedLocation}`;

    console.log(`🔍 [Lookup] Starting: "${textQuery}"`);
    console.log(`🔍 [Lookup] Radius: ${userRadiusMiles} miles`);

    try {
      // Step 1: Geocode the location to get real coordinates
      const targetCoords = await this.geocodeLocation(enhancedLocation);
      if (!targetCoords) {
        console.warn(`📍 [Lookup] Could not geocode location: ${enhancedLocation}`);
        // Continue without coordinates - will rely on text matching only
      } else {
        console.log(`📍 [Lookup] Target coordinates: ${targetCoords.lat}, ${targetCoords.lng}`);
      }

      // Step 2: Determine bias radius based on location type
      let biasRadiusMeters;
      if (targetCoords) {
        // For international cities, cap at 8000m (5 miles)
        const targetCountry = this.extractCountry(enhancedLocation);
        const isInternational = targetCountry && targetCountry !== 'usa' && targetCountry !== 'united states';

        if (isInternational) {
          biasRadiusMeters = Math.min(8000, userRadiusMiles * 1609.34); // Convert miles to meters
          console.log(`🌍 [Lookup] International location detected: ${targetCountry}, using ${biasRadiusMeters}m radius`);
        } else {
          // US cities: use user's radius * 1.5 in meters
          biasRadiusMeters = userRadiusMiles * 1.5 * 1609.34;
          console.log(`🇺🇸 [Lookup] US location, using ${biasRadiusMeters}m radius`);
        }
      } else {
        biasRadiusMeters = 16000; // 10 miles default fallback
      }

      // Step 3: Text Search with geocoded coordinates
      const attempt = async () => this.textSearch({
        textQuery,
        biasCenter: targetCoords ? { latitude: targetCoords.lat, longitude: targetCoords.lng } : bias?.center,
        biasRadiusMeters,
        pageSize: 5 // Get more results for better filtering
      });

      let places = await attempt();
      if (!places?.length) {
        console.log(`🔄 [Lookup] No results, retrying...`);
        await this.delay(200);
        places = await attempt();
      }

      if (!places.length) {
        console.log(`⚠️ [Lookup] No places found for: ${businessName} in ${enhancedLocation}`);
        return null;
      }

      console.log(`🔍 [Lookup] Found ${places.length} candidates before filtering`);

      // Step 4: Filter results by location relevance with scoring
      const filteredPlaces = this.filterByLocationRelevance(
        places,
        enhancedLocation,
        targetCoords,
        userRadiusMiles
      );

      if (!filteredPlaces.length) {
        console.log(`⚠️ [Lookup] No location-relevant places found for: ${businessName} in ${enhancedLocation}`);
        return null;
      }

      const candidate = filteredPlaces[0];
      const placeId = candidate.id;

      console.log(`📍 [Lookup] ✅ Selected: ${candidate.displayName?.text} at ${candidate.formattedAddress}`);

      // Step 5: Get detailed information
      const details = await this.getPlaceDetailsById(placeId);
      if (!details) {
        console.log(`⚠️ No details found for place: ${placeId}`);
        return null;
      }

      // Step 6: Get first photo URL (v1 or legacy)
      let photoUrl = null;
      if (details?.photos?.length > 0) {
        const p0 = details.photos[0];
        const photoName = p0.name || p0.photo_reference; // v1 vs legacy
        if (photoName) {
          photoUrl = await this.getPhotoUri(photoName, 800);
        }
      }

      const enrichedData = {
        placeId,
        name: details?.displayName?.text || candidate?.displayName?.text,
        address: details?.formattedAddress,
        location: details?.location,
        rating: details?.rating,
        userRatingCount: details?.userRatingCount,
        priceLevel: details?.priceLevel,
        phone: details?.nationalPhoneNumber || details?.internationalPhoneNumber,
        website: details?.websiteUri,
        googleMapsUri: details?.googleMapsUri,
        photoUrl,
        types: details?.types || candidate?.types,
        openingHours: details?.regularOpeningHours,
        currentlyOpen: details?.currentOpeningHours?.openNow,
        raw: details
      };

      console.log(`✅ Enriched: ${enrichedData.name} (${enrichedData.rating}⭐)`);
      return enrichedData;

    } catch (error) {
      console.error(`❌ Lookup error for ${businessName}:`, error.message);
      return null;
    }
  }

  /**
   * Enhanced adventure step enrichment
   * Replaces the old PlaceValidationService
   */
  async enrichAdventureStep(step, userLocationLabel) {
    const businessName = step.business_name?.trim();
    if (!businessName) {
      return step;
    }

    const enrichedData = await this.lookupBusiness(
      businessName,
      userLocationLabel
    );

    if (!enrichedData) {
      // Return original step if no Google data found
      return {
        ...step,
        validated: false,
        google_places_error: 'No data found'
      };
    }

    // Merge Google Places data with adventure step
    return {
      ...step,
      // Override with authoritative Google data
      location: enrichedData.address || step.location,
      business_name: enrichedData.name || businessName,
      rating: enrichedData.rating,
      user_ratings_total: enrichedData.userRatingCount,
      price_level: enrichedData.priceLevel,
      business_phone: enrichedData.phone,
      business_website: enrichedData.website,
      business_hours: enrichedData.openingHours?.weekdayText?.join(', '),
      currently_open: enrichedData.currentlyOpen,
      google_maps_url: enrichedData.googleMapsUri,
      // Google Places specific data
      google_places: {
        place_id: enrichedData.placeId,
        name: enrichedData.name,
        address: enrichedData.address,
        rating: enrichedData.rating,
        user_rating_count: enrichedData.userRatingCount,
        price_level: enrichedData.priceLevel,
        types: enrichedData.types,
        photo_url: enrichedData.photoUrl,
        opening_hours: enrichedData.openingHours,
        last_updated: new Date().toISOString()
      },
      validated: true,
      photo_url: enrichedData.photoUrl // Direct photo URL for UI
    };
  }

  /**
   * Process entire adventure with Google Places enrichment
   * This is the main function called from ai_new.js
   */
  async validateAndEnrichSteps(steps, userLocationLabel) {
    console.log(`🚀 Enriching ${steps.length} steps with Google Places data...`);
    
    const enrichedSteps = [];
    
    for (const step of steps) {
      const enrichedStep = await this.enrichAdventureStep(step, userLocationLabel);
      enrichedSteps.push(enrichedStep);
      
      // Small delay to respect API rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const validatedCount = enrichedSteps.filter(s => s.validated).length;
    console.log(`✅ Enhanced ${validatedCount}/${steps.length} steps with Google Places data`);
    
    return enrichedSteps;
  }

  /**
   * Filter adventure by minimum rating
   * Keep steps that either have no rating or meet minimum threshold
   */
  filterByRating(adventure, minRating = 3.0) {
    const filteredSteps = adventure.steps.filter(step => {
      // Keep steps without ratings or with good ratings
      return !step.rating || step.rating >= minRating;
    });

    return {
      ...adventure,
      steps: filteredSteps,
      filtered_stats: {
        original_count: adventure.steps.length,
        filtered_count: filteredSteps.length,
        removed_count: adventure.steps.length - filteredSteps.length,
        min_rating_applied: minRating
      }
    };
  }
}

module.exports = new GooglePlacesService();
