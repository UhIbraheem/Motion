const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const GooglePlacesService = require('../services/GooglePlacesService');

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

/**
 * Check if an adventure needs Google Places enhancement
 */
router.post('/check-enhancement', async (req, res) => {
  try {
    const { adventureId } = req.body;

    if (!adventureId) {
      return res.status(400).json({ error: 'Adventure ID is required' });
    }

    // Fetch adventure from database
    const { data: adventure, error } = await supabase
      .from('adventures')
      .select('id, adventure_steps, google_places_validated, location')
      .eq('id', adventureId)
      .single();

    if (error || !adventure) {
      return res.status(404).json({ error: 'Adventure not found' });
    }

    const missingData = [];
    let enhancementNeeded = false;

    // Check if Google Places validation is missing
    if (!adventure.google_places_validated) {
      missingData.push('google_places_validation');
      enhancementNeeded = true;
    }

    // Check steps for missing photos or business info
    if (adventure.adventure_steps && Array.isArray(adventure.adventure_steps)) {
      for (const step of adventure.adventure_steps) {
        if (!step.photo_url) {
          missingData.push('photos');
          enhancementNeeded = true;
          break;
        }
      }

      for (const step of adventure.adventure_steps) {
        if (!step.rating || !step.business_hours) {
          missingData.push('business_info');
          enhancementNeeded = true;
          break;
        }
      }
    }

    res.json({
      needed: enhancementNeeded,
      missingData: [...new Set(missingData)] // Remove duplicates
    });

  } catch (error) {
    console.error('❌ Enhancement check error:', error);
    res.status(500).json({ error: 'Failed to check enhancement needs' });
  }
});

/**
 * Enhance an adventure with Google Places data
 */
router.post('/enhance', async (req, res) => {
  try {
    const { adventureId } = req.body;

    if (!adventureId) {
      return res.status(400).json({ error: 'Adventure ID is required' });
    }

    console.log(`🔧 Enhancing adventure: ${adventureId}`);

    // Fetch adventure from database
    const { data: adventure, error } = await supabase
      .from('adventures')
      .select('id, adventure_steps, location, premium_features_used, google_places_validated')
      .eq('id', adventureId)
      .single();

    if (error || !adventure) {
      return res.status(404).json({ error: 'Adventure not found' });
    }

  let enhanced = false;
  const enhancedSteps = [...(adventure.adventure_steps || [])];

    // Enhance each step with Google Places data
    for (let i = 0; i < enhancedSteps.length; i++) {
      const step = enhancedSteps[i];
      
      // Skip if step already has complete data
  if (step.validated && step.photo_url && step.rating) {
        continue;
      }

      try {
        console.log(`🔍 Enhancing step: ${step.title} in ${step.location}`);
        
        // Enhance with Google Places API v1
        const validatedStep = await GooglePlacesService.enrichAdventureStep(
          step,
          adventure.location || 'United States'
        );
        
        if (validatedStep && validatedStep !== step) {
          enhancedSteps[i] = validatedStep;
          enhanced = true;
          console.log(`✅ Enhanced step: ${step.title}`);
        }
      } catch (stepError) {
        console.error(`❌ Failed to enhance step ${step.title}:`, stepError);
        // Continue with other steps even if one fails
      }
    }

    // Update adventure in database if enhanced
    if (enhanced) {
      const updateData = {
        adventure_steps: enhancedSteps,
        google_places_validated: enhancedSteps.some(step => step.validated),
        premium_features_used: {
          ...(adventure.premium_features_used || {}),
          google_places_validation: true
        }
      };

      const { error: updateError } = await supabase
        .from('adventures')
        .update(updateData)
  .eq('id', adventureId);

      if (updateError) {
        console.error('❌ Failed to update enhanced adventure:', updateError);
        return res.status(500).json({ error: 'Failed to save enhancements' });
      }

      console.log(`✅ Adventure ${adventureId} enhanced successfully`);
    }

    res.json({
      success: true,
      enhanced,
      message: enhanced ? 'Adventure enhanced with Google Places data' : 'No enhancement needed'
    });

  } catch (error) {
    console.error('❌ Enhancement error:', error);
    res.status(500).json({ error: 'Failed to enhance adventure' });
  }
});

/**
 * Batch enhance multiple adventures
 */
router.post('/enhance-batch', async (req, res) => {
  try {
    const { adventureIds, userId } = req.body;

    if (!adventureIds || !Array.isArray(adventureIds)) {
      return res.status(400).json({ error: 'Adventure IDs array is required' });
    }

    console.log(`🔧 Batch enhancing ${adventureIds.length} adventures for user ${userId}`);

    const results = [];

    for (const adventureId of adventureIds) {
      try {
        // Call the single enhancement endpoint internally
        const enhanceResult = await fetch(`${req.protocol}://${req.get('host')}/api/places/enhance`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adventureId })
        });

        const result = await enhanceResult.json();
        results.push({
          adventureId,
          success: enhanceResult.ok,
          enhanced: result.enhanced || false,
          error: result.error
        });

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        results.push({
          adventureId,
          success: false,
          enhanced: false,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const enhancedCount = results.filter(r => r.enhanced).length;

    res.json({
      results,
      summary: {
        total: adventureIds.length,
        successful: successCount,
        enhanced: enhancedCount,
        failed: adventureIds.length - successCount
      }
    });

  } catch (error) {
    console.error('❌ Batch enhancement error:', error);
    res.status(500).json({ error: 'Failed to batch enhance adventures' });
  }
});

module.exports = router;
// Self-test endpoint to diagnose Places connectivity
router.get('/self-test', async (req, res) => {
  try {
    const sample = await GooglePlacesService.lookupBusiness('El Camino Fort Lauderdale', '817 E Las Olas Blvd, Fort Lauderdale, FL 33301');
    res.json({ ok: !!sample, sample });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});
