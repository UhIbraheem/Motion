const express = require("express");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");
const googlePlaces = require("../services/GooglePlacesService");
const geocoding = require("../services/GeocodingService");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// ============================================
// SAVED PLACES CRUD
// ============================================

// Get all saved places for a user
router.get("/saved", async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const { data, error } = await supabase
      .from("saved_places")
      .select("*")
      .eq("user_id", userId)
      .order("saved_at", { ascending: false });

    if (error) throw error;

    console.log(`✅ Fetched ${data.length} saved places for user ${userId}`);
    res.json(data);
  } catch (error) {
    console.error("❌ Error fetching saved places:", error);
    res.status(500).json({ error: "Failed to fetch saved places" });
  }
});

// Save a new place
router.post("/save", async (req, res) => {
  try {
    const {
      userId,
      googlePlaceId,
      businessName,
      address,
      lat,
      lng,
      photoUrl,
      rating,
      priceLevel,
      phone,
      website,
      businessHours,
      types,
      googleData,
      notes
    } = req.body;

    if (!userId || !googlePlaceId || !businessName) {
      return res.status(400).json({
        error: "userId, googlePlaceId, and businessName are required"
      });
    }

    // CACHE the place to google_places_cache for future instant loading
    if (googlePlaceId) {
      await googlePlaces.cachePlace({
        placeId: googlePlaceId,
        name: businessName,
        address: address,
        location: lat && lng ? { latitude: lat, longitude: lng } : null,
        rating: rating,
        priceLevel: priceLevel,
        phone: phone,
        website: website,
        openingHours: businessHours,
        photoUrl: photoUrl,
        types: types,
        raw: googleData
      });
      console.log(`💾 Cached place to google_places_cache: ${businessName}`);
    }

    const { data, error} = await supabase
      .from("saved_places")
      .insert({
        user_id: userId,
        google_place_id: googlePlaceId,
        business_name: businessName,
        address: address || null,
        lat: lat || null,
        lng: lng || null,
        photo_url: photoUrl || null,
        rating: rating || null,
        price_level: priceLevel || null,
        phone: phone || null,
        website: website || null,
        business_hours: businessHours || null,
        types: types || null,
        google_data: googleData || null,
        notes: notes || null
      })
      .select()
      .single();

    if (error) {
      // Handle duplicate entry
      if (error.code === '23505') {
        const { data: existing } = await supabase
          .from("saved_places")
          .select("*")
          .eq("user_id", userId)
          .eq("google_place_id", googlePlaceId)
          .single();

        return res.json({
          ...existing,
          alreadySaved: true
        });
      }
      throw error;
    }

    console.log("✅ Place saved:", businessName);
    res.json(data);
  } catch (error) {
    console.error("❌ Error saving place:", error);
    res.status(500).json({ error: "Failed to save place" });
  }
});

// Delete saved place
router.delete("/saved/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    const { data: existing } = await supabase
      .from("saved_places")
      .select("user_id")
      .eq("id", id)
      .single();

    if (!existing || existing.user_id !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const { error } = await supabase
      .from("saved_places")
      .delete()
      .eq("id", id);

    if (error) throw error;

    console.log("✅ Place deleted:", id);
    res.json({ success: true });
  } catch (error) {
    console.error("❌ Error deleting place:", error);
    res.status(500).json({ error: "Failed to delete place" });
  }
});

// ============================================
// GOOGLE PLACES SEARCH (Proxy)
// ============================================

// Search places
router.get("/search", async (req, res) => {
  try {
    const { query, location, radius } = req.query;

    if (!query || !location) {
      return res.status(400).json({ error: "query and location are required" });
    }

    console.log("🔍 Searching places:", query, "in", location);

    const coords = await geocoding.geocode(location);

    const places = await googlePlaces.textSearch({
      textQuery: query,
      biasCenter: {
        latitude: coords.latitude,
        longitude: coords.longitude
      },
      biasRadiusMeters: radius ? parseInt(radius) : 5000,
      pageSize: 20
    });

    console.log(`✅ Found ${places.length} places`);
    res.json(places);
  } catch (error) {
    console.error("❌ Error searching places:", error);
    res.status(500).json({ error: "Failed to search places" });
  }
});

// ============================================
// GOOGLE PLACES AUTOCOMPLETE
// ============================================

// City autocomplete proxy endpoint
router.get("/autocomplete", async (req, res) => {
  try {
    const { input } = req.query;

    if (!input || input.length < 2) {
      return res.json({ predictions: [] });
    }

    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&types=(cities)&key=${process.env.GOOGLE_PLACES_API_KEY}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Autocomplete found ${data.predictions?.length || 0} cities for "${input}"`);

    res.json(data);
  } catch (error) {
    console.error("❌ Error in autocomplete:", error);
    res.status(500).json({ error: "Failed to autocomplete" });
  }
});

module.exports = router;
