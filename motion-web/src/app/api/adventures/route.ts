import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { adventure, userId, scheduledFor } = await request.json();

    console.log("💾 Saving adventure:", { userId, title: adventure.title });

    // Save adventure to Supabase
    const { data, error } = await supabase
      .from('adventures')
      .insert({
        user_id: userId,
        title: adventure.title,
        description: adventure.description,
        estimated_duration: adventure.estimatedDuration,
        estimated_cost: adventure.estimatedCost,
        steps: adventure.steps,
        scheduled_for: scheduledFor,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("❌ Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to save adventure to database." },
        { status: 500 }
      );
    }

    console.log("✅ Adventure saved successfully:", data.id);
    return NextResponse.json({ 
      message: "Adventure saved successfully!",
      adventureId: data.id 
    });

  } catch (error) {
    console.error("❌ Error saving adventure:", error);
    return NextResponse.json(
      { error: "Failed to save adventure." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required." },
        { status: 400 }
      );
    }

    // Get user's adventures from Supabase
    const { data, error } = await supabase
      .from('adventures')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("❌ Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch adventures." },
        { status: 500 }
      );
    }

    return NextResponse.json({ adventures: data });

  } catch (error) {
    console.error("❌ Error fetching adventures:", error);
    return NextResponse.json(
      { error: "Failed to fetch adventures." },
      { status: 500 }
    );
  }
}
