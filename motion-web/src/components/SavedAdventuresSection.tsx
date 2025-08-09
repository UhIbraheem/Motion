'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { IoCalendar, IoTime, IoLocationSharp, IoStar, IoTrash, IoEye } from 'react-icons/io5';
import { useAuth } from '@/contexts/AuthContext';
import businessPhotosService from '@/services/BusinessPhotosService';
import adventureService from '@/services/AdventureService';

interface SavedAdventure {
  id: string;
  title: string;
  location: string;
  description: string;
  duration: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  steps: Array<{
    id: string;
    title: string;
    description: string;
    duration: string;
    location?: string;
    business_name?: string;
    step_order: number;
  }>;
  photos: Array<{
    id: string;
    url: string;
    source: 'google' | 'ai_generated' | 'user_uploaded';
    width?: number;
    height?: number;
  }>;
  created_at: string;
  user_id?: string;
  ai_generated: boolean;
  total_time?: string;
  estimated_cost?: string;
  rating?: number;
  review_count?: number;
}

export default function SavedAdventuresSection() {
  const { user } = useAuth();
  const [savedAdventures, setSavedAdventures] = useState<SavedAdventure[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Mock function until real Supabase integration is complete
  const getMockSavedAdventures = async (): Promise<SavedAdventure[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return [
      {
        id: '1',
        title: 'Downtown Seattle Food Tour',
        location: 'Seattle, WA',
        description: 'A culinary journey through Pike Place Market and surrounding neighborhoods, featuring local favorites and hidden gems.',
        duration: '4 hours',
        difficulty: 'Easy' as const,
        tags: ['Food', 'Walking', 'Local Culture'],
        steps: [
          {
            id: 'step1',
            title: 'Pike Place Market Breakfast',
            description: 'Start with fresh pastries and coffee',
            duration: '45 minutes',
            location: 'Pike Place Market, Seattle',
            business_name: 'Pike Place Market Bakery',
            step_order: 1
          },
          {
            id: 'step2',
            title: 'Waterfront Seafood',
            description: 'Fresh Pacific Northwest seafood with harbor views',
            duration: '90 minutes',
            location: 'Seattle Waterfront',
            business_name: 'Ivar\'s Acres of Clams',
            step_order: 2
          }
        ],
        photos: [],
        created_at: new Date(Date.now() - 86400000).toISOString(),
        user_id: user?.id,
        ai_generated: true,
        total_time: '4 hours',
        estimated_cost: '$60-80',
        rating: 4.5,
        review_count: 23
      },
      {
        id: '2',
        title: 'Capitol Hill Art Walk',
        location: 'Seattle, WA',
        description: 'Explore the vibrant art scene in Capitol Hill with galleries, street art, and creative spaces.',
        duration: '3 hours',
        difficulty: 'Medium' as const,
        tags: ['Art', 'Culture', 'Walking'],
        steps: [
          {
            id: 'step3',
            title: 'Gallery Hop',
            description: 'Visit local art galleries',
            duration: '2 hours',
            location: 'Capitol Hill, Seattle',
            business_name: 'Capitol Hill Art Walk',
            step_order: 1
          }
        ],
        photos: [],
        created_at: new Date(Date.now() - 172800000).toISOString(),
        user_id: user?.id,
        ai_generated: true,
        total_time: '3 hours',
        estimated_cost: '$20-40',
        rating: 4.2,
        review_count: 15
      }
    ];
  };

  useEffect(() => {
    if (user) {
      loadSavedAdventures();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadSavedAdventures = async () => {
    try {
      setLoading(true);
      // For now, use mock data until the real service method is implemented
      const adventures = await getMockSavedAdventures();
      
      // Enhance adventures with Google Places photos
      const enhancedAdventures = await Promise.all(
        adventures.map(async (adventure: SavedAdventure) => {
          if (adventure.steps && adventure.steps.length > 0 && adventure.photos.length === 0) {
            try {
              const googlePhotos = await businessPhotosService.getAdventurePhotos(
                adventure.steps.map((step: any) => ({
                  name: step.business_name || step.title,
                  location: step.location || adventure.location
                }))
              );
              
              return {
                ...adventure,
                photos: googlePhotos.map((photo, index) => ({
                  id: `google_${index}`,
                  url: photo.url,
                  source: photo.source,
                  width: photo.width,
                  height: photo.height
                }))
              };
            } catch (error) {
              console.error('Error enhancing adventure with photos:', error);
              return adventure;
            }
          }
          return adventure;
        })
      );
      
      setSavedAdventures(enhancedAdventures);
    } catch (error) {
      console.error('Error loading saved adventures:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (adventureId: string) => {
    if (!confirm('Are you sure you want to delete this adventure?')) return;
    
    try {
      setDeletingId(adventureId);
      // Mock delete for now - in real implementation, this would call adventureService.deleteAdventure(adventureId)
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      // Remove from local state
      setSavedAdventures(prev => prev.filter(adv => adv.id !== adventureId));
    } catch (error) {
      console.error('Error deleting adventure:', error);
      alert('Failed to delete adventure. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'Hard': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Saved Adventures</h2>
          <p className="text-gray-600 mb-8">Sign in to view your personalized adventure collection</p>
          <Link href="/auth/signin">
            <Button className="bg-[#3c7660] hover:bg-[#2a5444] text-white">
              Sign In to View Adventures
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3c7660] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your adventures...</p>
          </div>
        </div>
      </div>
    );
  }

  if (savedAdventures.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Saved Adventures</h2>
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <IoCalendar className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 mb-8">You haven't saved any adventures yet. Create your first adventure to get started!</p>
          <Link href="/curate">
            <Button className="bg-[#3c7660] hover:bg-[#2a5444] text-white">
              Create Your First Adventure
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Saved Adventures</h2>
          <p className="text-gray-600">
            {savedAdventures.length} adventure{savedAdventures.length === 1 ? '' : 's'} in your collection
          </p>
        </div>
        <Link href="/curate">
          <Button className="bg-[#3c7660] hover:bg-[#2a5444] text-white">
            Create New Adventure
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {savedAdventures.map((adventure) => (
          <Card key={adventure.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden bg-gradient-to-br from-white to-gray-50">
            <div className="relative">
              {/* Adventure Photo with Google Places integration */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={adventure.photos[0]?.url || '/api/placeholder/400/300'}
                  alt={adventure.title}
                  fill
                  unoptimized
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Glass overlay title */}
                <div className="absolute top-2 left-2 right-20">
                  <div className="backdrop-blur-md bg-black/25 border border-white/10 rounded-xl px-3 py-1.5 shadow-sm">
                    <h4 className="text-white text-xs font-semibold line-clamp-1">{adventure.title}</h4>
                  </div>
                </div>

                {/* Photo source/step label chip */}
                {adventure.photos[0]?.source === 'google' && (
                  <div className="absolute bottom-2 left-2">
                    <div className="px-2 py-1 backdrop-blur-md bg-white/25 border border-white/30 rounded-full text-[11px] text-white shadow-sm">
                      Google Places
                    </div>
                  </div>
                )}

                {/* Difficulty badge */}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(adventure.difficulty)}`}>
                    {adventure.difficulty}
                  </span>
                </div>

                {/* Delete button */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(adventure.id);
                  }}
                  disabled={deletingId === adventure.id}
                  className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-red-500/90 hover:bg-red-500 text-white p-0"
                >
                  {deletingId === adventure.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <IoTrash className="w-3 h-3" />
                  )}
                </Button>
              </div>

              {/* Adventure Details */}
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#3c7660] transition-colors line-clamp-2">
                  {adventure.title}
                </h3>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <IoTime className="w-4 h-4" />
                    {adventure.total_time || adventure.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <IoLocationSharp className="w-4 h-4" />
                    {adventure.location}
                  </div>
                </div>

                <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                  {adventure.description}
                </p>

                {/* Tags */}
                {adventure.tags && adventure.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {adventure.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-[#3c7660]/10 text-[#3c7660] text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                    {adventure.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                        +{adventure.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="flex justify-between items-center mb-4 text-sm">
                  <div className="flex items-center gap-1 text-gray-600">
                    <IoEye className="w-4 h-4" />
                    {adventure.steps.length} steps
                  </div>
                  {adventure.rating && (
                    <div className="flex items-center gap-1 text-yellow-600">
                      <IoStar className="w-4 h-4" />
                      {adventure.rating.toFixed(1)}
                    </div>
                  )}
                </div>

                {/* Created date */}
                <div className="text-xs text-gray-500 mb-4">
                  Created {new Date(adventure.created_at).toLocaleDateString()}
                </div>

                {/* Action Button */}
                <Link href={`/adventure/${adventure.id}`}>
                  <Button className="w-full bg-gradient-to-r from-[#3c7660] to-[#2a5444] hover:from-[#2a5444] hover:to-[#1e3c30] text-white group-hover:scale-105 transition-all duration-300">
                    View Adventure Details
                  </Button>
                </Link>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>

      {/* Load more button if there are many adventures */}
      {savedAdventures.length >= 12 && (
        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            className="border-[#3c7660] text-[#3c7660] hover:bg-[#3c7660] hover:text-white"
            onClick={loadSavedAdventures}
          >
            Load More Adventures
          </Button>
        </div>
      )}
    </div>
  );
}
