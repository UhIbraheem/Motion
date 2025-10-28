'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Processing authentication...');

  /**
   * Verify session with retry logic
   */
  const verifySessionWithRetry = async (maxAttempts = 3): Promise<boolean> => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`🔐 [Auth Callback] Verifying session (attempt ${attempt}/${maxAttempts})...`);
      setRetryAttempt(attempt);
      setStatusMessage(`Verifying session... (attempt ${attempt}/${maxAttempts})`);

      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error(`🔐 [Auth Callback] Session verification error (attempt ${attempt}):`, error);
      }

      if (session) {
        console.log('🔐 [Auth Callback] ✅ Session verified successfully:', {
          userId: session.user.id,
          email: session.user.email,
          expiresAt: session.expires_at
        });
        return true;
      }

      // Wait before next attempt (exponential backoff)
      if (attempt < maxAttempts) {
        const waitTime = attempt * 500; // 500ms, 1000ms, 1500ms
        console.log(`🔐 [Auth Callback] ⏳ No session found, waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    console.error('🔐 [Auth Callback] ❌ Session verification failed after all attempts');
    return false;
  };

  /**
   * Clear stale auth data if not in active auth flow
   */
  const clearStaleAuthData = () => {
    if (typeof window === 'undefined') return;

    const code = searchParams.get('code');

    // Only clear if NOT currently in an active auth flow
    if (!code) {
      console.log('🔐 [Auth Callback] Clearing stale auth data...');
      try {
        // Don't remove motion_auth_complete as it's used to track auth state
        const authComplete = localStorage.getItem('motion_auth_complete');
        localStorage.removeItem('supabase.auth.token');
        sessionStorage.clear();
        if (authComplete) {
          localStorage.setItem('motion_auth_complete', authComplete);
        }
        console.log('🔐 [Auth Callback] ✅ Stale data cleared');
      } catch (e) {
        console.warn('🔐 [Auth Callback] Failed to clear stale data:', e);
      }
    }
  };

  useEffect(() => {
    const handleAuthCallback = async () => {
      console.log('🔐 [Auth Callback] ═══════════════════════════════════');
      console.log('🔐 [Auth Callback] Starting auth callback processing');
      console.log('🔐 [Auth Callback] URL:', window.location.href);

      try {
        // Clear stale data first
        clearStaleAuthData();

        // If provider returned tokens in URL hash (implicit flow), clear them to avoid leaking
        if (typeof window !== 'undefined' && window.location.hash) {
          const hash = window.location.hash;
          if (/#(access_token|refresh_token|provider_token)/i.test(hash)) {
            console.log('🔐 [Auth Callback] Cleaning up URL hash...');
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
          }
        }

        const code = searchParams.get('code');
        const type = searchParams.get('type');

        console.log('🔐 [Auth Callback] Parameters:', {
          hasCode: !!code,
          type,
          codeLength: code?.length
        });

        // Handle case where user manually navigated here
        if (!code && !type) {
          console.log('🔐 [Auth Callback] No auth parameters found, redirecting to signin');
          router.push('/auth/signin');
          return;
        }

        if (code) {
          setStatusMessage('Exchanging code for session...');
          console.log('🔐 [Auth Callback] Exchanging code for session...');

          // Handle OAuth callback
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            console.error('🔐 [Auth Callback] ❌ Session exchange error:', {
              message: error.message,
              status: error.status,
              name: error.name
            });
            throw new Error(`Failed to exchange code: ${error.message}`);
          }

          console.log('🔐 [Auth Callback] ✅ Code exchange successful');

          if (data.session) {
            console.log('🔐 [Auth Callback] Session obtained:', {
              userId: data.session.user.id,
              email: data.session.user.email,
              provider: data.session.user.app_metadata.provider
            });

            setStatusMessage('Finalizing authentication...');

            // Verify session with retry logic
            const sessionVerified = await verifySessionWithRetry(3);

            if (!sessionVerified) {
              throw new Error('Your session couldn\'t be established. Please try signing in again.');
            }

            // Store a flag indicating auth is complete
            if (typeof window !== 'undefined') {
              localStorage.setItem('motion_auth_complete', Date.now().toString());
            }

            setStatusMessage('Setting up your profile...');

            // Check if user profile exists, create if not
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.session.user.id)
              .single();

            console.log('👤 [Auth Callback] Profile check:', {
              exists: !!profile,
              errorCode: profileError?.code
            });

            if (profileError && profileError.code === 'PGRST116') {
              // Profile doesn't exist, create it
              const userData = data.session.user;
              console.log('👤 [Auth Callback] Creating profile for:', userData.email);

              const { error: insertError } = await supabase.from('profiles').insert({
                id: userData.id,
                first_name: userData.user_metadata?.first_name || userData.user_metadata?.name?.split(' ')[0] || '',
                last_name: userData.user_metadata?.last_name || userData.user_metadata?.name?.split(' ').slice(1).join(' ') || '',
                display_name: userData.user_metadata?.name || userData.user_metadata?.full_name || '',
                profile_picture_url: userData.user_metadata?.avatar_url || userData.user_metadata?.picture,
                membership_tier: 'free',
                monthly_generations: 0,
                monthly_edits: 0,
                generations_limit: 10,
                edits_limit: 3,
                subscription_status: 'active',
                last_reset_date: new Date().toISOString(),
              });

              if (insertError) {
                console.error('👤 [Auth Callback] ❌ Profile creation error:', insertError);
              } else {
                console.log('👤 [Auth Callback] ✅ Profile created successfully');
              }
            }

            setStatusMessage('Redirecting to your dashboard...');
            console.log('🔐 [Auth Callback] Auth complete, redirecting...');

            // Final session verification before redirect
            const { data: finalSession } = await supabase.auth.getSession();
            console.log('🔐 [Auth Callback] Final session state:', {
              hasSession: !!finalSession.session,
              userId: finalSession.session?.user.id
            });

            // Extended delay to ensure cookies are fully propagated across domains
            console.log('🔐 [Auth Callback] ⏳ Waiting 1500ms for cookie propagation...');
            await new Promise(resolve => setTimeout(resolve, 1500));

            console.log('🔐 [Auth Callback] ✅ Redirecting to home page');
            // Use replace to prevent back button issues
            window.location.replace('/');
            return;
          } else {
            throw new Error('No session returned after code exchange');
          }
        }

        // Handle password reset
        if (type === 'recovery') {
          console.log('🔐 [Auth Callback] Handling password recovery');
          router.push('/auth/reset-password/confirm');
          return;
        }

        // Handle email confirmation
        if (type === 'signup') {
          console.log('🔐 [Auth Callback] Handling signup confirmation');
          router.push('/auth/signin?message=Check your email to continue sign in process');
          return;
        }

        // Handle password reset (alternative check)
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');

        if (accessToken && refreshToken && !type) {
          console.log('🔐 [Auth Callback] Handling token-based auth');
          try {
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (!error && data.session) {
              router.push('/auth/reset-password/confirm');
              return;
            }
          } catch (err) {
            console.error('🔐 [Auth Callback] Session set error:', err);
          }
        }

        // Default redirect if no specific type
        console.log('🔐 [Auth Callback] No specific type, redirecting to signin');
        router.push('/auth/signin');

      } catch (error) {
        const err = error as { message?: string; stack?: string };
        console.error('🔐 [Auth Callback] ❌ ERROR:', {
          message: err?.message,
          stack: err?.stack
        });
        console.log('🔐 [Auth Callback] ═══════════════════════════════════');

        setError(err?.message || 'Authentication failed. Your session couldn\'t be established.');
        setLoading(false);

        // Don't auto-redirect on error, let user choose to retry
      } finally {
        if (!error) {
          setLoading(false);
        }
      }
    };

    handleAuthCallback();
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Error Icon */}
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-3">Authentication Failed</h1>
          <p className="text-gray-600 mb-6">{error}</p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => {
                setError('');
                setLoading(true);
                window.location.href = '/auth/signin';
              }}
              className="w-full bg-[#3c7660] hover:bg-[#2a5444] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg"
            >
              Try Again
            </button>

            <a
              href="mailto:support@motionapp.com"
              className="block w-full border-2 border-gray-300 hover:border-[#3c7660] text-gray-700 font-semibold py-3 px-6 rounded-lg transition-all duration-200"
            >
              Contact Support
            </a>
          </div>

          {/* Debug info */}
          <div className="mt-6 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">
              If this problem persists, please contact support with error details above.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Animated Spinner */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-[#3c7660]"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-[#3c7660]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          {retryAttempt > 0 && retryAttempt <= 3
            ? `Verifying Session (${retryAttempt}/3)`
            : 'Processing Authentication'}
        </h1>

        <p className="text-gray-600 mb-6">{statusMessage}</p>

        {/* Progress Steps */}
        <div className="space-y-2 text-left">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm text-gray-600">Received authentication code</span>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                retryAttempt > 0
                  ? 'bg-green-500'
                  : 'bg-gray-200 animate-pulse'
              }`}
            >
              {retryAttempt > 0 ? (
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <div className="w-2 h-2 bg-gray-400 rounded-full" />
              )}
            </div>
            <span className="text-sm text-gray-600">Verifying your session</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
              <div className="w-2 h-2 bg-gray-400 rounded-full" />
            </div>
            <span className="text-sm text-gray-400">Setting up your dashboard</span>
          </div>
        </div>

        <div className="mt-6 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            ⏱️ This may take a few moments. Please don't close this page.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3c7660] mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Processing Authentication</h1>
          <p className="text-gray-600">Please wait while we complete your sign in...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
