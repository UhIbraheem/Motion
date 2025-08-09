'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import CalendarView from '@/components/CalendarView';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  IoLocationOutline,
  IoTimeOutline,
  IoHeartOutline,
  IoHeart,
  IoStar,
  IoCalendarOutline,
  IoCheckmarkCircle,
  IoAdd,
  IoEllipsisHorizontal,
  IoGridOutline,
  IoListOutline,
  IoCreateOutline,
  IoTime,
  IoLocationSharp,
  IoTrash,
  IoEye
} from 'react-icons/io5';
import Link from 'next/link';
import Image from 'next/image';
import businessPhotosService from '@/services/BusinessPhotosService';
import AdventureService from '@/services/AdventureService';
import EnhancedAdventureCard from '@/components/EnhancedAdventureCard';

// Mock calendar events data
const mockCalendarEvents = [
  {
    id: "cal-1",
    title: "Wine Country Day Trip",
    date: new Date(2025, 7, 25), // August 25, 2025
    startTime: "9:00 AM",
    endTime: "6:00 PM",
    location: "Napa Valley, CA",
    type: 'adventure' as const,
    status: 'planned' as const,
    color: '#3c7660'
  },
  {
    id: "cal-2", 
    title: "Mission District Food Tour",
    date: new Date(2025, 7, 28), // August 28, 2025
    startTime: "11:00 AM",
    endTime: "3:00 PM",
    location: "Mission District, SF",
    type: 'scheduled' as const,
    status: 'planned' as const,
    color: '#3c7660'
  },
  {
    id: "cal-3",
    title: "Golden Gate Sunrise Hike",
    date: new Date(2025, 7, 15), // August 15, 2025
    startTime: "6:00 AM", 
    endTime: "9:00 AM",
    location: "Golden Gate Park",
    type: 'adventure' as const,
    status: 'completed' as const,
    color: '#3c7660'
  }
];

// Enhanced adventure interface
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
    url: string;
    width?: number;
    height?: number;
    source: 'google' | 'ai_generated' | 'user_uploaded';
    photo_reference?: string;
  }>;
  created_at: string;
  scheduled_for?: string;
  is_completed: boolean;
  rating?: number;
  total_time?: string;
}

