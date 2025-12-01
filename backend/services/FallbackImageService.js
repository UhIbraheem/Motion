const axios = require('axios');

/**
 * Fallback Image Service
 * Provides fallback images when Google Places photos are unavailable
 * Uses Unsplash API for high-quality, relevant images
 */
class FallbackImageService {
  constructor() {
    this.unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY;
    this.baseUrl = 'https://api.unsplash.com';

    if (!this.unsplashAccessKey) {
      console.log('⚠️ Unsplash API key not configured - fallback images disabled');
    } else {
      console.log('✅ Fallback Image Service initialized with Unsplash');
    }
  }

  /**
   * Get fallback image URL from Unsplash
   * @param {string} query - Search query (e.g., "restaurant Miami", "coffee shop")
   * @param {string} orientation - Image orientation (landscape, portrait, squarish)
   * @returns {Promise<{url: string, attribution: string} | null>}
   */
  async getFallbackImage(query, orientation = 'landscape') {
    if (!this.unsplashAccessKey) {
      return this.getPlaceholderImage(query);
    }

    try {
      console.log(`🖼️ Fetching fallback image from Unsplash: "${query}"`);

      const response = await axios.get(`${this.baseUrl}/photos/random`, {
        params: {
          query: query,
          orientation: orientation,
          content_filter: 'high', // Family-friendly content only
          w: 800, // Request 800px width
          fit: 'max'
        },
        headers: {
          'Authorization': `Client-ID ${this.unsplashAccessKey}`,
          'Accept-Version': 'v1'
        },
        timeout: 5000
      });

      if (response.data && response.data.urls) {
        const imageUrl = response.data.urls.regular || response.data.urls.full;
        const attribution = {
          photographer: response.data.user.name,
          photographerUrl: response.data.user.links.html,
          unsplashUrl: response.data.links.html,
          downloadLocation: response.data.links.download_location
        };

        console.log(`✅ Fallback image found: ${response.data.user.name}`);

        // Trigger download endpoint (required by Unsplash API guidelines)
        if (attribution.downloadLocation) {
          this.triggerDownload(attribution.downloadLocation).catch(err => {
            console.log('⚠️ Failed to trigger Unsplash download endpoint:', err.message);
          });
        }

        return {
          url: imageUrl,
          attribution: attribution,
          source: 'unsplash'
        };
      }

      return this.getPlaceholderImage(query);
    } catch (error) {
      console.error('❌ Unsplash API error:', error.message);
      return this.getPlaceholderImage(query);
    }
  }

  /**
   * Trigger Unsplash download endpoint (required by API guidelines)
   * @param {string} downloadLocation - Download location URL
   */
  async triggerDownload(downloadLocation) {
    try {
      await axios.get(downloadLocation, {
        headers: {
          'Authorization': `Client-ID ${this.unsplashAccessKey}`
        },
        timeout: 3000
      });
    } catch (error) {
      // Non-blocking error
      console.log('Download trigger failed:', error.message);
    }
  }

  /**
   * Get a placeholder image URL (used when Unsplash is unavailable)
   * Uses Lorem Picsum as a reliable placeholder service
   * @param {string} query - Search query (used for seed)
   * @returns {{url: string, attribution: string, source: string}}
   */
  getPlaceholderImage(query) {
    // Generate a deterministic seed from query for consistent images
    const seed = query.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    return {
      url: `https://picsum.photos/seed/${seed}/800/600`,
      attribution: {
        service: 'Lorem Picsum',
        url: 'https://picsum.photos'
      },
      source: 'placeholder'
    };
  }

  /**
   * Get category-specific fallback image
   * Maps business types to relevant search queries
   * @param {string[]} types - Google Places types array
   * @param {string} location - Location name
   * @returns {Promise<object | null>}
   */
  async getCategoryImage(types, location = '') {
    // Map Google Places types to Unsplash search queries
    const categoryMap = {
      'restaurant': 'restaurant interior dining',
      'cafe': 'coffee shop cafe',
      'bar': 'bar cocktails nightlife',
      'museum': 'museum art gallery',
      'park': 'park nature outdoor',
      'tourist_attraction': 'landmark architecture',
      'shopping_mall': 'shopping mall retail',
      'gym': 'gym fitness',
      'spa': 'spa wellness massage',
      'movie_theater': 'movie theater cinema',
      'night_club': 'nightclub party lights',
      'bakery': 'bakery pastries bread',
      'book_store': 'bookstore library books',
      'art_gallery': 'art gallery paintings',
      'clothing_store': 'fashion boutique clothing'
    };

    // Find first matching category
    let query = 'business establishment';
    for (const type of (types || [])) {
      if (categoryMap[type]) {
        query = categoryMap[type];
        break;
      }
    }

    // Add location for more relevant results
    if (location) {
      query += ` ${location}`;
    }

    return await this.getFallbackImage(query);
  }

  /**
   * Check if we should use fallback image
   * @param {object} googlePlaceData - Google Places data for a business
   * @returns {boolean}
   */
  shouldUseFallback(googlePlaceData) {
    // Use fallback if no photo URL or photo fetch failed
    return !googlePlaceData?.photo_url || googlePlaceData.photo_url === null;
  }
}

module.exports = new FallbackImageService();
