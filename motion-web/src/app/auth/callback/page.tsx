'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';

// Use shared SSR-compatible Supabase client
const supabase = createClient();

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Prevent duplicate execution
      if (hasRun) {
        console.log('🔐 Callback already processed, skipping...');
        return;
      }
      setHasRun(true);

      try {
        // If provider returned tokens in URL hash (implicit flow), clear them to avoid leaking
        if (typeof window !== 'undefined' && window.location.hash) {
          const hash = window.location.hash;
          if (/#(access_token|refresh_token|provider_token)/i.test(hash)) {
            // Replace state with same URL minus hash
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
          }
        }

        const code = searchParams.get('code');
        const type = searchParams.get('type');

        console.log('🔐 Auth callback - Code:', !!code, 'Type:', type);

        if (code) {
          // Handle OAuth callback with retry for code verifier issues
          let data, error;

          try {
            const result = await supabase.auth.exchangeCodeForSession(code);
            data = result.data;
            error = result.error;
          } catch (exchangeError: any) {
            console.error('🔐 Code exchange exception:', exchangeError);

            // If it's a code verifier error, try getting the existing session
            if (exchangeError.message?.includes('code') || exchangeError.message?.includes('verifier')) {
              console.log('🔐 Code verifier error detected, checking for existing session...');
              const { data: { session } } = await supabase.auth.getSession();

              if (session) {
                console.log('🔐 Found existing session, using it instead');
                data = { session, user: session.user };
                error = null;
              } else {
                throw exchangeError;
              }
            } else {
              throw exchangeError;
            }
          }

          if (error) {
            console.error('🔐 Session exchange error:', error);
            throw error;
          }

            console.log('🔐 Session exchange successful:', !!data.session);

            if (data.session) {
              // Store a flag indicating auth is complete
              if (typeof window !== 'undefined') {
                localStorage.setItem('motion_auth_complete', Date.now().toString());
              }

              // Check if user profile exists, create if not
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.session.user.id)
              .single();

            console.log('👤 Profile check:', { exists: !!profile, error: profileError?.code });

            if (profileError && profileError.code === 'PGRST116') {
              // Profile doesn't exist, create it
              const userData = data.session.user;
              console.log('👤 Creating profile for user:', userData.email);
              
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
                console.error('👤 Profile creation error:', insertError);
              } else {
                console.log('👤 Profile created successfully');
              }
            }

            console.log('🔐 Auth successful, redirecting to home page...');
            
            // Set localStorage flag to help signin page detect completed auth
            localStorage.setItem('motion_auth_complete', Date.now().toString());
            
            // Use router.replace for proper Next.js navigation with cookie handling
            router.replace('/');
            return;
          }
        }

        // Handle password reset
        if (type === 'recovery') {
          // The user clicked the reset password link
          router.push('/auth/reset-password/confirm');
          return;
        }

        // Handle email confirmation
        if (type === 'signup') {
          router.push('/auth/signin?message=Check your email to continue sign in process');
          return;
        }

        // Handle password reset (alternative check)
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        
        if (accessToken && refreshToken && !type) {
          // This might be a password reset link
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
            console.log('Session set error:', err);
          }
        }

        // Default redirect if no specific type
        router.push('/auth/signin');

      } catch (error) {
        const err = error as { message?: string };
        console.error('Auth callback error:', err);
        setError(err?.message || 'Authentication failed');
        // Redirect to signin with error after 3 seconds
        setTimeout(() => {
          router.push('/auth/signin?error=Authentication failed');
        }, 3000);
      } finally {
        setLoading(false);
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
