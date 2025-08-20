import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  try {
    // Test connection first
    const { data: testData, error: testError, count } = await supabase
      .from('adventures')
      .select('*', { count: 'exact', head: true });

    if (testError) {
      return NextResponse.json({ 
        error: 'Supabase connection failed', 
        details: testError 
      }, { status: 500 });
    }

    // Get all adventures for debugging
    const { data: allAdventures, error: allError } = await supabase
      .from('adventures')
      .select(`
        id,
        user_id,
        custom_title,
        title,
        description,
        location,
        created_at,
        scheduled_date,
        is_completed
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get user-specific adventures if userId provided
    let userAdventures = null;
    if (userId) {
      const { data: userData, error: userError } = await supabase
        .from('adventures')
        .select(`
          id,
          user_id,
          custom_title,
          title,
          description,
          location,
          created_at,
          scheduled_date,
          is_completed
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!userError) {
        userAdventures = userData;
      }
    }

    return NextResponse.json({
      success: true,
      connection: 'OK',
      totalCount: count || 0,
      allAdventures: allAdventures || [],
      userAdventures: userAdventures,
      userId: userId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({ 
      error: 'Unexpected error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
