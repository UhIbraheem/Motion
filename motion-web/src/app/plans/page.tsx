'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  IoLocationOutline,
  IoTimeOutline,
  IoHeartOutline,
  IoHeart,
  IoStar,
  IoCalendarOutline,
  IoCheckmarkCircle,
  IoAdd,
  IoEllipsisHorizontal
} from 'react-icons/io5';
import Link from 'next/link';
import Image from 'next/image';

// Mock data for user's plans
const mockSavedPlans = [
  {
    id: "1",
    custom_title: "Hidden Rooftop Gardens Tour",
    location: "Downtown San Francisco",
    duration_hours: 3,
    estimated_cost: "$$",
    rating: 4.8,
    saved_at: "2024-01-20",
    user_saved: true,
    profiles: {
      first_name: "Sarah",
      last_name: "Chen"
    },
    adventure_photos: [
      { photo_url: "/api/placeholder/400/300", is_cover_photo: true }
    ],
    saves_count: 89,
    likes_count: 156
  }
];

const mockGeneratedPlans = [
  {
    id: "gen-1",
    title: "Mission District Food Adventure",
    description: "AI-generated food tour through San Francisco's Mission District",
    location: "Mission District, SF",
    duration_hours: 4,
    estimated_cost: "$$",
    created_at: "2024-01-18",
    is_favorite: false,
    steps: [
      {
        time: "10:00",
        title: "Artisanal Coffee Start",
        location: "Blue Bottle Coffee"
      },
      {
        time: "11:30",
        title: "Mission Murals Walk",
        location: "24th Street"
      },
      {
        time: "13:00",
        title: "Authentic Tacos",
        location: "La Taqueria"
      }
    ]
  }
];

const mockScheduledPlans = [
  {
    id: "sched-1",
    title: "Wine Country Day Trip",
    description: "Napa Valley wine tasting experience",
    location: "Napa Valley, CA",
    duration_hours: 8,
    estimated_cost: "$$$",
    scheduled_date: "2024-01-25",
    is_favorite: true,
    steps: [
      {
        time: "09:00",
        title: "Departure to Napa",
        location: "San Francisco"
      },
      {
        time: "11:00",
        title: "First Winery Visit",
        location: "Castello di Amorosa"
      }
    ]
  }
];

const mockCompletedPlans = [
  {
    id: "comp-1",
    title: "Golden Gate Park Exploration",
    description: "Peaceful day exploring SF's green spaces",
    location: "Golden Gate Park, SF",
    duration_hours: 5,
    estimated_cost: "$",
    completed_date: "2024-01-15",
    rating: 5,
    is_shared: true,
    steps: [
      {
        time: "10:00",
        title: "Japanese Tea Garden",
        location: "Golden Gate Park",
        completed: true
      },
      {
        time: "12:00",
        title: "De Young Museum",
        location: "Golden Gate Park",
        completed: true
      }
    ]
  }
];

