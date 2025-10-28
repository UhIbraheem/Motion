"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  IoMail,
  IoLockClosed,
  IoLogoGoogle,
  IoEye,
  IoEyeOff,
  IoArrowForward
} from "react-icons/io5";

export default function SignInPage() {
  const { signIn, signInWithGoogle, user, loading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showFallback, setShowFallback] = useState(false);

  // Show fallback UI if loading takes too long
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (loading) {
        setShowFallback(true);
      }
    }, 8000); // Increased to 8 seconds

    return () => clearTimeout(fallbackTimer);
  }, [loading]);

  // Redirect if already authenticated
  useEffect(() => {
    // Check if we just completed auth (within last 10 seconds)
    const authComplete = localStorage.getItem('motion_auth_complete');
    if (authComplete) {
      const timestamp = parseInt(authComplete);
      const now = Date.now();
      // If auth completed within last 10 seconds, redirect immediately
      if (now - timestamp < 10000) {
        console.log('🔐 Auth just completed, redirecting to home...');
        localStorage.removeItem('motion_auth_complete');
        router.replace('/');
        return;
      } else {
        // Clean up old flag
        localStorage.removeItem('motion_auth_complete');
      }
    }
    
    // Normal auth check with delay - redirect authenticated users to home
    const redirectTimeout = setTimeout(() => {
      if (!loading && user) {
        console.log('🔐 User already authenticated, redirecting to home...');
        router.replace('/');
      }
    }, 500);

    return () => clearTimeout(redirectTimeout);
  }, [user, loading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const result = await signIn({
        email: formData.email,
        password: formData.password,
      });
      
      if (result.success) {
        const stored = sessionStorage.getItem('redirectAfterLogin');
        let redirectTo = '/';
        if (stored) {
          try {
            const url = new URL(stored, window.location.origin);
            if (url.origin === window.location.origin) {
              redirectTo = url.pathname + url.search + url.hash;
            }
          } catch {}
        }
        sessionStorage.removeItem('redirectAfterLogin');
        router.push(redirectTo);
      } else {
        setError(result.error || "Sign in failed");
      }
    } catch (error: any) {
      console.error("Sign in error:", error);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');

    try {
      const result = await signInWithGoogle();
      if (!result.success) {
        setError(result.error || 'Failed to sign in with Google');
        setIsLoading(false);
      }
      // The redirect will handle the rest if successful
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      setError("Failed to sign in with Google");
      setIsLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (loading && !showFallback) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3c7660] mx-auto mb-4"></div>
          <p className="text-[#3c7660]">Loading...</p>
        </div>
      </div>
    );
  }

  // Show fallback if loading takes too long
  if (loading && showFallback) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3c7660] mx-auto mb-4"></div>
          <p className="text-[#3c7660] mb-4">Taking longer than expected...</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-[#3c7660] text-white px-4 py-2 rounded-lg hover:bg-[#2d5a48] transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#1a3d32] to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-72 h-72 bg-[#3c7660] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-40 w-72 h-72 bg-[#4d987b] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KPGcgZmlsbD0iIzNjNzY2MCIgZmlsbC1vcGFjaXR5PSIwLjA1Ij4KPGNpcmNsZSBjeD0iMjkiIGN5PSIyOSIgcj0iMSIvPgo8L2c+CjwvZz4KPHN2Zz4=')] opacity-30"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo and Welcome */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-sm rounded-full shadow-2xl mb-6 border border-white/20">
              <Image
                src="/logo-swirl.svg"
                alt="Motion"
                width={56}
                height={56}
                className="text-white"
                unoptimized
              />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">Welcome back</h1>
            <p className="text-white/80 text-lg">Continue your adventure with Motion</p>
          </div>

          {/* Sign In Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl mb-6 text-sm backdrop-blur-sm">
                {error}
              </div>
            )}

            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full border-2 border-white/20 hover:border-white/40 bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 mb-6 backdrop-blur-sm"
            >
              <IoLogoGoogle className="w-5 h-5 text-red-400" />
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-slate-900/50 text-white/70 backdrop-blur-sm">or continue with email</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSignIn} className="space-y-5">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <IoMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-white/20 bg-white/10 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-[#3c7660] focus:border-transparent transition-all duration-200 text-white placeholder-white/60"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">
                  Password
                </label>
                <div className="relative">
                  <IoLockClosed className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 border border-white/20 bg-white/10 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-[#3c7660] focus:border-transparent transition-all duration-200 text-white placeholder-white/60"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
                  >
                    {showPassword ? <IoEyeOff className="w-5 h-5" /> : <IoEye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <Link 
                  href="/auth/forgot-password" 
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#3c7660] to-teal-600 hover:from-[#2d5a48] hover:to-teal-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <span>Sign In</span>
                    <IoArrowForward className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <span className="text-white/70 text-sm">Don't have an account? </span>
              <Link 
                href="/auth/signup" 
                className="text-white hover:text-white/80 font-medium text-sm transition-colors"
              >
                Sign up
              </Link>
              <div className="mt-4 flex items-center justify-center gap-4 text-xs text-white/60">
                <Link href="/legal/privacy" className="hover:text-white/80">Privacy</Link>
                <span>•</span>
                <Link href="/legal/terms" className="hover:text-white/80">Terms</Link>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mt-8 text-center">
            <p className="text-white/60 text-sm mb-4">Join thousands discovering local adventures</p>
            <div className="flex justify-center space-x-6 text-xs text-white/70">
              <span>✨ AI-powered planning</span>
              <span>🗺️ Local discoveries</span>
              <span>❤️ Community-driven</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
