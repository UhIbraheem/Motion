"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import Navigation from '@/components/Navigation';
import EnhancedAdventureCard from '@/components/EnhancedAdventureCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  IoLocationOutline,
  IoTimeOutline,
  IoHeartOutline,
  IoHeart,
  IoStar,
  IoAdd,
  IoCalendar
} from 'react-icons/io5';

interface Adventure {
  id: string;
  custom_title: string;
  custom_description?: string;
  location?: string;
  duration_hours?: number;
  estimated_cost?: string;
  rating?: number;
  steps?: any[];
  shared_date: string;
  user_id: string;
  view_count?: number;
  save_count?: number;
  heart_count?: number;
  profiles?: {
    id: string;
    display_name?: string;
    first_name?: string;
    last_name?: string;
    profile_picture_url?: string;
  };
  adventure_photos?: Array<{
    photo_url: string;
    is_cover_photo: boolean;
  }>;
}

export default function DiscoverPage() {
  const { user, loading } = useAuth();
  const [adventures, setAdventures] = useState<Adventure[]>([]);
  const [adventuresLoading, setAdventuresLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      fetchAdventures();
    }
  }, [isHydrated, user]);

  const fetchAdventures = async () => {
    try {
      setAdventuresLoading(true);
      // For now, we'll show all public adventures
      // Later we can add user-specific filtering
      const response = await fetch('/api/adventures/public');
      
      if (!response.ok) {
        throw new Error('Failed to fetch adventures');
      }
      
      const data = await response.json();
      setAdventures(data.adventures || []);
    } catch (error) {
      console.error('Error fetching adventures:', error);
      setAdventures([]);
    } finally {
      setAdventuresLoading(false);
    }
  };

  const getBudgetDisplay = (cost?: string) => {
    if (!cost) return 'Budget not set';
    const map: Record<string, string> = {
      '$': 'Budget-friendly',
      '$$': 'Moderate',
      '$$$': 'Premium'
    };
    return map[cost] || cost;
  };

  // Show loading during hydration
  if (!isHydrated || loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <main className="pt-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3c7660] mx-auto mb-4"></div>
                <p className="text-gray-600">Loading...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <main className="pt-40 pb-8">
        {/* Page Title - Always visible */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Discover Local Adventures</h1>
            <p className="text-xl text-gray-600">Curated experiences shared by our community</p>
          </div>
        </div>

        {/* Create Adventure CTA (for non-users) */}
        {!user && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            <div className="bg-gradient-to-r from-[#3c7660] to-[#2d5a48] rounded-2xl p-8 text-center text-white">
              <h2 className="text-2xl font-bold mb-2">Ready for your next adventure?</h2>
              <p className="text-white/90 mb-6 max-w-md mx-auto">
                Let AI create a personalized experience tailored just for you
              </p>
              <Link href="/auth/signin">
                <Button 
                  size="lg"
                  className="bg-white hover:bg-gray-50 text-[#3c7660] font-semibold px-8 py-3 rounded-full shadow-lg"
                >
                  <IoAdd className="w-5 h-5 mr-2" />
                  Sign In to Create
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Stats Display (for logged-in users) */}
        {user && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-[#3c7660] to-[#2d5a48] rounded-2xl p-6 text-center text-white">
                <div className="text-3xl font-bold mb-1">12</div>
                <p className="text-white/90 text-sm">Adventures Saved</p>
              </div>
              <div className="bg-gradient-to-r from-[#f59e0b] to-[#d97706] rounded-2xl p-6 text-center text-white">
                <div className="text-3xl font-bold mb-1">8</div>
                <p className="text-white/90 text-sm">Adventures Completed</p>
              </div>
              <div className="bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] rounded-2xl p-6 text-center text-white">
                <div className="text-3xl font-bold mb-1">156</div>
                <p className="text-white/90 text-sm">Community Adventures</p>
              </div>
            </div>
          </div>
        )}

        {/* Adventures Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Adventures Loading */}
          {adventuresLoading && (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3c7660] mx-auto mb-4"></div>
                <p className="text-gray-600">Loading adventures...</p>
              </div>
            </div>
          )}

          {/* No Adventures Found */}
          {!adventuresLoading && adventures.length === 0 && (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <IoAdd className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Adventures Yet</h3>
                <p className="text-gray-600 mb-6">
                  New adventures posted by the community will show up here. 
                  {user ? ' Why not create the first one?' : ' Sign in to create and share your own adventures.'}
                </p>
                {user ? (
                  <Link href="/create">
                    <Button className="bg-[#3c7660] hover:bg-[#2d5a48] text-white px-6 py-2 rounded-full">
                      <IoAdd className="w-5 h-5 mr-2" />
                      Create Adventure
                    </Button>
                  </Link>
                ) : (
                  <Link href="/auth/signin">
                    <Button className="bg-[#3c7660] hover:bg-[#2d5a48] text-white px-6 py-2 rounded-full">
                      Sign In to Create
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Adventures Grid */}
          {!adventuresLoading && adventures.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {adventures.map((adventure) => (
                <EnhancedAdventureCard
                  key={adventure.id}
                  adventure={adventure}
                  user={user}
                  userLiked={false} // TODO: Implement like tracking
                  userSaved={false} // TODO: Implement save tracking
                  onLike={(adventureId) => {
                    console.log('Like adventure:', adventureId);
                    // TODO: Implement like functionality
                  }}
                  onSave={(adventureId) => {
                    console.log('Save adventure:', adventureId);
                    // TODO: Implement save functionality
                  }}
                  onClick={(adventure) => {
                    console.log('View adventure:', adventure.id);
                    // TODO: Implement adventure detail modal
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
