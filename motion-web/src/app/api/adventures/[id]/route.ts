import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Adventure ID is required." },
        { status: 400 }
      );
    }

    // Get adventure from Supabase
    const { data, error } = await supabase
      .from('adventures')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error("❌ Supabase error:", error);
      return NextResponse.json(
        { error: "Adventure not found." },
        { status: 404 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Adventure not found." },
        { status: 404 }
      );
    }

    // Return the adventure data in the format expected by the frontend
    return NextResponse.json({ 
      adventure: {
        id: data.id,
        title: data.title,
        description: data.description,
        estimatedDuration: data.duration_hours ? `${data.duration_hours} hours` : '4 hours',
        estimatedCost: data.estimated_cost ? `$${data.estimated_cost}` : '$50',
        steps: data.steps || [],
        createdAt: data.created_at,
        scheduledFor: data.scheduled_date,
        isCompleted: data.is_completed || false,
        isFavorite: data.is_favorite || false
      }
    });

  } catch (error) {
    console.error("❌ Error fetching adventure:", error);
    return NextResponse.json(
      { error: "Failed to fetch adventure." },
      { status: 500 }
    );
  }
}
