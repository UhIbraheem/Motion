import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET ?communityId=uuid -> list reviews
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const communityId = searchParams.get('communityId');
  if (!communityId) return NextResponse.json({ error: 'communityId required' }, { status: 400 });
  const { data, error } = await supabase
    .from('community_adventure_reviews')
    .select('*')
    .eq('community_adventure_id', communityId)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  return NextResponse.json({ reviews: data });
}

// POST { userId, communityId, rating, text }
export async function POST(req: NextRequest) {
  try {
    const { userId, communityId, rating, text } = await req.json();
    if (!userId || !communityId || typeof rating !== 'number') {
      return NextResponse.json({ error: 'userId, communityId, rating required' }, { status: 400 });
    }
    const insertRow = {
      user_id: userId,
      community_adventure_id: communityId,
      rating,
      review_text: text || null,
      created_at: new Date().toISOString(),
    };
    const { data, error } = await supabase
      .from('community_adventure_reviews')
      .insert(insertRow)
      .select()
      .single();
    if (error) return NextResponse.json({ error: 'Failed to add review' }, { status: 500 });
    return NextResponse.json({ review: data });
  } catch (e: any) {
    console.error('Review insert error:', e);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
