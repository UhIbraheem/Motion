import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Check for required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables in adventures/[id]/steps/reorder');
}

// Initialize Supabase client (only if keys exist)
const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

/**
 * PUT /api/adventures/[id]/steps/reorder
 * Reorders steps in an adventure by swapping two steps' step_order values
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if Supabase client is available
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const { id: adventureId } = await params;
    const body = await request.json();
    const { fromIndex, toIndex } = body;

    // Validate inputs
    if (!adventureId) {
      return NextResponse.json(
        { error: 'Adventure ID is required' },
        { status: 400 }
      );
    }

    if (typeof fromIndex !== 'number' || typeof toIndex !== 'number') {
      return NextResponse.json(
        { error: 'Both fromIndex and toIndex are required and must be numbers' },
        { status: 400 }
      );
    }

    // Get the current adventure with steps
    const { data: adventure, error: fetchError } = await supabase
      .from('adventures')
      .select('steps')
      .eq('id', adventureId)
      .single();

    if (fetchError || !adventure) {
      console.error('❌ Error fetching adventure:', fetchError);
      return NextResponse.json(
        { error: 'Adventure not found' },
        { status: 404 }
      );
    }

    const steps = adventure.steps as any[];

    if (!Array.isArray(steps) || steps.length === 0) {
      return NextResponse.json(
        { error: 'No steps found in this adventure' },
        { status: 400 }
      );
    }

    // Validate indices
    if (fromIndex < 0 || fromIndex >= steps.length || toIndex < 0 || toIndex >= steps.length) {
      return NextResponse.json(
        { error: 'Invalid step indices' },
        { status: 400 }
      );
    }

    // Sort steps by step_order to ensure correct ordering
    const sortedSteps = [...steps].sort((a, b) => a.step_order - b.step_order);

    // Swap the step_order values
    const fromStep = sortedSteps[fromIndex];
    const toStep = sortedSteps[toIndex];

    const tempOrder = fromStep.step_order;
    fromStep.step_order = toStep.step_order;
    toStep.step_order = tempOrder;

    // Update all steps to maintain the correct order
    const updatedSteps = sortedSteps.map((step, index) => ({
      ...step,
      step_order: step.step_order // Keep the swapped orders
    }));

    // Update the adventure with reordered steps
    const { data: updatedAdventure, error: updateError } = await supabase
      .from('adventures')
      .update({
        steps: updatedSteps,
        updated_at: new Date().toISOString()
      })
      .eq('id', adventureId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating adventure steps:', updateError);
      return NextResponse.json(
        { error: 'Failed to reorder steps' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Step ${fromIndex + 1} moved to position ${toIndex + 1}`,
      steps: updatedAdventure.steps
    });

  } catch (error) {
    console.error('❌ Error in step reorder:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
