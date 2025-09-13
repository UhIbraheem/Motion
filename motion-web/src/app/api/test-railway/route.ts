import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.motionflow.app';

export async function GET() {
  try {
    console.log('🧪 Testing Railway connection from Vercel...');
    console.log('🎯 Backend URL:', BACKEND_URL);
    
    const response = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📥 Railway response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Railway health check failed:', errorText);
      return NextResponse.json(
        { 
          error: 'Railway backend not responding', 
          status: response.status,
          details: errorText,
          backendUrl: BACKEND_URL
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log('✅ Railway health check successful:', data);
    
    return NextResponse.json({
      success: true,
      message: 'Railway backend connected successfully',
      backendUrl: BACKEND_URL,
      railwayResponse: data
    });
  } catch (error) {
    console.error('💥 Error connecting to Railway:', error);
    return NextResponse.json(
      { 
        error: 'Cannot connect to Railway backend', 
        details: error instanceof Error ? error.message : 'Unknown error',
        backendUrl: BACKEND_URL
      },
      { status: 500 }
    );
  }
}
