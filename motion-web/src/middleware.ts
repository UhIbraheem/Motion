import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          req.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          req.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Get session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  console.log('🔐 Middleware check:', {
    path: req.nextUrl.pathname,
    hasValidSession: !!session,
    email: session?.user?.email,
    error: undefined
  });

  // Skip middleware for callback - let it complete auth flow
  // Don't check session or redirect during callback
  if (req.nextUrl.pathname === '/auth/callback') {
    console.log('🔐 Allowing callback page');
    return response
  }

  // Auth pages - redirect if already logged in
  if (req.nextUrl.pathname.startsWith('/auth/')) {
    if (session) {
      console.log('🔐 User has session, redirecting from auth page to home');
      return NextResponse.redirect(new URL('/', req.url))
    }
    return response
  }

  // Protected routes - only protect profile
  const protectedRoutes = ['/profile']
  if (protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route))) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth/signin', req.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/auth/:path*',
    '/profile/:path*'
  ]
}
