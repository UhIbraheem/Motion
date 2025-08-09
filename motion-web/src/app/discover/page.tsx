"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import AdventureDetailModal from '@/components/AdventureDetailModal';
import { 
  IoCompass, 
  IoLocationOutline, 
  IoTimeOutline, 
  IoStarOutline,
  IoStar,
  IoSearchOutline,
  IoOptions,
  IoHeartOutline,
  IoHeart,
  IoArrowForward
} from "react-icons/io5";

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    experience_type: "all",
    budget_level: "all",
    duration: "all",
    rating: "all"
  });
  const [savedAdventures, setSavedAdventures] = useState<string[]>([]);
  const [selectedAdventure, setSelectedAdventure] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock adventure data with more variety - updated for modal compatibility
  const mockAdventures = [
    {
      id: "1",
      custom_title: "Hidden Waterfall Discovery",
      description: "Find secret waterfalls along scenic hiking trails with local wildlife viewing opportunities. This immersive nature adventure takes you through pristine forest paths where you'll encounter cascading waters, diverse plant life, and maybe even spot some local wildlife along the way.",
      location: "Forest Ridge Trail, Pacific Northwest",
      duration_hours: 3,
      estimated_cost: "$",
      budget_level: "$",
      experience_type: "Nature",
      rating: 4.9,
      image: "/logo-swirl.svg",
      tags: ["Hiking", "Photography", "Wildlife"],
      adventure_photos: [
        { photo_url: "/api/placeholder/800/600", is_cover_photo: true },
        { photo_url: "/api/placeholder/800/600", is_cover_photo: false },
        { photo_url: "/api/placeholder/800/600", is_cover_photo: false }
      ],
      profiles: {
        first_name: "Sarah",
        last_name: "Johnson",
        profile_picture_url: "/api/placeholder/100/100"
      },
      saves_count: 234,
      likes_count: 189,
      user_review: "This trail exceeded all my expectations! The hidden waterfalls were absolutely breathtaking, and I managed to spot a family of deer on the way back. Perfect for nature photography enthusiasts.",
      adventure_steps: [
        {
          id: "step-1",
          step_number: 1,
          title: "Trail Head Parking & Preparation",
          description: "Start at the Forest Ridge Trail parking area. Make sure to bring water, snacks, and a camera for the wildlife you might encounter.",
          location: "Forest Ridge Trail Parking",
          estimated_duration_minutes: 15,
          estimated_cost: "Free"
        },
        {
          id: "step-2", 
          step_number: 2,
          title: "Forest Path to First Viewpoint",
          description: "Follow the marked trail through old-growth forest. Look out for native birds and plant species along this peaceful stretch.",
          location: "Old Growth Forest Section",
          estimated_duration_minutes: 45,
          estimated_cost: "Free"
        },
        {
          id: "step-3",
          step_number: 3,
          title: "Hidden Waterfall Discovery",
          description: "Reach the stunning hidden waterfall - perfect for photos and a peaceful rest. The mist creates beautiful rainbows on sunny days!",
          location: "Secret Falls",
          estimated_duration_minutes: 60,
          estimated_cost: "Free",
          business_info: {
            name: "Secret Falls Natural Area",
            photos: ["/api/placeholder/400/300", "/api/placeholder/400/300", "/api/placeholder/400/300"],
            description: "A pristine natural waterfall hidden within old-growth forest, featuring a 40-foot cascade into a crystal-clear pool.",
            hours: "Dawn to Dusk Daily",
            avg_price: "Free",
            ai_description: "This secluded waterfall offers the perfect combination of natural beauty and tranquility, making it an ideal spot for meditation, photography, and connecting with nature."
          }
        },
        {
          id: "step-4",
          step_number: 4,
          title: "Wildlife Viewing Loop",
          description: "Take the extended loop trail for the best chances of spotting local wildlife including deer, birds, and maybe even a fox!",
          location: "Wildlife Loop Trail",
          estimated_duration_minutes: 45,
          estimated_cost: "Free"
        }
      ]
    },
    {
      id: "2", 
      custom_title: "Historic District Food Tour",
      description: "Taste authentic local flavors at family-owned restaurants and hidden culinary gems throughout the historic downtown area.",
      location: "Historic Downtown District",
      duration_hours: 4,
      estimated_cost: "$$$",
      budget_level: "$$$",
      experience_type: "Food",
      rating: 4.8,
      image: "/logo-swirl.svg",
      tags: ["Food", "Culture", "Walking"],
      adventure_photos: [
        { photo_url: "/api/placeholder/800/600", is_cover_photo: true }
      ],
      profiles: {
        first_name: "Marcus",
        last_name: "Chen"
      },
      saves_count: 156,
      likes_count: 203,
      adventure_steps: [
        {
          id: "step-1",
          step_number: 1,
          title: "Start at Historic Market Square",
          description: "Begin your culinary journey at the heart of the historic district",
          location: "Market Square",
          estimated_duration_minutes: 30
        }
      ]
    },
    {
      id: "3",
      custom_title: "Urban Art & Coffee Journey",
      description: "Explore vibrant street art while discovering specialty coffee roasters and local artists",
      location: "Arts Quarter",
      duration_hours: 2,
      estimated_cost: "$$",
      budget_level: "$$",
      experience_type: "Culture",
      rating: 4.7,
      image: "/logo-swirl.svg",
      tags: ["Art", "Coffee", "Urban"],
      adventure_photos: [
        { photo_url: "/api/placeholder/800/600", is_cover_photo: true }
      ],
      profiles: {
        first_name: "Luna",
        last_name: "Rodriguez"
      },
      saves_count: 89,
      likes_count: 134,
      adventure_steps: []
    },
    {
      id: "4",
      custom_title: "Sunrise Photography Adventure",
      description: "Capture stunning sunrise views from hidden vantage points with professional photo tips",
      location: "Skyline Overlook",
      duration_hours: 2,
      estimated_cost: "$",
      budget_level: "$",
      experience_type: "Photography",
      rating: 4.9,
      image: "/logo-swirl.svg",
      tags: ["Photography", "Sunrise", "Nature"],
      adventure_photos: [
        { photo_url: "/api/placeholder/800/600", is_cover_photo: true }
      ],
      profiles: {
        first_name: "Alex",
        last_name: "Kim"
      },
      saves_count: 298,
      likes_count: 245,
      adventure_steps: []
    },
    {
      id: "5",
      custom_title: "Local Brewery Crawl",
      description: "Sample craft beers and meet local brewers while learning about brewing traditions",
      location: "Brewery District",
      duration_hours: 5,
      estimated_cost: "$$$",
      budget_level: "$$$",
      experience_type: "Nightlife",
      rating: 4.6,
      image: "/logo-swirl.svg",
      tags: ["Beer", "Social", "Local"],
      adventure_photos: [
        { photo_url: "/api/placeholder/800/600", is_cover_photo: true }
      ],
      profiles: {
        first_name: "Jake",
        last_name: "Miller"
      },
      saves_count: 123,
      likes_count: 167,
      adventure_steps: []
    },
    {
      id: "6",
      custom_title: "Coastal Tide Pool Exploration",
      description: "Discover marine life in natural tide pools with educational insights about ocean ecosystems",
      location: "Rocky Point Beach",
      duration_hours: 3,
      estimated_cost: "$",
      budget_level: "$",
      experience_type: "Nature",
      rating: 4.8,
      image: "/logo-swirl.svg",
      tags: ["Marine", "Education", "Beach"],
      adventure_photos: [
        { photo_url: "/api/placeholder/800/600", is_cover_photo: true }
      ],
      profiles: {
        first_name: "Emma",
        last_name: "Watson"
      },
      saves_count: 178,
      likes_count: 221,
      adventure_steps: []
    }
  ];

  const experienceTypes = ["all", "Nature", "Culture", "Food", "Photography", "Nightlife"];
  const budgetLevels = ["all", "$", "$$", "$$$"];
  const durations = ["all", "1-2 hours", "2-4 hours", "4+ hours"];
  const ratings = ["all", "4.5+", "4.0+", "3.5+"];

  const toggleSaved = (adventureId: string) => {
    setSavedAdventures(prev => 
      prev.includes(adventureId) 
        ? prev.filter(id => id !== adventureId)
        : [...prev, adventureId]
    );
  };

  const openAdventureModal = (adventure: any) => {
    setSelectedAdventure(adventure);
    setIsModalOpen(true);
  };

  const closeAdventureModal = () => {
    setIsModalOpen(false);
    setSelectedAdventure(null);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => {
      const starIndex = index + 1;
      return starIndex <= Math.floor(rating) ? 
        <IoStar key={index} className="w-4 h-4 text-yellow-400" /> : 
        <IoStarOutline key={index} className="w-4 h-4 text-gray-300" />;
    });
  };

  const getBudgetColor = (budget: string) => {
    switch(budget) {
      case "$": return "bg-green-100 text-green-800";
      case "$$": return "bg-yellow-100 text-yellow-800";
      case "$$$": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getExperienceColor = (type: string) => {
    switch(type) {
      case "Nature": return "bg-green-100 text-green-800";
      case "Culture": return "bg-purple-100 text-purple-800";
      case "Food": return "bg-orange-100 text-orange-800";
      case "Photography": return "bg-blue-100 text-blue-800";
      case "Nightlife": return "bg-pink-100 text-pink-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#2a5444] mb-2">Discover Adventures</h1>
            <p className="text-xl text-[#3c7660]">Find your next amazing local experience</p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-2xl">
              <IoSearchOutline className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search adventures, locations, or activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-4 text-lg border-2 border-gray-200 focus:border-[#3c7660] rounded-2xl"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-3">
              {experienceTypes.map((type) => (
                <Button
                  key={type}
                  variant={selectedFilters.experience_type === type ? "default" : "outline"}
                  className={`rounded-full px-6 py-2 ${
                    selectedFilters.experience_type === type 
                      ? "bg-[#3c7660] text-white hover:bg-[#2a5444]" 
                      : "border-[#3c7660] text-[#3c7660] hover:bg-[#3c7660] hover:text-white"
                  }`}
                  onClick={() => setSelectedFilters(prev => ({ ...prev, experience_type: type }))}
                >
                  {type === "all" ? "All Adventures" : type}
                </Button>
              ))}
            </div>
          </div>

          {/* Adventures Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {mockAdventures.map((adventure) => (
              <Card key={adventure.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden bg-gradient-to-br from-white to-gray-50">
                <div className="relative">
                  {/* Image Placeholder */}
                  <div className="h-48 bg-gradient-to-br from-[#3c7660]/10 to-[#f2cc6c]/10 flex items-center justify-center">
                    <IoCompass className="w-12 h-12 text-[#3c7660] opacity-50" />
                  </div>
                  
                  {/* Save Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-4 right-4 bg-white/90 hover:bg-white rounded-full p-2"
                    onClick={() => toggleSaved(adventure.id)}
                  >
                    {savedAdventures.includes(adventure.id) ? (
                      <IoHeart className="w-5 h-5 text-red-500" />
                    ) : (
                      <IoHeartOutline className="w-5 h-5 text-gray-600" />
                    )}
                  </Button>
                </div>

                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Title and Rating */}
                    <div className="flex items-start justify-between">
                      <h3 className="text-xl font-bold text-[#2a5444] group-hover:text-[#3c7660] transition-colors">
                        {adventure.custom_title}
                      </h3>
                      <div className="flex items-center space-x-1">
                        {renderStars(adventure.rating)}
                        <span className="text-sm text-gray-600 ml-1">{adventure.rating}</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 leading-relaxed">
                      {adventure.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {adventure.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="bg-[#3c7660]/10 text-[#3c7660] text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Adventure Details */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center text-sm text-gray-600">
                        <IoLocationOutline className="w-4 h-4 mr-2" />
                        {adventure.location}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <IoTimeOutline className="w-4 h-4 mr-2" />
                        {adventure.duration_hours}h
                      </div>

                      <div className="flex items-center space-x-2">
                        <Badge className={getBudgetColor(adventure.budget_level)}>
                          {adventure.budget_level}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {adventure.estimated_cost}
                        </span>
                      </div>

                      <div>
                        <Badge className={getExperienceColor(adventure.experience_type)}>
                          {adventure.experience_type}
                        </Badge>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button 
                      className="w-full bg-gradient-to-r from-[#3c7660] to-[#2a5444] hover:from-[#2a5444] hover:to-[#1e3c30] text-white group-hover:scale-105 transition-all duration-300"
                      onClick={() => openAdventureModal(adventure)}
                    >
                      View Adventure Details
                      <IoArrowForward className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Filters */}
      <div className="w-80 bg-gray-50 p-6 border-l border-gray-200">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-[#2a5444] mb-4 flex items-center">
              <IoOptions className="w-5 h-5 mr-2" />
              Filters
            </h3>
            
            {/* Budget Filter */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Budget</h4>
              <div className="space-y-2">
                {budgetLevels.map((budget) => (
                  <Button
                    key={budget}
                    variant={selectedFilters.budget_level === budget ? "default" : "ghost"}
                    size="sm"
                    className={`w-full justify-start ${
                      selectedFilters.budget_level === budget 
                        ? "bg-[#3c7660] text-white" 
                        : "hover:bg-[#3c7660]/10"
                    }`}
                    onClick={() => setSelectedFilters(prev => ({ ...prev, budget_level: budget }))}
                  >
                    {budget === "all" ? "Any Budget" : budget}
                  </Button>
                ))}
              </div>
            </div>

            {/* Duration Filter */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Duration</h4>
              <div className="space-y-2">
                {durations.map((duration) => (
                  <Button
                    key={duration}
                    variant={selectedFilters.duration === duration ? "default" : "ghost"}
                    size="sm"
                    className={`w-full justify-start ${
                      selectedFilters.duration === duration 
                        ? "bg-[#3c7660] text-white" 
                        : "hover:bg-[#3c7660]/10"
                    }`}
                    onClick={() => setSelectedFilters(prev => ({ ...prev, duration }))}
                  >
                    {duration === "all" ? "Any Duration" : duration}
                  </Button>
                ))}
              </div>
            </div>

            {/* Rating Filter */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Rating</h4>
              <div className="space-y-2">
                {ratings.map((rating) => (
                  <Button
                    key={rating}
                    variant={selectedFilters.rating === rating ? "default" : "ghost"}
                    size="sm"
                    className={`w-full justify-start ${
                      selectedFilters.rating === rating 
                        ? "bg-[#3c7660] text-white" 
                        : "hover:bg-[#3c7660]/10"
                    }`}
                    onClick={() => setSelectedFilters(prev => ({ ...prev, rating }))}
                  >
                    {rating === "all" ? "Any Rating" : `${rating} Stars`}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Popular This Week */}
          <div>
            <h3 className="text-lg font-semibold text-[#2a5444] mb-4">Popular This Week</h3>
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="text-sm font-medium text-gray-900">Waterfall Hikes</div>
                <div className="text-xs text-gray-600">+142% interest</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="text-sm font-medium text-gray-900">Photography Tours</div>
                <div className="text-xs text-gray-600">+89% interest</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="text-sm font-medium text-gray-900">Local Food</div>
                <div className="text-xs text-gray-600">+76% interest</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Adventure Detail Modal */}
      <AdventureDetailModal
        adventure={selectedAdventure}
        isOpen={isModalOpen}
        onClose={closeAdventureModal}
      />
    </div>
  );
}
