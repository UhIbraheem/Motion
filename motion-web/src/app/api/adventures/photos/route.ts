import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import businessPhotosService from '@/services/BusinessPhotosService';

// Server-side Supabase client (service role key)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface StepInput { title?: string; name?: string; location?: string; index?: number }

export async function POST(req: NextRequest) {
  try {
  const { adventureId, steps, perStep = 1 } = await req.json();
    if (!adventureId || !Array.isArray(steps)) {
      return NextResponse.json({ error: 'adventureId and steps[] required' }, { status: 400 });
    }

    const stepDescriptors: { name: string; location?: string }[] = steps.map((s: StepInput) => ({
      name: s.title || s.name || 'Activity',
      location: s.location,
    }));

    const photos = perStep > 1
      ? await businessPhotosService.getAdventurePhotosMulti(stepDescriptors, perStep)
      : await businessPhotosService.getAdventurePhotos(stepDescriptors);

    if (!photos.length) {
      return NextResponse.json({ photos: [] });
    }

    const rows = photos.map((p, idx) => ({
      adventure_id: adventureId,
      step_index: typeof p.step_index === 'number' ? p.step_index : idx,
      photo_order: typeof p.photo_order === 'number' ? p.photo_order : 0,
      url: p.url,
      width: p.width,
      height: p.height,
      source: p.source,
      label: p.label || null,
      place_id: p.place_id || null,
      address: p.address || null,
      created_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase.from('adventure_photos').insert(rows).select();
    if (error) {
      console.error('Failed inserting adventure photos:', error.message);
      return NextResponse.json({ error: 'Failed to persist photos' }, { status: 500 });
    }

    return NextResponse.json({ photos: data });
  } catch (e: any) {
    console.error('Photo persistence error:', e);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const adventureId = searchParams.get('adventureId');
  if (!adventureId) return NextResponse.json({ error: 'adventureId required' }, { status: 400 });
  const { data, error } = await supabase
    .from('adventure_photos')
    .select('*')
    .eq('adventure_id', adventureId)
    .order('step_index', { ascending: true });
  if (error) return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 });
  return NextResponse.json({ photos: data });
}
