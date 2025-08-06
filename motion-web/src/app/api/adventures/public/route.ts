import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    console.log("📰 Fetching public adventures...");

    // Get all community adventures from Supabase (public feed)
    // Note: community_adventures has user_id -> auth.users, need to join with profiles separately
    const { data: adventures, error } = await supabase
      .from('community_adventures')
      .select(`
        *,
        adventure_photos(
          photo_url,
          is_cover_photo
        )
      `)
      .eq('is_public', true)
      .order('shared_date', { ascending: false })
      .limit(50);

    if (error) {
      console.error("❌ Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch adventures." },
        { status: 500 }
      );
    }

    // Get profile data for each adventure
    if (adventures && adventures.length > 0) {
      const userIds = [...new Set(adventures.map(a => a.user_id))];
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, first_name, last_name, profile_picture_url')
        .in('id', userIds);

      if (!profilesError && profiles) {
        // Map profiles to adventures
        const adventuresWithProfiles = adventures.map(adventure => ({
          ...adventure,
          profiles: profiles.find(p => p.id === adventure.user_id) || null
        }));

        console.log(`✅ Fetched ${adventuresWithProfiles.length} public adventures with profiles`);
        return NextResponse.json({ adventures: adventuresWithProfiles });
      }
    }

    console.log(`✅ Fetched ${adventures?.length || 0} public adventures`);
    return NextResponse.json({ adventures: adventures || [] });

  } catch (error) {
    console.error("❌ Error fetching public adventures:", error);
    return NextResponse.json(
      { error: "Failed to fetch adventures." },
      { status: 500 }
    );
  }
}
