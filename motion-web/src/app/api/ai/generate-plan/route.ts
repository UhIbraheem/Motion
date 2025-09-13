import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.motionflow.app';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('🌐 [VERCEL] Proxying AI request to Railway backend:', BACKEND_URL);
    console.log('📤 [VERCEL] Request body:', JSON.stringify(body, null, 2));
    console.log('🕐 [VERCEL] Timestamp:', new Date().toISOString());
    
    const response = await fetch(`${BACKEND_URL}/api/ai/generate-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': request.headers.get('x-forwarded-for') || 'unknown',
        'User-Agent': 'Motion-Web-Vercel-Proxy',
        // Forward any auth headers if present
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization')!
        })
      },
      body: JSON.stringify(body),
    });

    console.log('📥 [VERCEL] Railway response status:', response.status);
    console.log('📊 [VERCEL] Railway response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [VERCEL] Railway backend request failed:', response.status, response.statusText);
      console.error('❌ [VERCEL] Error details:', errorText);
      return NextResponse.json(
        { 
          error: 'Failed to generate adventure plan', 
          details: errorText,
          status: response.status,
          backendUrl: BACKEND_URL
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ [VERCEL] Successfully proxied to Railway backend');
    console.log('📊 [VERCEL] Received adventure with title:', data?.title || 'No title');
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ [VERCEL] Error in AI generate-plan route:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error',
        backendUrl: BACKEND_URL
      },
      { status: 500 }
    );
  }
}

// Health check for this specific route
export async function GET() {
  try {
    const backendHealthUrl = `${BACKEND_URL}/health`;
    const response = await fetch(backendHealthUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    const isHealthy = response.ok;
    
    return NextResponse.json({
      status: isHealthy ? 'OK' : 'UNHEALTHY',
      backend: BACKEND_URL,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      status: 'UNHEALTHY',
      backend: BACKEND_URL,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}
