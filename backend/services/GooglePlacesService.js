const axios = require('axios');
const { rateLimiters } = require('../utils/rateLimiter');

class GooglePlacesService {
  constructor() {
    // Prefer a dedicated Places key, but accept a generic GOOGLE_API_KEY as fallback
    this.apiKey = process.env.GOOGLE_PLACES_API_KEY
      || process.env.GOOGLE_API_KEY
      || process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    this.baseUrl = 'https://places.googleapis.com/v1';
    this.rateLimiter = rateLimiters.googlePlaces;

    if (!this.apiKey) {
      console.log('⚠️ Google Places API key not configured');
    } else {
      console.log('✅ Google Places API v1 initialized with rate limiting');
    }
  }

  // Small helpers
  async delay(ms) { return new Promise(r => setTimeout(r, ms)); }

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
   * Now with rate limiting
   */
  async textSearch({ textQuery, biasCenter, biasRadiusMeters, pageSize = 1 }) {
    if (!this.apiKey) return [];

    // Wrap in rate limiter
    return this.rateLimiter.execute(async () => {
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
        'places.priceLevel',
        'places.businessStatus',
        'places.currentOpeningHours',
        'places.regularOpeningHours'
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

        const places = response.data?.places || [];

        // CRITICAL: Filter out permanently closed or non-operational businesses
        const operationalPlaces = places.filter(place => {
          const status = place.businessStatus;

          // Only include OPERATIONAL businesses
          if (status && status !== 'OPERATIONAL') {
            console.log(`🚫 Filtered out ${place.displayName?.text || place.name}: Status = ${status}`);
            return false;
          }

          return true;
        });

        if (operationalPlaces.length < places.length) {
          console.log(`⚠️ Filtered out ${places.length - operationalPlaces.length} closed/non-operational businesses`);
        }

        return operationalPlaces;
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
    });
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
   * Filter places by location relevance to avoid wrong city matches
   */
  filterByLocationRelevance(places, targetLocation) {
    if (!targetLocation || places.length <= 1) return places;

    // Extract key location terms from target
    const locationTerms = targetLocation.toLowerCase()
      .split(/[,\s]+/)
      .filter(term => term.length > 2);

    return places.filter(place => {
      const address = (place.formattedAddress || '').toLowerCase();
      
      // Check if the place address contains location terms
      const relevanceScore = locationTerms.reduce((score, term) => {
        return address.includes(term) ? score + 1 : score;
      }, 0);

      const isRelevant = relevanceScore > 0;
      
      if (!isRelevant) {
        console.log(`🚫 Filtered out: ${place.displayName?.text} at ${place.formattedAddress} (wrong location)`);
      }
      
      return isRelevant;
    }).sort((a, b) => {
      // Sort by relevance score (more location matches = higher priority)
      const scoreA = locationTerms.reduce((score, term) => 
        (a.formattedAddress || '').toLowerCase().includes(term) ? score + 1 : score, 0);
      const scoreB = locationTerms.reduce((score, term) => 
        (b.formattedAddress || '').toLowerCase().includes(term) ? score + 1 : score, 0);
      return scoreB - scoreA;
    });
  }

  /**
   * Main function: Find and enrich business with full Google Places data
   * This replaces all the old validation services
   */
  async lookupBusiness(businessName, localityHint, bias) {
    if (!businessName?.trim()) return null;

    // Process and enhance location context
    const enhancedLocation = this.processLocationContext(localityHint);
  const cleanedName = this.cleanBusinessName(businessName);
  const textQuery = `${cleanedName} in ${enhancedLocation}`;

  console.log(`🔍 Looking up: "${textQuery}"`);

    try {
      // Step 1: Text Search with simple retry logic
      const attempt = async () => this.textSearch({
        textQuery,
        biasCenter: bias?.center,
        biasRadiusMeters: bias?.radiusMeters || 16000, // 10 mile radius default
        pageSize: 3 // Get more results to find best match
      });

      let places = await attempt();
      if (!places?.length) {
        await this.delay(200);
        places = await attempt();
      }

      if (!places.length) {
        console.log(`⚠️ No places found for: ${businessName} in ${enhancedLocation}`);
        return null;
      }

      // Filter results by location proximity
      const filteredPlaces = this.filterByLocationRelevance(places, enhancedLocation);
      
      if (!filteredPlaces.length) {
        console.log(`⚠️ No location-relevant places found for: ${businessName} in ${enhancedLocation}`);
        return null;
      }

      const candidate = filteredPlaces[0];
      const placeId = candidate.id;

      console.log(`📍 Found candidate: ${candidate.displayName?.text} at ${candidate.formattedAddress}`);

      // Step 2: Get detailed information
      const details = await this.getPlaceDetailsById(placeId);
      if (!details) {
        console.log(`⚠️ No details found for place: ${placeId}`);
        return null;
      }

      // Step 3: Get first photo URL (v1 or legacy)
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
