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
  const [error, setError] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const code = searchParams.get('code');
        const type = searchParams.get('type');
        const error_description = searchParams.get('error_description');

        console.log('🔐 Auth callback - Code:', !!code, 'Type:', type);

        // Handle error from auth provider
        if (error_description) {
          console.error('🔐 Auth provider error:', error_description);
          throw new Error(error_description);
        }

        if (code) {
          // Handle OAuth callback with retry logic for PKCE issues
          let retries = 0;
          let sessionData = null;

          while (retries < 3 && !sessionData) {
            try {
              const { data, error } = await supabase.auth.exchangeCodeForSession(code);

              if (error) {
                // If it's a PKCE verifier error, clear storage and try once more
                if (error.message?.includes('code verifier') && retries === 0) {
                  console.log('🔐 PKCE error detected, clearing storage and retrying...');
                  localStorage.clear();
                  sessionStorage.clear();
                  retries++;
                  continue;
                }
                console.error('🔐 Session exchange error:', error);
                throw error;
              }

              sessionData = data;
              break;
            } catch (err) {
              retries++;
              if (retries >= 3) throw err;
              await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
            }
          }

          const { data } = { data: sessionData };

          if (!data?.session) {
            throw new Error('No session returned from authentication');
          }

          console.log('🔐 [Auth Callback] Exchange successful');

          if (data.session) {
            // Check if user profile exists, create if not
            console.log('🔐 [Auth Callback] Checking for existing session...');
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.session.user.id)
              .single();

            if (profileError && profileError.code === 'PGRST116') {
              // Profile doesn't exist, create it
              const userData = data.session.user;
              console.log('👤 [Auth Callback] Creating profile...');

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
                console.error('👤 [Auth Callback] Profile creation error:', insertError);
              }
            }

            console.log('🔐 Auth successful, waiting for session to stabilize...');

            // Set localStorage flag to help signin page detect completed auth
            localStorage.setItem('motion_auth_complete', Date.now().toString());

            // Wait a moment for the session to fully propagate and auth state to update
            // This prevents the race condition where we redirect before AuthContext picks up the new session
            await new Promise(resolve => setTimeout(resolve, 500));

            // Verify session is still valid before redirecting
            const { data: { session: verifySession } } = await supabase.auth.getSession();

            if (verifySession) {
              console.log('🔐 Session verified, redirecting to home page...');
              // Use router.replace for proper Next.js navigation with cookie handling
              router.replace('/');
            } else {
              console.warn('🔐 Session verification failed, redirecting to signin');
              router.replace('/auth/signin?error=Session expired');
            }
            return;
          }
        }

        // Handle password reset
        if (type === 'recovery') {
          router.push('/auth/reset-password/confirm');
          return;
        }

        // Handle email confirmation
        if (type === 'signup') {
          router.push('/auth/signin?message=Check your email to continue sign in process');
          return;
        }

        // Default redirect if no specific type
        router.push('/auth/signin');

      } catch (error) {
        const err = error as { message?: string };
        console.error('❌ [Auth Callback] Error:', err);
        setError(err?.message || 'Authentication failed');
        setTimeout(() => {
          router.push('/auth/signin?error=Authentication failed');
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3c7660] mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Processing Authentication</h1>
        <p className="text-gray-600">Please wait while we complete your sign in...</p>
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