export default function PlansPage() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('saved');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until mounted
  if (!mounted) {
    return null;
  }

  const getBudgetDisplay = (cost: string) => {
    const map: Record<string, string> = {
      '$': 'Budget-friendly',
      '$$': 'Moderate',
      '$$$': 'Premium'
    };
    return map[cost] || cost;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => {
      const filled = index < Math.floor(rating);
      return (
        <IoStar 
          key={index} 
          className={`w-3 h-3 ${filled ? 'text-yellow-400' : 'text-gray-300'}`} 
        />
      );
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {user ? 'My Adventure Plans' : 'Adventure Plans Preview'}
              </h1>
              <p className="text-gray-600">
                {user 
                  ? 'Manage your saved, created, and completed adventures'
                  : 'Sign in to save adventures and create your own plans'
                }
              </p>
            </div>
            {user ? (
              <Link href="/create">
                <Button 
                  className="bg-[#3c7660] hover:bg-[#2d5a48] text-white px-6 py-2 rounded-full font-medium"
                >
                  <IoAdd className="w-4 h-4 mr-2" />
                  Create New
                </Button>
              </Link>
            ) : (
              <Button 
                onClick={() => window.location.href = '/auth/signin'}
                className="bg-[#3c7660] hover:bg-[#2d5a48] text-white px-6 py-2 rounded-full font-medium"
              >
                <IoAdd className="w-4 h-4 mr-2" />
                Sign In to Create
              </Button>
            )}
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-100 rounded-full p-1 mb-8">
              <TabsTrigger 
                value="saved" 
                className="rounded-full data-[state=active]:bg-white data-[state=active]:text-[#3c7660] data-[state=active]:shadow-sm"
              >
                Saved ({mockSavedPlans.length})
              </TabsTrigger>
              <TabsTrigger 
                value="generated"
                className="rounded-full data-[state=active]:bg-white data-[state=active]:text-[#3c7660] data-[state=active]:shadow-sm"
              >
                Generated ({mockGeneratedPlans.length})
              </TabsTrigger>
              <TabsTrigger 
                value="scheduled"
                className="rounded-full data-[state=active]:bg-white data-[state=active]:text-[#3c7660] data-[state=active]:shadow-sm"
              >
                Scheduled ({mockScheduledPlans.length})
              </TabsTrigger>
              <TabsTrigger 
                value="completed"
                className="rounded-full data-[state=active]:bg-white data-[state=active]:text-[#3c7660] data-[state=active]:shadow-sm"
              >
                Completed ({mockCompletedPlans.length})
              </TabsTrigger>
            </TabsList>

            {/* Saved Adventures */}
            <TabsContent value="saved" className="space-y-6">
              {mockSavedPlans.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <IoHeartOutline className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No saved adventures yet</h3>
                  <p className="text-gray-600 mb-6">Start exploring and save adventures you'd like to try</p>
                  <Link href="/">
                    <Button variant="outline" className="rounded-full">
                      Browse Adventures
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {mockSavedPlans.map((plan) => (
                    <Card key={plan.id} className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer">
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <Image
                          src={plan.adventure_photos[0]?.photo_url || '/api/placeholder/400/300'}
                          alt={plan.custom_title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 right-3 bg-white/90 rounded-full px-2 py-1 flex items-center gap-1">
                          <IoStar className="w-3 h-3 text-yellow-400" />
                          <span className="text-xs font-medium text-gray-900">{plan.rating}</span>
                        </div>
                        <Badge className="absolute top-3 left-3 bg-blue-500 text-white">
                          Saved
                        </Badge>
                      </div>
                      
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                          {plan.custom_title}
                        </h3>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                          <IoLocationOutline className="w-3 h-3" />
                          <span>{plan.location}</span>
                          <span>•</span>
                          <IoTimeOutline className="w-3 h-3" />
                          <span>{plan.duration_hours}h</span>
                        </div>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-5 h-5">
                              <AvatarFallback className="bg-[#3c7660] text-white text-xs">
                                {plan.profiles.first_name?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-gray-600">
                              by {plan.profiles.first_name} {plan.profiles.last_name}
                            </span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {getBudgetDisplay(plan.estimated_cost)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Saved {formatDate(plan.saved_at)}</span>
                          <div className="flex items-center gap-1">
                            <span>{plan.saves_count} saves</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Generated Adventures */}
            <TabsContent value="generated" className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {mockGeneratedPlans.map((plan) => (
                  <Card key={plan.id} className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-gray-900 line-clamp-2">
                          {plan.title}
                        </h3>
                        <Button size="sm" variant="ghost" className="p-1">
                          <IoEllipsisHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {plan.description}
                      </p>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                        <IoLocationOutline className="w-3 h-3" />
                        <span>{plan.location}</span>
                        <span>•</span>
                        <IoTimeOutline className="w-3 h-3" />
                        <span>{plan.duration_hours}h</span>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        {plan.steps.slice(0, 2).map((step, index) => (
                          <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
                            <span className="w-6 text-center font-medium">{step.time}</span>
                            <span>{step.title}</span>
                          </div>
                        ))}
                        {plan.steps.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{plan.steps.length - 2} more steps
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {getBudgetDisplay(plan.estimated_cost)}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Created {formatDate(plan.created_at)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Scheduled Adventures */}
            <TabsContent value="scheduled" className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {mockScheduledPlans.map((plan) => (
                  <Card key={plan.id} className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-gray-900 line-clamp-2">
                          {plan.title}
                        </h3>
                        <div className="flex items-center gap-1">
                          {plan.is_favorite && (
                            <IoHeart className="w-4 h-4 text-red-500" />
                          )}
                          <Button size="sm" variant="ghost" className="p-1">
                            <IoEllipsisHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 bg-[#3c7660]/10 rounded-lg p-3 mb-4">
                        <IoCalendarOutline className="w-4 h-4 text-[#3c7660]" />
                        <span className="text-sm font-medium text-[#3c7660]">
                          Scheduled for {formatDate(plan.scheduled_date)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {plan.description}
                      </p>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                        <IoLocationOutline className="w-3 h-3" />
                        <span>{plan.location}</span>
                        <span>•</span>
                        <IoTimeOutline className="w-3 h-3" />
                        <span>{plan.duration_hours}h</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {getBudgetDisplay(plan.estimated_cost)}
                        </Badge>
                        <Button size="sm" variant="outline" className="text-xs">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Completed Adventures */}
            <TabsContent value="completed" className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {mockCompletedPlans.map((plan) => (
                  <Card key={plan.id} className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-gray-900 line-clamp-2">
                          {plan.title}
                        </h3>
                        <div className="flex items-center gap-1">
                          <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
                          <Button size="sm" variant="ghost" className="p-1">
                            <IoEllipsisHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {plan.description}
                      </p>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                        <IoLocationOutline className="w-3 h-3" />
                        <span>{plan.location}</span>
                        <span>•</span>
                        <IoTimeOutline className="w-3 h-3" />
                        <span>{plan.duration_hours}h</span>
                      </div>
                      
                      {plan.rating && (
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-sm text-gray-600">Your rating:</span>
                          <div className="flex items-center gap-1">
                            {renderStars(plan.rating)}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {getBudgetDisplay(plan.estimated_cost)}
                          </Badge>
                          {plan.is_shared && (
                            <Badge className="text-xs bg-blue-100 text-blue-700">
                              Shared
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(plan.completed_date)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
