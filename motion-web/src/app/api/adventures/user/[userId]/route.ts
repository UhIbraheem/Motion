import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { userId } = await params;

    console.log(`📋 Fetching adventures for user: ${userId}`);

    // Fetch user adventures from both tables
    const { data: personalAdventures, error: personalError } = await supabase
      .from('adventures')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    const { data: communityAdventures, error: communityError } = await supabase
      .from('community_adventures')
      .select('*')
      .eq('user_id', userId)
      .order('shared_date', { ascending: false });

    if (personalError) {
      console.error('❌ Error fetching personal adventures:', personalError);
    }
    
    if (communityError) {
      console.error('❌ Error fetching community adventures:', communityError);
    }

    const allAdventures = [
      ...(personalAdventures || []),
      ...(communityAdventures || []).map(ca => ({
        ...ca,
        created_at: ca.shared_date,
        is_completed: true, // Community adventures are completed by definition
        is_shared: true
      }))
    ];

    console.log(`✅ Found ${personalAdventures?.length || 0} personal + ${communityAdventures?.length || 0} community = ${allAdventures.length} total adventures`);

    // Map the data to match frontend expectations
    const mappedAdventures = allAdventures.map(adventure => ({
      ...adventure,
      scheduled_for: adventure.scheduled_date || adventure.scheduled_for,
      is_favorite: adventure.is_favorite ?? false,
      step_completions: adventure.step_completions ?? {}
    }));

    return NextResponse.json(mappedAdventures);
  } catch (error) {
    console.error('💥 Error in user adventures API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user adventures' },
      { status: 500 }
    );
  }
}