export default function PlansPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [viewMode, setViewMode] = useState<'grid' | 'calendar' | 'list'>('grid');
  const [savedAdventures, setSavedAdventures] = useState<SavedAdventure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load adventures
  useEffect(() => {
    if (user) {
      loadAdventures();
    }
  }, [user]);

  const loadAdventures = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Get saved adventures from Supabase
      const savedAdventures = await AdventureService.getUserSavedAdventures(user.id);

      // Process adventures for display
      const processedAdventures = savedAdventures.map((adventure) => {
        return {
          id: adventure.id,
          title: adventure.custom_title || 'Untitled Adventure',
          location: adventure.location || 'Location TBD',
          description: adventure.custom_description || adventure.description || 'No description available',
          duration: adventure.duration_hours ? `${adventure.duration_hours}h` : '2-4 hours',
          difficulty: 'Medium' as const,
          tags: [],
          steps: (adventure.adventure_steps || []).map(step => ({
            id: step.id,
            title: step.title,
            description: step.description,
            duration: `${step.estimated_duration_minutes || 60} min`,
            location: step.location,
            business_name: step.business_info?.name,
            step_order: step.step_number
          })),
          photos: adventure.adventure_photos?.map(photo => ({
            url: photo.photo_url,
            source: 'user_uploaded' as const
          })) || [{ url: '/api/placeholder/400/300', source: 'ai_generated' as const }],
          created_at: adventure.saved_at,
          scheduled_for: adventure.scheduled_for,
          is_completed: false,
          rating: adventure.rating,
          total_time: adventure.duration_hours ? `${adventure.duration_hours}h` : undefined
        };
      });

      setSavedAdventures(processedAdventures);
    } catch (err) {
      console.error('Error loading adventures:', err);
      setError('Failed to load adventures. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (adventureId: string) => {
    if (!user) return;
    
    try {
      await AdventureService.unsaveAdventure(user.id, adventureId);
      setSavedAdventures(prev => prev.filter(adv => adv.id !== adventureId));
    } catch (err) {
      console.error('Error unsaving adventure:', err);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <Navigation />
        <main className="pt-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Please sign in to view your plans</h1>
            <p className="text-gray-600 mb-8">Access your saved adventures and planned experiences</p>
            <Link href="/auth/signin">
              <Button className="bg-[#3c7660] hover:bg-[#2a5444] text-white">
                Sign In
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <Navigation />
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3c7660]"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <Navigation />
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-16">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={loadAdventures} className="bg-[#3c7660] hover:bg-[#2a5444] text-white">
                Try Again
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Navigation />
      
      <main className="pt-16">
        <div className="w-[80%] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Plans</h1>
              <p className="text-gray-600 mt-2">Manage your adventures and experiences</p>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-[#3c7660] text-white' : ''}
              >
                <IoGridOutline className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('calendar')}
                className={viewMode === 'calendar' ? 'bg-[#3c7660] text-white' : ''}
              >
                <IoCalendarOutline className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-[#3c7660] text-white' : ''}
              >
                <IoListOutline className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Calendar View */}
          {viewMode === 'calendar' && (
            <div className="mb-8">
              <CalendarView events={mockCalendarEvents} />
            </div>
          )}

          {/* Tabs and Content */}
          {viewMode !== 'calendar' && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
                <TabsTrigger value="upcoming" className="data-[state=active]:bg-[#3c7660] data-[state=active]:text-white">
                  Upcoming
                </TabsTrigger>
                <TabsTrigger value="saved" className="data-[state=active]:bg-[#3c7660] data-[state=active]:text-white">
                  Saved
                </TabsTrigger>
                <TabsTrigger value="completed" className="data-[state=active]:bg-[#3c7660] data-[state=active]:text-white">
                  Completed
                </TabsTrigger>
              </TabsList>

              {/* Upcoming Tab */}
              <TabsContent value="upcoming" className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {savedAdventures.filter(adv => !adv.is_completed && (adv.scheduled_for || !adv.is_completed)).map((adventure) => (
                    <Card key={adventure.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden bg-gradient-to-br from-white to-yellow-50">
                      <div className="relative">
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <Image
                            src={adventure.photos[0]?.url || '/api/placeholder/400/300'}
                            alt={adventure.title}
                            fill
                            unoptimized
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2 left-2">
                            <Badge className="bg-yellow-500 text-white">Upcoming</Badge>
                          </div>
                        </div>
                        <CardContent className="p-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{adventure.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                            <IoTime className="w-4 h-4" />
                            {adventure.total_time || adventure.duration}
                          </div>
                          <p className="text-gray-700 text-sm mb-4 line-clamp-3">{adventure.description}</p>
                          <Link href={`/adventure/${adventure.id}`}>
                            <Button className="w-full bg-gradient-to-r from-yellow-500 to-yellow-700 text-white">
                              View Details
                            </Button>
                          </Link>
                        </CardContent>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Saved Tab */}
              <TabsContent value="saved" className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {savedAdventures.filter(adv => !adv.is_completed && !adv.scheduled_for).map((adventure) => (
                    <Card key={adventure.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden bg-gradient-to-br from-white to-gray-50">
                      <div className="relative">
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <Image
                            src={adventure.photos[0]?.url || '/api/placeholder/400/300'}
                            alt={adventure.title}
                            fill
                            unoptimized
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2 left-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(adventure.difficulty)}`}>
                              {adventure.difficulty}
                            </span>
                          </div>
                          <div className="absolute top-2 right-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUnsave(adventure.id)}
                              className="w-8 h-8 p-0 bg-white/80 hover:bg-white text-red-500 hover:text-red-700"
                            >
                              <IoHeartOutline className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <CardContent className="p-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{adventure.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-1">
                              <IoTime className="w-4 h-4" />
                              {adventure.total_time || adventure.duration}
                            </div>
                            <div className="flex items-center gap-1">
                              <IoLocationOutline className="w-4 h-4" />
                              {adventure.location}
                            </div>
                          </div>
                          <p className="text-gray-700 text-sm mb-4 line-clamp-3">{adventure.description}</p>
                          
                          {adventure.tags && adventure.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-4">
                              {adventure.tags.slice(0, 3).map((tag: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {adventure.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{adventure.tags.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                            <span className="flex items-center gap-1">
                              <IoEye className="w-4 h-4" />
                              {adventure.steps.length} steps
                            </span>
                            {adventure.rating && (
                              <div className="flex items-center gap-1">
                                <IoStar className="w-4 h-4 text-yellow-500" />
                                {adventure.rating.toFixed(1)}
                              </div>
                            )}
                          </div>
                          
                          <div className="text-xs text-gray-400 mb-4">
                            Created {new Date(adventure.created_at).toLocaleDateString()}
                          </div>
                          
                          <Link href={`/adventure/${adventure.id}`}>
                            <Button className="w-full bg-gradient-to-r from-[#3c7660] to-[#2a5444] text-white">
                              View Adventure
                            </Button>
                          </Link>
                        </CardContent>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Completed Tab */}
              <TabsContent value="completed" className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {savedAdventures.filter(adv => adv.is_completed).map((adventure) => (
                    <Card key={adventure.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden bg-gradient-to-br from-white to-green-50">
                      <div className="relative">
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <Image
                            src={adventure.photos[0]?.url || '/api/placeholder/400/300'}
                            alt={adventure.title}
                            fill
                            unoptimized
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2 left-2">
                            <Badge className="bg-green-500 text-white">Completed</Badge>
                          </div>
                          {adventure.rating && (
                            <div className="absolute top-2 right-2 bg-white/90 rounded px-2 py-1">
                              <div className="flex items-center gap-1">
                                <IoStar className="w-3 h-3 text-yellow-500" />
                                <span className="text-xs font-medium">{adventure.rating}</span>
                              </div>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{adventure.title}</h3>
                          <p className="text-gray-700 text-sm mb-4 line-clamp-3">{adventure.description}</p>
                          <Link href={`/adventure/${adventure.id}`}>
                            <Button className="w-full bg-gradient-to-r from-green-500 to-green-700 text-white">
                              View Memories
                            </Button>
                          </Link>
                        </CardContent>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}

          {/* Empty States */}
          {savedAdventures.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-[#3c7660] text-white">
                    <IoCreateOutline className="w-6 h-6" />
                  </AvatarFallback>
                </Avatar>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Adventures Yet</h3>
              <p className="text-gray-600 mb-8">Start creating your perfect adventures</p>
              <Link href="/create">
                <Button className="bg-[#3c7660] hover:bg-[#2a5444] text-white">
                  <IoAdd className="w-4 h-4 mr-2" />
                  Create Adventure
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
