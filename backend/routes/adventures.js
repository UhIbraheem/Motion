const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const GooglePlacesService = require('../services/GooglePlacesService');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Create a new adventure with automatic Google Places enhancement
 */
router.post('/create-enhanced', async (req, res) => {
  try {
    const { adventure, userId } = req.body;

    if (!adventure || !userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Adventure data and user ID are required' 
      });
    }

    console.log('🚀 Creating enhanced adventure:', adventure.title);

    // Enhance adventure with Google Places data
    const enhancedAdventure = await GooglePlacesService.enhanceFullAdventure(adventure);

    // Prepare data for database
    const adventureData = {
      user_id: userId,
      title: enhancedAdventure.title,
      description: enhancedAdventure.description,
      location: enhancedAdventure.location,
      duration: enhancedAdventure.duration,
      difficulty: enhancedAdventure.difficulty,
      experience_type: enhancedAdventure.experience_type || 'exploration',
      vibe: enhancedAdventure.vibe || 'relaxed',
      budget_level: enhancedAdventure.budget_level || 'moderate',
      tags: enhancedAdventure.tags || [],
      steps: enhancedAdventure.steps,
      photos: enhancedAdventure.photos || [],
      google_places_validated: enhancedAdventure.google_places_validated,
      google_places_data: {
        enhanced_at: enhancedAdventure.enhanced_at,
        validation_summary: {
          total_steps: enhancedAdventure.steps.length,
          enhanced_steps: enhancedAdventure.steps.filter(s => s.google_places).length,
          validation_rate: enhancedAdventure.steps.filter(s => s.google_places).length / enhancedAdventure.steps.length
        }
      },
      created_at: new Date().toISOString()
    };

    // Save to database
    const { data, error } = await supabase
      .from('adventures')
      .insert([adventureData])
      .select()
      .single();

    if (error) {
      console.error('❌ Database error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to save adventure to database' 
      });
    }

    // CACHE all Google Places data from adventure steps
    const cacheResult = await GooglePlacesService.cacheAdventureSteps(enhancedAdventure.steps);
    console.log(`💾 Cached ${cacheResult.cached} places from adventure`);

    console.log('✅ Enhanced adventure created successfully:', data.id);

    res.json({
      success: true,
      adventure: data,
      enhancement_summary: {
        total_steps: enhancedAdventure.steps.length,
        enhanced_steps: enhancedAdventure.steps.filter(s => s.google_places).length,
        google_places_validated: enhancedAdventure.google_places_validated
      }
    });

  } catch (error) {
    console.error('❌ Error creating enhanced adventure:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

/**
 * Update adventure scheduling
 */
router.patch('/:adventureId/schedule', async (req, res) => {
  try {
    const { adventureId } = req.params;
    const { scheduledDate, startTime, userId } = req.body;

    if (!adventureId || !scheduledDate || !userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Adventure ID, scheduled date, and user ID are required' 
      });
    }

    console.log('📅 Backend: Scheduling adventure:', { adventureId, scheduledDate, userId });

    // Update only columns that exist in the database schema
    // The adventures table only has: scheduled_date and is_scheduled
    const { data, error } = await supabase
      .from('adventures')
      .update({
        scheduled_date: scheduledDate,
        is_scheduled: true,
      })
      .eq('id', adventureId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error scheduling adventure:', error);
      return res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to schedule adventure' 
      });
    }

    console.log('✅ Backend: Adventure scheduled successfully:', data.id);

    res.json({
      success: true,
      adventure: data
    });

  } catch (error) {
    console.error('❌ Error in schedule endpoint:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

/**
 * Update step completion status
 */
router.patch('/:adventureId/steps/:stepId/toggle', async (req, res) => {
  try {
    const { adventureId, stepId } = req.params;
    const { completed, userId } = req.body;

    if (!adventureId || !stepId || userId === undefined) {
      return res.status(400).json({ 
        success: false, 
        error: 'Adventure ID, step ID, and user ID are required' 
      });
    }

    // Get current adventure
    const { data: adventure, error: fetchError } = await supabase
      .from('adventures')
      .select('steps, steps_completed')
      .eq('id', adventureId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !adventure) {
      return res.status(404).json({ 
        success: false, 
        error: 'Adventure not found' 
      });
    }

    // Update steps array
    const updatedSteps = adventure.steps.map(step => 
      step.id === stepId ? { ...step, completed } : step
    );

    // Update steps_completed array
    let stepsCompleted = adventure.steps_completed || [];
    if (completed && !stepsCompleted.includes(stepId)) {
      stepsCompleted.push(stepId);
    } else if (!completed && stepsCompleted.includes(stepId)) {
      stepsCompleted = stepsCompleted.filter(id => id !== stepId);
    }

    // Check if all steps are completed
    const allStepsCompleted = updatedSteps.every(step => step.completed);

    // Update the adventure
    const updateData = {
      steps: updatedSteps,
      steps_completed: stepsCompleted,
      updated_at: new Date().toISOString()
    };

    if (allStepsCompleted && !adventure.is_completed) {
      updateData.is_completed = true;
      updateData.completed_at = new Date().toISOString();
    } else if (!allStepsCompleted && adventure.is_completed) {
      updateData.is_completed = false;
      updateData.completed_at = null;
    }

    const { data, error } = await supabase
      .from('adventures')
      .update(updateData)
      .eq('id', adventureId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating step:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to update step' 
      });
    }

    res.json({
      success: true,
      adventure: data,
      step_updated: stepId,
      all_completed: allStepsCompleted
    });

  } catch (error) {
    console.error('❌ Error in step toggle endpoint:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

/**
 * Mark adventure as completed
 */
router.patch('/:adventureId/complete', async (req, res) => {
  try {
    const { adventureId } = req.params;
    const { userId } = req.body;

    if (!adventureId || !userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Adventure ID and user ID are required' 
      });
    }

    // Get current adventure to check all steps are completed
    const { data: adventure, error: fetchError } = await supabase
      .from('adventures')
      .select('steps')
      .eq('id', adventureId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !adventure) {
      return res.status(404).json({ 
        success: false, 
        error: 'Adventure not found' 
      });
    }

    // Check if all steps are completed
    const allStepsCompleted = adventure.steps.every(step => step.completed);
    
    if (!allStepsCompleted) {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot mark adventure as completed - not all steps are finished' 
      });
    }

    // Mark as completed
    const { data, error } = await supabase
      .from('adventures')
      .update({
        is_completed: true,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', adventureId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error completing adventure:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to complete adventure' 
      });
    }

    res.json({
      success: true,
      adventure: data
    });

  } catch (error) {
    console.error('❌ Error in complete endpoint:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

/**
 * Delete an adventure
 */
router.delete('/:adventureId', async (req, res) => {
  try {
    const { adventureId } = req.params;
    const { userId } = req.body;

    if (!adventureId || !userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Adventure ID and user ID are required' 
      });
    }

    const { error } = await supabase
      .from('adventures')
      .delete()
      .eq('id', adventureId)
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Error deleting adventure:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to delete adventure' 
      });
    }

    res.json({
      success: true,
      message: 'Adventure deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error in delete endpoint:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

/**
 * Get scheduled adventures for calendar
 */
router.get('/calendar/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { month, year } = req.query;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID is required' 
      });
    }

    let query = supabase
      .from('adventures')
      .select('*')
      .eq('user_id', userId)
      .not('scheduled_date', 'is', null)
      .order('scheduled_date', { ascending: true });

    // Filter by month/year if provided
    if (month && year) {
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
      const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;
      query = query.gte('scheduled_date', startDate).lte('scheduled_date', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error fetching calendar adventures:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch calendar data' 
      });
    }

    // Transform data for calendar display
    const calendarEvents = data.map(adventure => ({
      id: adventure.id,
      title: adventure.title,
      date: adventure.scheduled_date,
      startTime: adventure.scheduled_start_time,
      location: adventure.location,
      duration: adventure.duration,
      is_completed: adventure.is_completed,
      steps: adventure.steps,
      type: 'scheduled'
    }));

    res.json({
      success: true,
      events: calendarEvents
    });

  } catch (error) {
    console.error('❌ Error in calendar endpoint:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

/**
 * Enrich and persist Google Places data for an existing adventure
 */
router.post('/:adventureId/enrich-google', async (req, res) => {
  try {
    const { adventureId } = req.params;
    const { userId } = req.body;
    if (!adventureId || !userId) {
      return res.status(400).json({ success: false, error: 'Adventure ID and user ID are required' });
    }

    const { data: adv, error: fetchErr } = await supabase
      .from('adventures')
      .select('id, user_id, location, adventure_steps, adventure_photos')
      .eq('id', adventureId)
      .eq('user_id', userId)
      .single();
    if (fetchErr || !adv) return res.status(404).json({ success: false, error: 'Adventure not found' });

    const steps = Array.isArray(adv.adventure_steps) ? adv.adventure_steps : [];
    const enriched = [];
    for (const step of steps) {
      const s = await GooglePlacesService.enrichAdventureStep(step, adv.location || 'United States');
      enriched.push(s);
      await new Promise(r => setTimeout(r, 75));
    }

    const coverPhoto = enriched.find(s => s.photo_url)?.photo_url || null;
    let photos = Array.isArray(adv.adventure_photos) ? adv.adventure_photos : [];
    if (coverPhoto) {
      const hasCover = photos.some(p => p.is_cover_photo);
      if (!hasCover) {
        photos = [{ photo_url: coverPhoto, is_cover_photo: true }, ...photos];
      }
    }

    const { data, error } = await supabase
      .from('adventures')
      .update({
        adventure_steps: enriched,
        adventure_photos: photos,
        google_places_validated: enriched.some(s => s.validated),
        updated_at: new Date().toISOString(),
      })
      .eq('id', adventureId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('❌ Failed to persist enrichment:', error);
      return res.status(500).json({ success: false, error: 'Failed to save enrichment' });
    }

    res.json({ success: true, adventure: data });
  } catch (e) {
    console.error('❌ Enrich-google error:', e);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
