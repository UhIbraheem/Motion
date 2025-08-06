"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  IoSearch,
  IoLocationOutline,
  IoTimeOutline,
  IoHeartOutline,
  IoHeart,
  IoStar,
  IoFilter,
  IoAdd,
  IoRestaurant,
  IoCamera,
  IoWalk,
  IoWine,
  IoLeaf,
  IoChevronUp
} from 'react-icons/io5';

const mockAdventures = [
  {
    id: "1",
    custom_title: "Secret Speakeasy & Rooftop Views",
    location: "Downtown San Francisco", 
    duration_hours: 3,
    estimated_cost: "$$",
    rating: 4.8,
    created_at: "2024-01-15",
    profiles: {
      first_name: "Sarah",
      last_name: "Chen",
      profile_picture_url: null
    },
    adventure_photos: [
      { photo_url: "/api/placeholder/400/300", is_cover_photo: true }
    ],
    steps: [
      {
        time: "19:00",
        title: "Hidden Cocktail Bar",
        location: "Financial District Rooftop",
        notes: "Hidden entrance through vintage elevator"
      }
    ],
    likes_count: 156,
    saves_count: 89,
    user_liked: false,
    user_saved: false
  },
  {
    id: "2",
    custom_title: "Local Food Market Adventure", 
    location: "Mission District",
    duration_hours: 2,
    estimated_cost: "$",
    rating: 4.9,
    created_at: "2024-01-14",
    profiles: {
      first_name: "Miguel",
      last_name: "Rodriguez", 
      profile_picture_url: null
    },
    adventure_photos: [
      { photo_url: "/api/placeholder/400/300", is_cover_photo: true }
    ],
    steps: [
      {
        time: "09:00",
        title: "Farmers Market Tour",
        location: "Mission Dolores Market",
        notes: "Meet local vendors and taste seasonal produce"
      }
    ],
    likes_count: 203,
    saves_count: 127,
    user_liked: true,
    user_saved: false
  },
  {
    id: "3",
    custom_title: "Sunset Beach Walk & Dinner",
    location: "Ocean Beach",
    duration_hours: 4,
    estimated_cost: "$$$",
    rating: 4.7,
    created_at: "2024-01-13",
    profiles: {
      first_name: "Emma",
      last_name: "Wilson",
      profile_picture_url: null
    },
    adventure_photos: [
      { photo_url: "/api/placeholder/400/300", is_cover_photo: true }
    ],
    steps: [
      {
        time: "17:00",
        title: "Golden Hour Beach Walk",
        location: "Ocean Beach Promenade",
        notes: "Perfect timing for sunset photos"
      }
    ],
    likes_count: 92,
    saves_count: 64,
    user_liked: false,
    user_saved: true
  }
];

const categories = [
  { name: "Foodie", icon: IoRestaurant, color: "text-orange-600" },
  { name: "Nature", icon: IoLeaf, color: "text-green-600" },
  { name: "Culture", icon: IoCamera, color: "text-purple-600" },
  { name: "Romance", icon: IoWine, color: "text-pink-600" },
  { name: "Adventure", icon: IoWalk, color: "text-blue-600" },
  { name: "Nightlife", icon: IoWine, color: "text-indigo-600" },
  { name: "Shopping", icon: IoCamera, color: "text-yellow-600" },
  { name: "Wellness", icon: IoLeaf, color: "text-teal-600" },
];

