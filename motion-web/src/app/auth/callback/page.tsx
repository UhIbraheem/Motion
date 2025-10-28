'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('Processing authentication...');

  // Create Supabase client instance for this component
  const supabase = createClient();

  useEffect(() => {
    const handleAuthCallback = async () => {
      console.log('🔐 [Auth Callback] Starting...');

      try {
        const code = searchParams.get('code');
        const error_code = searchParams.get('error');
        const error_description = searchParams.get('error_description');

        // Handle OAuth errors
        if (error_code) {
          console.error('🔐 [Auth Callback] OAuth error:', error_code, error_description);
          throw new Error(error_description || 'Authentication failed');
        }

        // Handle case where user manually navigated here
        if (!code) {
          console.log('🔐 [Auth Callback] No code found, redirecting to signin');
          router.replace('/auth/signin');
          return;
        }

        setStatusMessage('Verifying your sign-in...');
        console.log('🔐 [Auth Callback] Exchanging code for session...');

        // Exchange code for session - this sets the cookies automatically
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          console.error('🔐 [Auth Callback] Exchange error:', error);
          throw new Error(error.message || 'Failed to complete sign in');
        }

        if (!data.session) {
          throw new Error('No session returned. Please try signing in again.');
        }

        console.log('🔐 [Auth Callback] ✅ Session established for:', data.session.user.email);

        setStatusMessage('Setting up your profile...');

        // Check if user profile exists, create if not
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.session.user.id)
          .maybeSingle();

        if (!profile) {
          console.log('👤 [Auth Callback] Creating profile...');
          const userData = data.session.user;

          await supabase.from('profiles').insert({
            id: userData.id,
            first_name: userData.user_metadata?.given_name || userData.user_metadata?.name?.split(' ')[0] || '',
            last_name: userData.user_metadata?.family_name || userData.user_metadata?.name?.split(' ').slice(1).join(' ') || '',
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

          console.log('👤 [Auth Callback] ✅ Profile created');
        }

        setStatusMessage('Redirecting...');

        // Mark auth as complete for signin page
        localStorage.setItem('motion_auth_complete', Date.now().toString());

        console.log('🔐 [Auth Callback] ✅ Auth complete, redirecting to home');

        // Use router.replace for client-side navigation (doesn't trigger page reload)
        // This is faster and more reliable than window.location
        router.replace('/');

      } catch (error) {
        const err = error as { message?: string };
        console.error('🔐 [Auth Callback] ❌ Error:', err?.message);

        setError(err?.message || 'Authentication failed. Please try again.');
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [router, searchParams, supabase]);

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

        <h1 className="text-2xl font-bold text-gray-900 mb-3">Signing you in...</h1>

        <p className="text-gray-600 mb-6">{statusMessage}</p>

        <div className="mt-6 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            Please wait, this should only take a moment.
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
