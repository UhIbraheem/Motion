"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Authenticated users go to discover
        router.replace('/discover');
      }
      // Unauthenticated users stay on this landing page
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3c7660] mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading Motion...</h1>
          <p className="text-gray-600">Getting your adventures ready...</p>
        </div>
      </div>
    );
  }

  // Show landing page for unauthenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo */}
          <div className="mb-8">
            <div className="w-16 h-16 bg-[#3c7660] rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">M</span>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Motion
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Your mindful companion for exploring what's around you
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-[#f2cc6c] rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-xl">🤖</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI-Powered Adventures</h3>
              <p className="text-gray-600 text-sm">
                Get personalized local experiences tailored to your mood and preferences
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-[#4d987b] rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-xl">📍</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Local Discovery</h3>
              <p className="text-gray-600 text-sm">
                Explore hidden gems and popular spots in your neighborhood
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-[#f8f2d5] rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-[#3c7660] text-xl">✨</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Mindful Exploration</h3>
              <p className="text-gray-600 text-sm">
                Go with the flow and discover experiences that match your vibe
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-4">
            <Link href="/auth/signin">
              <Button 
                size="lg" 
                className="bg-[#3c7660] hover:bg-[#2d5a48] text-white px-8 py-3 text-lg"
              >
                Start Your Adventure
              </Button>
            </Link>
            <p className="text-sm text-gray-500">
              Sign in with Google to begin exploring
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
