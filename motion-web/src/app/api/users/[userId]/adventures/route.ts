import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Use service role client for server-side operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log(`📋 Fetching adventures for user: ${userId}`);

    // Fetch user's saved adventures (including new schema columns)
    const { data: adventures, error } = await supabase
      .from('adventures')
      .select(`
        id,
        title,
        description,
        location,
        duration_hours,
        estimated_cost,
        experience_type,
        vibe,
        budget_level,
        group_size,
        radius_miles,
        steps,
        filters_used,
        generation_metadata,
        google_places_validated,
        premium_features_used,
        ai_confidence_score,
        difficulty_level,
        is_completed,
        is_scheduled,
        scheduled_date,
        adventure_type,
        likes_count,
        saves_count,
        created_at,
        updated_at
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching user adventures:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`✅ Found ${adventures?.length || 0} adventures for user`);

    return NextResponse.json({ 
      adventures: adventures || [],
      count: adventures?.length || 0
    });

  } catch (error) {
    console.error('💥 Error in user adventures API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user adventures' },
      { status: 500 }
    );
  }
}
