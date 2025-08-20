const express = require('express');
const router = express.Router();
const GooglePlacesService = require('../services/GooglePlacesService');

/**
 * Get photos for adventure steps
 */
router.post('/photos', async (req, res) => {
  try {
    const { steps, photosPerStep = 1 } = req.body;

    if (!steps || !Array.isArray(steps)) {
      return res.status(400).json({ error: 'Steps array is required' });
    }

    console.log(`📸 Fetching ${photosPerStep} photo(s) for ${steps.length} steps via Google Places`);

    const results = [];
    for (let stepIndex = 0; stepIndex < steps.length; stepIndex++) {
      const step = steps[stepIndex];
      const name = step?.business_name || step?.name || step?.title;
      const location = step?.location;
      if (!name) continue;

      let enriched = null;
      try {
        enriched = await GooglePlacesService.lookupBusiness(name, location);
      } catch (e) {
        console.error('Lookup error for step', name, e?.message || e);
      }

  if (enriched?.photoUrl) {
        // Primary photo
        results.push({
          url: enriched.photoUrl,
          width: 800,
          height: 600,
          source: 'google',
          label: enriched.name || name,
          step_index: stepIndex,
          photo_order: 0,
          place_id: enriched.placeId,
          address: enriched.address || location
        });

        // If multiple requested, duplicate primary for now (v1); future: fetch more photos
        for (let p = 1; p < photosPerStep; p++) {
          results.push({
            url: enriched.photoUrl,
            width: 800,
            height: 600,
            source: 'google',
            label: enriched.name || name,
            step_index: stepIndex,
            photo_order: p,
            place_id: enriched.placeId,
            address: enriched.address || location
          });
        }
      } else {
        // Do not return random fallback images; honor user's requirement to avoid fallbacks
        console.log(`⚠️ No Google photo for step ${stepIndex + 1}: ${name}. Skipping photo output.`);
      }

      // Gentle pacing to avoid API rate limits
      await new Promise(r => setTimeout(r, 100));
    }

    res.json({ photos: results });
  } catch (error) {
    console.error('❌ Photos API error:', error);
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
});

/**
 * Determine business type from name for better photo selection
 */
function getBusinessType(businessName) {
  const name = businessName.toLowerCase();
  
  // Restaurant types
  if (name.includes('restaurant') || name.includes('bistro') || name.includes('eatery') || 
      name.includes('diner') || name.includes('grill') || name.includes('café') || 
      name.includes('cafe') || name.includes('kitchen') || name.includes('tavern')) {
    return 'restaurant';
  }
  
  // Food & drink
  if (name.includes('bar') || name.includes('pub') || name.includes('brewery') || 
      name.includes('cocktail') || name.includes('wine') || name.includes('coffee')) {
    return 'bar';
  }
  
  if (name.includes('ice cream') || name.includes('gelato') || name.includes('frozen yogurt') || 
      name.includes('dessert') || name.includes('bakery') || name.includes('pastry')) {
    return 'dessert';
  }
  
  // Shopping
  if (name.includes('shop') || name.includes('store') || name.includes('boutique') || 
      name.includes('market') || name.includes('mall') || name.includes('retail')) {
    return 'shopping';
  }
  
  // Entertainment
  if (name.includes('museum') || name.includes('gallery') || name.includes('exhibit')) {
    return 'museum';
  }
  
  if (name.includes('park') || name.includes('garden') || name.includes('nature') || 
      name.includes('trail') || name.includes('walk') || name.includes('beach')) {
    return 'outdoor';
  }
  
  if (name.includes('theater') || name.includes('cinema') || name.includes('movie') || 
      name.includes('show') || name.includes('performance')) {
    return 'entertainment';
  }
  
  // Default
  return 'business';
}

/**
 * Generate consistent photo seed based on business name and type
 */
function generatePhotoSeed(businessName, businessType, photoIndex) {
  // Create a hash-like number from the business name for consistency
  let hash = 0;
  for (let i = 0; i < businessName.length; i++) {
    const char = businessName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Add business type multiplier for different image categories
  const typeMultipliers = {
    'restaurant': 100,
    'bar': 200,
    'dessert': 300,
    'shopping': 400,
    'museum': 500,
    'outdoor': 600,
    'entertainment': 700,
    'business': 800
  };
  
  const typeMultiplier = typeMultipliers[businessType] || 800;
  
  // Ensure positive number and add photo index for variety
  return Math.abs(hash) + typeMultiplier + (photoIndex * 10);
}

/**
 * Get business info for a specific place
 */
router.post('/business-info', async (req, res) => {
  try {
    const { name, location } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Business name is required' });
    }

    console.log(`🏢 Fetching business info for: ${name} in ${location || 'unknown location'}`);

    const enriched = await GooglePlacesService.lookupBusiness(name, location);
    if (!enriched) return res.json({ business: null });

    const business = {
      business_id: enriched.placeId,
      name: enriched.name,
      photos: enriched.photoUrl
        ? [{ url: enriched.photoUrl, width: 800, height: 600, source: 'google', label: enriched.name, photo_order: 0 }]
        : [],
      description: '',
      hours: enriched.openingHours?.weekdayText?.join(', ') || 'Hours vary',
      avg_price: enriched.priceLevel || '',
      ai_description: '',
      rating: enriched.rating,
      review_count: enriched.userRatingCount,
      categories: enriched.types || [],
      address: enriched.address,
      place_id: enriched.placeId,
      website: enriched.website,
      phone: enriched.phone,
      googleMapsUri: enriched.googleMapsUri
    };

    res.json({ business });

  } catch (error) {
    console.error('❌ Business info API error:', error);
    res.status(500).json({ error: 'Failed to fetch business info' });
  }
});

module.exports = router;
