import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.motionflow.app';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('🔁 Proxying regenerate-step to backend:', BACKEND_URL);

    const response = await fetch(`${BACKEND_URL}/api/ai/regenerate-step`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend regenerate-step failed:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to regenerate step', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error in regenerate-step route:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
