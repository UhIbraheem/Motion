import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    
    console.log("🔧 Updating user privileges for:", userId);

    // Update user profile with pro privileges
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        first_name: 'Ibraheem',
        last_name: 'Mohammad',
        display_name: 'Ibraheem Mohammad',
        profile_picture_url: 'https://lh3.googleusercontent.com/a/ACg8ocI_JLeoGD0Iw5UGbosEKU8mBDhCa8nPUOsnPf7Fn5H4nOS8lhYX=s96-c',
        membership_tier: 'pro',
        monthly_generations: 0,
        monthly_edits: 0,
        generations_limit: 999999,
        edits_limit: 999999,
        subscription_status: 'active',
        last_reset_date: new Date().toISOString(),
        subscription_period_end: '2099-12-31T23:59:59Z'
      }, {
        onConflict: 'id'
      })
      .select()
      .single();

    if (error) {
      console.error("❌ Error updating user privileges:", error);
      return NextResponse.json(
        { error: "Failed to update user privileges." },
        { status: 500 }
      );
    }

    console.log("✅ User privileges updated successfully");
    return NextResponse.json({ 
      message: "User privileges updated successfully!",
      profile: data 
    });

  } catch (error) {
    console.error("❌ Error updating user privileges:", error);
    return NextResponse.json(
      { error: "Failed to update user privileges." },
      { status: 500 }
    );
  }
}
