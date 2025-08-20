import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Check for required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables in community-adventures');
}

// Initialize Supabase client (only if keys exist)
const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

/*
 POST /api/community-adventures
 Body: { userId, adventureId?, adventure?, additionalPhotos?: [{url,label?}], makePublic?: boolean }
 If adventureId provided: clone existing adventure into community_adventures + copy its photos.
 Else use provided adventure payload.
 Returns: { communityAdventureId }
*/
export async function POST(req: NextRequest) {
  try {
    // Check if Supabase client is available
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const { userId, adventureId, adventure, additionalPhotos = [], makePublic = true } = await req.json();
    if (!userId || (!adventureId && !adventure)) {
      return NextResponse.json({ error: 'userId and (adventureId or adventure) required' }, { status: 400 });
    }

    let baseAdventure: any = adventure;
    let srcPhotos: any[] = [];

    if (adventureId) {
      const { data: adv, error } = await supabase
        .from('adventures')
        .select('*')
        .eq('id', adventureId)
        .single();
      if (error || !adv) return NextResponse.json({ error: 'Source adventure not found' }, { status: 404 });
      baseAdventure = adv;
      const { data: photos } = await supabase
        .from('adventure_photos')
        .select('*')
        .eq('adventure_id', adventureId)
        .order('step_index');
      srcPhotos = photos || [];
    }

    const insertPayload = {
      user_id: userId,
      title: baseAdventure.title || baseAdventure.custom_title || 'Shared Adventure',
      custom_title: baseAdventure.custom_title || baseAdventure.title || null,
      custom_description: baseAdventure.description || baseAdventure.custom_description || null,
      description: baseAdventure.description || null,
      steps: baseAdventure.steps || baseAdventure.adventure_steps || [],
      location: baseAdventure.location || (baseAdventure.filters_used?.location ?? null),
      duration_hours: baseAdventure.duration_hours || baseAdventure.estimated_duration || null,
      estimated_cost: baseAdventure.estimated_cost || null,
      rating: baseAdventure.rating || null,
      is_public: makePublic,
      shared_date: new Date().toISOString(),
    };

    const { data: community, error: commErr } = await supabase
      .from('community_adventures')
      .insert(insertPayload)
      .select()
      .single();
    if (commErr || !community) {
      console.error('Community insert error:', commErr);
      return NextResponse.json({ error: 'Failed to create community adventure' }, { status: 500 });
    }

    const communityId = community.id;

    // Copy existing photos + add additional user photos
    const photoRows: any[] = [];
    for (const p of srcPhotos) {
      photoRows.push({
        adventure_id: communityId,
        step_index: p.step_index ?? 0,
        photo_order: p.photo_order ?? 0,
        url: p.url || p.photo_url,
        width: p.width || null,
        height: p.height || null,
        source: p.source || 'google',
        label: p.label || null,
        place_id: p.place_id || null,
        address: p.address || null,
        created_at: new Date().toISOString(),
      });
    }
    for (const add of additionalPhotos) {
      photoRows.push({
        adventure_id: communityId,
        step_index: add.step_index ?? 0,
        photo_order: add.photo_order ?? 99,
        url: add.url,
        width: add.width || null,
        height: add.height || null,
        source: 'user_uploaded',
        label: add.label || null,
        place_id: null,
        address: null,
        created_at: new Date().toISOString(),
      });
    }
    if (photoRows.length) {
      const { error: photoErr } = await supabase.from('adventure_photos').insert(photoRows);
      if (photoErr) console.error('Photo copy error (non-fatal):', photoErr.message);
    }

    return NextResponse.json({ communityAdventureId: communityId });
  } catch (e: any) {
    console.error('Community adventure error:', e);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
