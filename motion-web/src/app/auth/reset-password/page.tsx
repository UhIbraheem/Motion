'use client';

import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import Image from 'next/image';
import { IoArrowBack, IoMail, IoCheckmarkCircle } from 'react-icons/io5';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Use explicit localhost URL for development
      const redirectUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3000/auth/callback?type=recovery'
        : `${window.location.origin}/auth/callback?type=recovery`;
      
      console.log('Sending reset email with redirect URL:', redirectUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) throw error;

      setSuccess(true);
    } catch (error: any) {
      console.error('Reset password error:', error);
      setError(error.message || 'An error occurred while sending the reset email');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-sage-50 via-white to-gold-50 p-4">
        <Card className="w-full max-w-md bg-white/90 backdrop-blur-lg shadow-2xl border-0 ring-1 ring-white/20">
          <CardHeader className="text-center pb-8 pt-8">
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-gold to-gold/80 backdrop-blur-sm flex items-center justify-center shadow-xl">
                <IoCheckmarkCircle className="w-14 h-14 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-sage-dark to-sage bg-clip-text text-transparent mb-4">
              Check Your Email
            </CardTitle>
            <p className="text-sage/80 text-lg leading-relaxed">
              We've sent password reset instructions to
            </p>
            <p className="text-sage-dark font-semibold text-lg">
              {email}
            </p>
          </CardHeader>
          
          <CardContent className="px-8 pb-8 space-y-8">
            <div className="text-center p-6 bg-gradient-to-r from-sage/10 to-gold/10 backdrop-blur-sm rounded-2xl border border-sage/20">
              <p className="text-sage font-semibold text-base mb-3">
                📧 Check your inbox and click the reset link to continue
              </p>
              <p className="text-sage/70 text-sm mb-2">
                The link should take you back to Motion (localhost:3000)
              </p>
              <p className="text-sage/60 text-xs">
                If it goes to the wrong page, check your Supabase dashboard settings
              </p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full h-12 border-2 border-sage text-sage hover:bg-sage hover:text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-[1.02]"
              >
                Send Another Email
              </Button>

              <Link href="/auth/signin">
                <Button variant="ghost" className="w-full h-12 text-sage/80 hover:text-sage hover:bg-sage/10 font-semibold rounded-2xl transition-all duration-200 group">
                  <IoArrowBack className="w-5 h-5 mr-2 transition-transform duration-200 group-hover:-translate-x-1" />
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-sage-50 via-white to-gold-50 p-4">
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-lg shadow-2xl border-0 ring-1 ring-white/20">
        <CardHeader className="text-center pb-8 pt-8">
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-sage to-sage-light backdrop-blur-sm flex items-center justify-center shadow-xl">
              <Image
                src="/logo-swirl.png"
                alt="Motion Logo"
                width={56}
                height={56}
                className="object-contain filter brightness-0 invert"
              />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-sage-dark to-sage bg-clip-text text-transparent mb-4">
            Reset Your Password
          </CardTitle>
          <p className="text-sage/80 text-lg leading-relaxed">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </CardHeader>
        
        <CardContent className="px-8 pb-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-2xl">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-8">
            <div className="space-y-3">
              <label htmlFor="email" className="text-sm font-semibold text-sage-dark tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <IoMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-sage/50 w-5 h-5" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="pl-12 h-14 bg-white/70 backdrop-blur-sm border-sage/20 focus:border-sage focus:ring-sage/20 rounded-2xl text-sage-dark placeholder:text-sage/50 font-medium"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-gradient-to-r from-sage to-sage-light hover:from-sage-dark hover:to-sage text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Sending Reset Link...
                </div>
              ) : (
                'Send Reset Link'
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <Link
              href="/auth/signin"
              className="inline-flex items-center text-sage hover:text-sage-dark font-semibold transition-colors duration-200 group"
            >
              <IoArrowBack className="w-5 h-5 mr-2 transition-transform duration-200 group-hover:-translate-x-1" />
              Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
