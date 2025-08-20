import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required." },
        { status: 400 }
      );
    }

    // Get user profile with subscription info
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('membership_tier, monthly_generations, monthly_edits, generations_limit, edits_limit, last_reset_date')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error("❌ Profile fetch error:", profileError);
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    // Calculate usage based on subscription tier
    const membershipTier = profile.membership_tier || 'free';
    let generationsLimit = 10; // Free tier default
    let editsLimit = 3; // Free tier default

    if (membershipTier === 'explorer') {
      generationsLimit = -1; // Unlimited
      editsLimit = -1; // Unlimited
    } else if (membershipTier === 'pro') {
      generationsLimit = -1; // Unlimited
      editsLimit = -1; // Unlimited
    }

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const lastReset = profile.last_reset_date ? new Date(profile.last_reset_date) : new Date();
    
    // Reset monthly counters if it's a new month
    let monthlyGenerations = profile.monthly_generations || 0;
    let monthlyEdits = profile.monthly_edits || 0;
    
    if (lastReset.getMonth() !== currentMonth || lastReset.getFullYear() !== currentYear) {
      monthlyGenerations = 0;
      monthlyEdits = 0;
      
      // Update the reset date
      await supabase
        .from('profiles')
        .update({ 
          monthly_generations: 0, 
          monthly_edits: 0, 
          last_reset_date: new Date().toISOString() 
        })
        .eq('id', userId);
    }

    return NextResponse.json({
      membership_tier: membershipTier,
      generations: {
        used: monthlyGenerations,
        limit: generationsLimit,
        unlimited: generationsLimit === -1
      },
      edits: {
        used: monthlyEdits,
        limit: editsLimit,
        unlimited: editsLimit === -1
      },
      last_reset: profile.last_reset_date
    });

  } catch (error) {
    console.error("❌ Error fetching usage stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage statistics." },
      { status: 500 }
    );
  }
}
