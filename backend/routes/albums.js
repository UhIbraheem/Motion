const express = require("express");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// ============================================
// ALBUMS CRUD
// ============================================

// Get all albums for a user
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const { data, error } = await supabase
      .from("albums")
      .select(`
        *,
        album_places (
          id,
          saved_place_id,
          added_at,
          notes,
          sort_order
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Add place count to each album
    const albumsWithCounts = data.map(album => ({
      ...album,
      place_count: album.album_places?.length || 0
    }));

    res.json(albumsWithCounts);
  } catch (error) {
    console.error("❌ Error fetching albums:", error);
    res.status(500).json({ error: "Failed to fetch albums" });
  }
});

// Get single album with all places
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    const { data, error } = await supabase
      .from("albums")
      .select(`
        *,
        album_places (
          id,
          added_at,
          notes,
          sort_order,
          saved_places (*)
        )
      `)
      .eq("id", id)
      .single();

    if (error) throw error;

    // Check if user owns this album or if it's public
    if (data.user_id !== userId && !data.is_public) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(data);
  } catch (error) {
    console.error("❌ Error fetching album:", error);
    res.status(500).json({ error: "Failed to fetch album" });
  }
});

// Create new album
router.post("/", async (req, res) => {
  try {
    const { userId, name, description, isPublic, coverPhotoUrl } = req.body;

    if (!userId || !name) {
      return res.status(400).json({ error: "userId and name are required" });
    }

    const { data, error } = await supabase
      .from("albums")
      .insert({
        user_id: userId,
        name,
        description: description || null,
        is_public: isPublic || false,
        cover_photo_url: coverPhotoUrl || null
      })
      .select()
      .single();

    if (error) throw error;

    console.log("✅ Album created:", data.id, data.name);
    res.json(data);
  } catch (error) {
    console.error("❌ Error creating album:", error);
    res.status(500).json({ error: "Failed to create album" });
  }
});

// Update album
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, name, description, isPublic, coverPhotoUrl } = req.body;

    // Verify ownership
    const { data: existing } = await supabase
      .from("albums")
      .select("user_id")
      .eq("id", id)
      .single();

    if (!existing || existing.user_id !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const { data, error } = await supabase
      .from("albums")
      .update({
        name,
        description,
        is_public: isPublic,
        cover_photo_url: coverPhotoUrl
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    console.log("✅ Album updated:", id);
    res.json(data);
  } catch (error) {
    console.error("❌ Error updating album:", error);
    res.status(500).json({ error: "Failed to update album" });
  }
});

// Delete album
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    // Verify ownership
    const { data: existing } = await supabase
      .from("albums")
      .select("user_id")
      .eq("id", id)
      .single();

    if (!existing || existing.user_id !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const { error } = await supabase
      .from("albums")
      .delete()
      .eq("id", id);

    if (error) throw error;

    console.log("✅ Album deleted:", id);
    res.json({ success: true });
  } catch (error) {
    console.error("❌ Error deleting album:", error);
    res.status(500).json({ error: "Failed to delete album" });
  }
});

// ============================================
// ALBUM PLACES (Add/Remove places from albums)
// ============================================

// Add place to album
router.post("/:id/places", async (req, res) => {
  try {
    const { id: albumId } = req.params;
    const { userId, savedPlaceId, notes, sortOrder } = req.body;

    // Verify album ownership
    const { data: album } = await supabase
      .from("albums")
      .select("user_id")
      .eq("id", albumId)
      .single();

    if (!album || album.user_id !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const { data, error } = await supabase
      .from("album_places")
      .insert({
        album_id: albumId,
        saved_place_id: savedPlaceId,
        notes: notes || null,
        sort_order: sortOrder || 0
      })
      .select()
      .single();

    if (error) {
      // Handle duplicate entry
      if (error.code === '23505') {
        return res.status(409).json({ error: "Place already in album" });
      }
      throw error;
    }

    console.log("✅ Place added to album:", albumId);
    res.json(data);
  } catch (error) {
    console.error("❌ Error adding place to album:", error);
    res.status(500).json({ error: "Failed to add place to album" });
  }
});

// Remove place from album
router.delete("/:id/places/:placeId", async (req, res) => {
  try {
    const { id: albumId, placeId } = req.params;
    const { userId } = req.query;

    // Verify album ownership
    const { data: album } = await supabase
      .from("albums")
      .select("user_id")
      .eq("id", albumId)
      .single();

    if (!album || album.user_id !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const { error } = await supabase
      .from("album_places")
      .delete()
      .eq("album_id", albumId)
      .eq("saved_place_id", placeId);

    if (error) throw error;

    console.log("✅ Place removed from album:", albumId);
    res.json({ success: true });
  } catch (error) {
    console.error("❌ Error removing place from album:", error);
    res.status(500).json({ error: "Failed to remove place from album" });
  }
});

module.exports = router;