export default function DiscoverPage() {
  const { user, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [adventures, setAdventures] = useState(mockAdventures);
  const [isHydrated, setIsHydrated] = useState(false);
  const [showAllFilters, setShowAllFilters] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    
    // Handle scroll for collapsible filters
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLike = (adventureId: string) => {
    setAdventures(prev => 
      prev.map(adventure => 
        adventure.id === adventureId 
          ? { 
              ...adventure, 
              user_liked: !adventure.user_liked,
              likes_count: adventure.user_liked ? adventure.likes_count - 1 : adventure.likes_count + 1
            }
          : adventure
      )
    );
  };

  const toggleSave = (adventureId: string) => {
    setAdventures(prev => 
      prev.map(adventure => 
        adventure.id === adventureId 
          ? { 
              ...adventure, 
              user_saved: !adventure.user_saved,
              saves_count: adventure.user_saved ? adventure.saves_count - 1 : adventure.saves_count + 1
            }
          : adventure
      )
    );
  };

  const getBudgetDisplay = (cost: string) => {
    const map: Record<string, string> = {
      '$': 'Budget-friendly',
      '$$': 'Moderate',
      '$$$': 'Premium'
    };
    return map[cost] || cost;
  };

  // Only show loading during initial hydration
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3c7660] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading adventures...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <main className="pt-16">
        {/* Search & Filters Section - Clean and Simple */}
        <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-6">
              <div className="relative">
                <IoSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search destinations, activities, or experiences..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-3 text-base border-gray-300 rounded-full shadow-sm focus:border-[#3c7660] focus:ring-[#3c7660] bg-white"
                />
                <Button 
                  size="sm" 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#3c7660] hover:bg-[#2d5a48] text-white rounded-full px-4"
                >
                  <IoFilter className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Category Filters - Always Visible */}
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              <div className="flex gap-3 mx-auto min-w-max">
                {categories.slice(0, showAllFilters ? categories.length : 5).map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <Button
                      key={category.name}
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCategory(selectedCategory === category.name ? null : category.name)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 whitespace-nowrap ${
                        selectedCategory === category.name
                          ? 'bg-[#3c7660] text-white border-[#3c7660] shadow-md'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-[#3c7660] hover:text-[#3c7660] hover:shadow-sm'
                      }`}
                    >
                      <IconComponent className={`w-4 h-4 ${selectedCategory === category.name ? 'text-white' : category.color}`} />
                      <span className="font-medium">{category.name}</span>
                    </Button>
                  );
                })}
                
                {categories.length > 5 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllFilters(!showAllFilters)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 bg-white text-gray-700 hover:border-[#3c7660] hover:text-[#3c7660] hover:shadow-sm whitespace-nowrap"
                  >
                    {showAllFilters ? (
                      <>
                        <IoChevronUp className="w-4 h-4" />
                        <span className="font-medium">Show Less</span>
                      </>
                    ) : (
                      <>
                        <IoAdd className="w-4 h-4" />
                        <span className="font-medium">Show More</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Create Adventure CTA (for non-users) */}
        {!user && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-gradient-to-r from-[#3c7660] to-[#2d5a48] rounded-2xl p-8 text-center text-white">
              <h2 className="text-2xl font-bold mb-2">Ready for your next adventure?</h2>
              <p className="text-white/90 mb-6 max-w-md mx-auto">
                Let AI create a personalized experience tailored just for you
              </p>
              <Link href="/create">
                <Button 
                  size="lg"
                  className="bg-white hover:bg-gray-50 text-[#3c7660] font-semibold px-8 py-3 rounded-full shadow-lg"
                >
                  <IoAdd className="w-5 h-5 mr-2" />
                  Create Adventure
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Adventures Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover Local Adventures</h1>
              <p className="text-gray-600">Curated experiences shared by our community</p>
            </div>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {adventures.map((adventure) => (
              <Card key={adventure.id} className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={adventure.adventure_photos[0]?.photo_url || '/api/placeholder/400/300'}
                    alt={adventure.custom_title}
                    fill
                    unoptimized
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {user && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(adventure.id);
                      }}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white hover:scale-110 transition-all duration-200 p-0"
                    >
                      {adventure.user_liked ? (
                        <IoHeart className="w-4 h-4 text-red-500" />
                      ) : (
                        <IoHeartOutline className="w-4 h-4 text-gray-600" />
                      )}
                    </Button>
                  )}

                  <div className="absolute bottom-3 left-3 bg-white/95 rounded-full px-2 py-1 flex items-center gap-1">
                    <IoStar className="w-3 h-3 text-yellow-400" />
                    <span className="text-xs font-medium text-gray-900">
                      {adventure.rating}
                    </span>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm">
                      {adventure.custom_title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <IoLocationOutline className="w-3 h-3" />
                      <span>{adventure.location}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <IoTimeOutline className="w-3 h-3" />
                      <span>{adventure.duration_hours}h</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-5 h-5">
                        <AvatarImage src={adventure.profiles.profile_picture_url || undefined} />
                        <AvatarFallback className="bg-[#3c7660] text-white text-xs">
                          {adventure.profiles.first_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-gray-600">
                        {adventure.profiles.first_name} {adventure.profiles.last_name}
                      </span>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                      {getBudgetDisplay(adventure.estimated_cost)}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <IoHeartOutline className="w-3 h-3" />
                        <span>{adventure.likes_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>{adventure.saves_count} saved</span>
                      </div>
                    </div>
                    {user && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSave(adventure.id);
                        }}
                        className="text-xs p-1 h-auto hover:text-[#3c7660]"
                      >
                        {adventure.user_saved ? 'Saved' : 'Save'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
