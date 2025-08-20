import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Check for required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables in adventures');
}

export async function POST(request: NextRequest) {
  try {
    // Check if environment variables are available
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    // Use direct Supabase client instead of auth helpers for Next.js 15 compatibility
    const supabase = createClient(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

  const body = await request.json();
  const { userId, adventure, persistPhotos } = body;

    console.log('💾 Saving adventure:', {
      userId,
      title: adventure.title
    });

    // Normalize steps to ensure each has a business_name for Google Places lookups
    const normalizedSteps = Array.isArray(adventure.steps)
      ? adventure.steps.map((s: any, idx: number) => ({
          // Preserve existing fields but ensure consistent keys
          ...s,
          step_number: s.step_number ?? idx + 1,
          business_name: s.business_name || s.title || s.name || '',
        }))
      : [];

    // Transform the generated adventure to match database schema with new columns
    const dbAdventure = {
      user_id: userId,
      title: adventure.title,
      description: adventure.description,
      location: adventure.location || 'Unknown location',
      duration_hours: parseEstimatedDuration(adventure.estimatedDuration),
      estimated_cost: parseEstimatedCost(adventure.estimatedCost),
      experience_type: adventure.experienceTypes?.[0] || null,
      vibe: adventure.vibe || null,
      budget_level: adventure.budget || null,
      group_size: adventure.groupSize || null,
      radius_miles: adventure.radius || 10,
      steps: normalizedSteps,
      filters_used: adventure.filtersUsed || {},
      generation_metadata: {
        generated_at: new Date().toISOString(),
        ai_model: 'gpt-4o',
        backend_version: '1.0'
      },
      google_places_validated: adventure.steps?.some((s: any) => s.validated) || false,
      premium_features_used: {
        google_places_validation: adventure.steps?.some((s: any) => s.validated) || false,
        premium_filters: false,
        multi_day_itinerary: false
      },
      ai_confidence_score: 0.8,
      difficulty_level: 'easy',
      is_completed: false,
      is_scheduled: false,
      adventure_type: 'single_day',
      generation_count: 1,
      edit_count: 0,
      likes_count: 0,
      saves_count: 0,
      schedule_reminder_sent: false
    };

    // Helper functions
    function parseEstimatedDuration(duration: string): number {
      const match = duration?.match(/(\d+)/);
      return match ? parseInt(match[1]) : 4;
    }

    function parseEstimatedCost(cost: string): number {
      const match = cost?.match(/\$?(\d+)/);
      return match ? parseInt(match[1]) : 50;
    }

    // Insert the adventure into the database
    const { data, error } = await supabase
      .from('adventures')
      .insert(dbAdventure)
      .select()
      .single();

    if (error) {
      console.error('❌ Error saving adventure:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('✅ Adventure saved successfully:', data.id);

    return NextResponse.json({ 
      success: true, 
      adventureId: data.id,
      adventure: data 
    });

  } catch (error) {
    console.error('💥 Error in adventures API:', error);
    return NextResponse.json(
      { error: 'Failed to save adventure' },
      { status: 500 }
    );
  }
}