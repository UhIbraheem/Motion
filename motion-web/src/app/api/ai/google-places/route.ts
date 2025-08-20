import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.motionflow.app';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('🔍 Proxying Google Places request to backend:', BACKEND_URL);
    
    const response = await fetch(`${BACKEND_URL}/api/ai/google-places`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend Google Places request failed:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch place data', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('❌ Google Places proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
