import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.motionflow.app';

export async function GET(request: NextRequest) {
  const timestamp = new Date().toISOString();
  
  try {
    // Check frontend health
    const frontendStatus = {
      status: 'OK',
      service: 'Motion Web Frontend',
      timestamp,
      environment: process.env.NODE_ENV || 'production',
      version: process.env.npm_package_version || '1.0.0'
    };

    // Check backend health
    let backendStatus;
    try {
      const backendResponse = await fetch(`${BACKEND_URL}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000), // 5 second timeout
        headers: {
          'User-Agent': 'Motion-Web-Health-Check/1.0'
        }
      });

      if (backendResponse.ok) {
        const backendData = await backendResponse.json();
        backendStatus = {
          status: 'OK',
          service: 'Motion Railway Backend',
          timestamp: backendData.timestamp || timestamp,
          responseTime: `${Date.now() - new Date().getTime()}ms`,
          url: BACKEND_URL
        };
      } else {
        backendStatus = {
          status: 'UNHEALTHY',
          service: 'Motion Railway Backend',
          timestamp,
          error: `HTTP ${backendResponse.status}: ${backendResponse.statusText}`,
          url: BACKEND_URL
        };
      }
    } catch (backendError) {
      backendStatus = {
        status: 'UNREACHABLE',
        service: 'Motion Railway Backend',
        timestamp,
        error: backendError instanceof Error ? backendError.message : 'Unknown error',
        url: BACKEND_URL
      };
    }

    // Overall system health
    const overallStatus = backendStatus.status === 'OK' ? 'HEALTHY' : 'DEGRADED';
    const statusCode = overallStatus === 'HEALTHY' ? 200 : 503;

    return NextResponse.json({
      status: overallStatus,
      timestamp,
      checks: {
        frontend: frontendStatus,
        backend: backendStatus
      },
      services: {
        database: 'Supabase (External)',
        ai: 'OpenAI (Backend Integrated)',
        payments: 'Stripe (Planned)',
        deployment: {
          frontend: 'Vercel',
          backend: 'Railway'
        }
      },
      environment: {
        node_env: process.env.NODE_ENV,
        backend_url: BACKEND_URL,
        site_url: process.env.NEXT_PUBLIC_SITE_URL || 'https://app.motionflow.app'
      }
    }, { status: statusCode });

  } catch (error) {
    return NextResponse.json({
      status: 'ERROR',
      timestamp,
      error: error instanceof Error ? error.message : 'Health check failed',
      checks: {
        frontend: {
          status: 'ERROR',
          service: 'Motion Web Frontend',
          timestamp,
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        backend: {
          status: 'UNKNOWN',
          service: 'Motion Railway Backend',
          timestamp,
          error: 'Could not check due to frontend error'
        }
      }
    }, { status: 500 });
  }
}

// POST method for manual health checks with additional diagnostics
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { includeDetails = false } = body;

    const basicHealth = await GET(request);
    const healthData = await basicHealth.json();

    if (!includeDetails) {
      return NextResponse.json(healthData);
    }

    // Additional diagnostics when requested
    const diagnostics = {
      memory: {
        used: process.memoryUsage(),
        uptime: process.uptime()
      },
      environment: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version
      },
      endpoints: {
        ai_generate: `${BACKEND_URL}/api/ai/generate-plan`,
        places_enhance: `${BACKEND_URL}/api/places/enhance`,
        adventures: `${BACKEND_URL}/api/adventures`
      }
    };

    return NextResponse.json({
      ...healthData,
      diagnostics
    });

  } catch (error) {
    return NextResponse.json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: 'Failed to perform detailed health check',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
