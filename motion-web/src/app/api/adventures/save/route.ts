import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { type GeneratedAdventure } from '@/services/aiService';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, adventure, scheduledDate } = body;

    if (!userId || !adventure) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and adventure' },
        { status: 400 }
      );
    }

    // Validate user exists
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prepare adventure data for database
    const adventureData = {
      user_id: userId,
      title: adventure.title,
      description: adventure.description || '',
      location: adventure.location || '',
      estimated_duration: adventure.estimatedDuration,
      estimated_cost: adventure.estimatedCost,
      steps: adventure.steps || [],
      experience_types: adventure.experienceTypes || [],
      vibe: adventure.vibe || null,
      budget: adventure.budget || 'moderate',
      group_size: adventure.groupSize || 1,
      radius: adventure.radius || 10,
      filters_used: adventure.filtersUsed || {},
      scheduled_for: scheduledDate || null,
      is_scheduled: !!scheduledDate,
      is_completed: false,
      is_favorite: false,
      rating: null,
      category: adventure.category || 'Adventure',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Insert adventure into database
    const { data: savedAdventure, error: saveError } = await supabase
      .from('adventures')
      .insert(adventureData)
      .select()
      .single();

    if (saveError) {
      console.error('Error saving adventure:', saveError);
      return NextResponse.json(
        { error: 'Failed to save adventure', details: saveError.message },
        { status: 500 }
      );
    }

    // Update user's monthly generation count
    const { error: updateError } = await supabase.rpc('increment_monthly_generations', {
      user_id: userId
    });

    if (updateError) {
      console.warn('Failed to update generation count:', updateError);
      // Don't fail the request for this
    }

    return NextResponse.json({
      success: true,
      data: savedAdventure,
      message: 'Adventure saved successfully'
    });

  } catch (error) {
    console.error('Error in save adventure route:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Get saved adventures for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const { data: adventures, error } = await supabase
      .from('adventures')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching adventures:', error);
      return NextResponse.json(
        { error: 'Failed to fetch adventures', details: error.message },
        { status: 500 }
      );
    }

    // Transform database format back to frontend format
    const transformedAdventures = adventures.map(adventure => ({
      id: adventure.id,
      title: adventure.title,
      description: adventure.description,
      location: adventure.location,
      estimatedDuration: adventure.estimated_duration,
      estimatedCost: adventure.estimated_cost,
      steps: adventure.steps,
      experienceTypes: adventure.experience_types,
      vibe: adventure.vibe,
      budget: adventure.budget,
      groupSize: adventure.group_size,
      radius: adventure.radius,
      filtersUsed: adventure.filters_used,
      scheduledFor: adventure.scheduled_for,
      isScheduled: adventure.is_scheduled,
      isCompleted: adventure.is_completed,
      isFavorite: adventure.is_favorite,
      rating: adventure.rating,
      category: adventure.category,
      createdAt: adventure.created_at,
      updatedAt: adventure.updated_at
    }));

    return NextResponse.json({
      success: true,
      data: transformedAdventures
    });

  } catch (error) {
    console.error('Error fetching adventures:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
