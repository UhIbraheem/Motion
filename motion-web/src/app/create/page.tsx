"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { 
  IoLocationOutline,
  IoRestaurant,
  IoLeaf,
  IoCamera,
  IoWine,
  IoWalk,
  IoSparkles,
  IoHeart,
  IoColorPalette,
  IoMusicalNotes,
  IoGameController,
  IoBookOutline,
  IoCafeOutline,
  IoFitnessOutline,
  IoSchoolOutline,
  IoTime,
  IoSettingsOutline,
  IoCash,
  IoPeople,
  IoCompass,
  IoNutrition
} from 'react-icons/io5';
import AdventureService from '@/services/AdventureService';
import { WebAIAdventureService, type AdventureFilters } from '@/services/aiService';

const moodOptions = [
  { value: 'adventurous', label: 'Adventurous', icon: IoWalk, color: 'text-blue-500', bg: 'bg-blue-50' },
  { value: 'romantic', label: 'Romantic', icon: IoHeart, color: 'text-pink-500', bg: 'bg-pink-50' },
  { value: 'relaxed', label: 'Relaxed', icon: IoLeaf, color: 'text-green-500', bg: 'bg-green-50' },
  { value: 'social', label: 'Social', icon: IoWine, color: 'text-purple-500', bg: 'bg-purple-50' },
  { value: 'cultural', label: 'Cultural', icon: IoCamera, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { value: 'foodie', label: 'Foodie', icon: IoRestaurant, color: 'text-orange-500', bg: 'bg-orange-50' }
];

const experienceTypes = [
  { value: 'hidden-gem', label: 'Hidden Gem', icon: IoCamera, color: 'text-purple-500' },
  { value: 'explorer', label: 'Explorer', icon: IoCompass, color: 'text-blue-500' },
  { value: 'nature', label: 'Nature', icon: IoLeaf, color: 'text-green-500' },
  { value: 'partier', label: 'Partier', icon: IoMusicalNotes, color: 'text-pink-500' },
  { value: 'solo-freestyle', label: 'Solo Freestyle', icon: IoWalk, color: 'text-indigo-500' },
  { value: 'academic-weapon', label: 'Academic Weapon', icon: IoSchoolOutline, color: 'text-blue-600' },
  { value: 'special-occasion', label: 'Special Occasion', icon: IoSparkles, color: 'text-yellow-500' },
  { value: 'artsy', label: 'Artsy', icon: IoColorPalette, color: 'text-purple-600' },
  { value: 'foodie-adventure', label: 'Foodie Adventure', icon: IoRestaurant, color: 'text-orange-500' },
  { value: 'culture-dive', label: 'Culture Dive', icon: IoBookOutline, color: 'text-teal-500' },
  { value: 'sweet-treat', label: 'Sweet Treat', icon: IoCafeOutline, color: 'text-brown-500' },
  { value: 'puzzle-solver', label: 'Puzzle Solver', icon: IoGameController, color: 'text-red-500' },
  { value: 'wellness', label: 'Wellness', icon: IoFitnessOutline, color: 'text-emerald-500' }
];

const durationOptions = [
  { value: 'short', label: 'Short', description: '1-2 hours', icon: IoTime },
  { value: 'half-day', label: 'Half Day', description: '3-5 hours', icon: IoTime },
  { value: 'full-day', label: 'Full Day', description: '6+ hours', icon: IoTime }
];

const dietaryOptions = [
  { value: 'vegetarian', label: 'Vegetarian', icon: IoLeaf, color: 'text-green-500' },
  { value: 'vegan', label: 'Vegan', icon: IoLeaf, color: 'text-green-600' },
  { value: 'gluten-free', label: 'Gluten Free', icon: IoNutrition, color: 'text-yellow-600' },
  { value: 'dairy-free', label: 'Dairy Free', icon: IoNutrition, color: 'text-blue-500' },
  { value: 'nut-free', label: 'Nut Free', icon: IoNutrition, color: 'text-orange-500' },
  { value: 'keto', label: 'Keto', icon: IoFitnessOutline, color: 'text-purple-500' },
  { value: 'halal', label: 'Halal', icon: IoRestaurant, color: 'text-teal-500' },
  { value: 'kosher', label: 'Kosher', icon: IoRestaurant, color: 'text-indigo-500' }
];

interface FormData {
  mood: string;
  categories: string[];
  location: string;
  duration: string;
  budget: string;
  groupSize: string;
  dietaryRestrictions: string[];
}

interface UsageStats {
  generationsUsed: number;
  generationsLimit: number;
  editsUsed: number;
  editsLimit: number;
  resetDate: string;
}

export default function CreatePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [formData, setFormData] = useState<FormData>({
    mood: '',
    categories: [],
    location: '',
    duration: '',
    budget: '',
    groupSize: '',
    dietaryRestrictions: []
  });

  // Load user usage stats
  useEffect(() => {
    if (user) {
      loadUsageStats();
    }
  }, [user]);

  const loadUsageStats = async () => {
    if (!user) return;
    try {
      const stats = await AdventureService.getUserUsageStats(user.id);
      setUsageStats(stats);
    } catch (error) {
      console.error('Error loading usage stats:', error);
    }
  };

  const handleMoodSelect = (mood: string) => {
    setFormData(prev => ({ ...prev, mood }));
  };

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleDietaryToggle = (dietary: string) => {
    setFormData(prev => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions.includes(dietary)
        ? prev.dietaryRestrictions.filter(d => d !== dietary)
        : [...prev.dietaryRestrictions, dietary]
    }));
  };

  const handleGenerate = async () => {
    if (!user) {
      // Redirect to sign in or show modal
      router.push('/auth/signin');
      return;
    }

    setIsGenerating(true);
    
    try {
      const ai = new WebAIAdventureService();
      const filters: AdventureFilters = {
        location: formData.location || undefined,
        duration: formData.duration === 'short' ? 'quick' : formData.duration === 'half-day' ? 'half-day' : formData.duration === 'full-day' ? 'full-day' : undefined,
        budget: formData.budget ? (formData.budget.includes('$') ? (formData.budget.length <= 2 ? 'budget' : formData.budget.length === 3 ? 'moderate' : 'premium') : undefined) : undefined,
        dietaryRestrictions: formData.dietaryRestrictions,
        groupSize: formData.groupSize ? parseInt(formData.groupSize, 10) : undefined,
        experienceTypes: formData.categories,
      };

      const { data, error } = await ai.generateAdventure(filters);
      if (error || !data) {
        console.error('AI generation failed:', error);
      } else {
        // For now, stash the result in sessionStorage and navigate to a simple reader page later
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('lastGeneratedAdventure', JSON.stringify(data));
        }
        router.push('/plans');
      }
    } catch (error) {
      console.error('Error generating adventure:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Navigation />
      
      {/* Main content with proper top padding for Navigation */}
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="bg-gradient-to-r from-[#3c7660] to-[#2d5a48] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <IoSparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Create Your Perfect Adventure</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tell us what you're in the mood for, and our AI will craft a personalized experience just for you
            </p>
            {usageStats && (
              <div className="mt-6 mx-auto max-w-md">
                <div className="backdrop-blur-md bg-white/60 border border-white/70 shadow-sm rounded-xl p-4">
                  <div className="flex items-center justify-between text-sm text-gray-700">
                    <span>Generations used</span>
                    <span className="font-semibold text-[#2a5444]">{usageStats.generationsUsed}/{usageStats.generationsLimit}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Uniform 2x2 Squares Layout */}
          <div className="w-[90%] mx-auto mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* L-Shaped Block 1: Experience Types - Main vertical (3x8) + horizontal extension (2x2) */}
              <Card className="border border-white/30 bg-white/50 backdrop-blur-xl rounded-2xl shadow-lg overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg text-[#3c7660]">
                    <IoCompass className="w-5 h-5" />
                    Experience Type ({formData.categories.length} selected)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[360px] overflow-y-auto p-1">
                    {experienceTypes.map((type) => {
                      const IconComponent = type.icon;
                      return (
                        <Button
                          key={type.value}
                          onClick={() => handleCategoryToggle(type.value)}
                          variant={formData.categories.includes(type.value) ? "default" : "outline"}
                          className={`h-14 p-2 text-xs transition-all duration-200 ${
                            formData.categories.includes(type.value)
                              ? 'bg-[#3c7660] text-white shadow-md border-[#3c7660]'
                              : 'border-white/60 bg-white/70 backdrop-blur-sm hover:border-[#3c7660]/50'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <IconComponent className={`w-4 h-4 ${
                              formData.categories.includes(type.value) ? 'text-white' : type.color
                            }`} />
                            <span className="font-medium leading-tight text-center text-xs">{type.label}</span>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* L-Shaped Extension: Mood Selection (2x5) - fits in the L */}
              <Card className="border border-white/30 bg-white/50 backdrop-blur-xl rounded-2xl shadow-lg overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg text-[#3c7660]">
                    <IoHeart className="w-5 h-5" />
                    Your Vibe
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-2 max-h-[360px] overflow-y-auto p-1">
                    {moodOptions.map((option) => {
                      const IconComponent = option.icon;
                      return (
                        <Button
                          key={option.value}
                          onClick={() => handleMoodSelect(option.value)}
                          variant={formData.mood === option.value ? "default" : "outline"}
                          className={`h-14 justify-start text-left transition-all duration-200 ${
                            formData.mood === option.value
                              ? 'bg-[#3c7660] text-white shadow-lg border-[#3c7660]'
                              : `bg-white/70 backdrop-blur-sm border-white/60 hover:border-[#3c7660]/50`
                          }`}
                        >
                          <div className="flex items-center gap-2 w-full">
                            <IconComponent className={`w-4 h-4 ${
                              formData.mood === option.value ? 'text-white' : option.color
                            }`} />
                            <span className="font-medium text-sm">{option.label}</span>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Right Stack - Top: Adventure Details (3x4) */}
              <Card className="border border-white/30 bg-white/50 backdrop-blur-xl rounded-2xl shadow-lg overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg text-[#3c7660]">
                    <IoSettingsOutline className="w-5 h-5" />
                    Adventure Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {/* Location Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <IoLocationOutline className="w-4 h-4 inline mr-1" />
                        Location
                      </label>
                      <Input
                        type="text"
                        placeholder="City or area..."
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        className="h-10 text-sm border-white/60 bg-white/70 backdrop-blur-sm focus:border-[#3c7660]"
                      />
                    </div>

                    {/* Group Size */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <IoPeople className="w-4 h-4 inline mr-1" />
                        People
                      </label>
                      <Input
                        type="number"
                        min="1"
                        placeholder="2"
                        value={formData.groupSize}
                        onChange={(e) => setFormData(prev => ({ ...prev, groupSize: e.target.value }))}
                        className="h-10 text-sm border-white/60 bg-white/70 backdrop-blur-sm focus:border-[#3c7660]"
                      />
                    </div>
                  </div>

                  {/* Duration Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <IoTime className="w-4 h-4 inline mr-1" />
                      Duration
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {durationOptions.map((option) => (
                        <Button
                          key={option.value}
                          onClick={() => setFormData(prev => ({ ...prev, duration: option.value }))}
                          variant={formData.duration === option.value ? "default" : "outline"}
                          size="sm"
                          className={`h-12 p-2 text-xs transition-all duration-200 ${
                            formData.duration === option.value
                              ? 'bg-[#3c7660] text-white shadow-md border-[#3c7660]'
                              : 'border-white/60 bg-white/70 backdrop-blur-sm hover:border-[#3c7660]/50'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <span className="font-medium text-xs">{option.label}</span>
                            <span className="text-xs opacity-80">{option.description}</span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Budget Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <IoCash className="w-4 h-4 inline mr-1" />
                      Budget (Optional)
                    </label>
                    <Input
                      type="text"
                      placeholder="$50-100"
                      value={formData.budget}
                      onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                      className="h-10 text-sm border-white/60 bg-white/70 backdrop-blur-sm focus:border-[#3c7660]"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Right Stack - Bottom: Dietary Restrictions (3x4) */}
              <Card className="border border-white/30 bg-white/50 backdrop-blur-xl rounded-2xl shadow-lg overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg text-[#3c7660]">
                    <IoNutrition className="w-5 h-5" />
                    Dietary Restrictions ({formData.dietaryRestrictions.length} selected)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[360px] overflow-y-auto p-1">
                    {dietaryOptions.map((option) => {
                      const IconComponent = option.icon;
                      return (
                        <Button
                          key={option.value}
                          onClick={() => handleDietaryToggle(option.value)}
                          variant={formData.dietaryRestrictions.includes(option.value) ? "default" : "outline"}
                          size="sm"
                          className={`h-12 p-2 text-xs transition-all duration-200 ${
                            formData.dietaryRestrictions.includes(option.value)
                              ? 'bg-[#3c7660] text-white shadow-md border-[#3c7660]'
                              : 'border-gray-200 hover:border-[#3c7660]/50 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-2 justify-center">
                            <IconComponent className={`w-4 h-4 ${
                              formData.dietaryRestrictions.includes(option.value) ? 'text-white' : option.color
                            }`} />
                            <span className="font-medium leading-tight text-xs">{option.label}</span>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Full-width Generate CTA */}
              <div className="md:col-span-2 flex items-center justify-center">
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !formData.mood || formData.categories.length === 0 || !formData.location}
                  className="w-full h-14 bg-gradient-to-r from-[#3c7660] to-[#2d5a48] hover:from-[#2d5a48] hover:to-[#1e3c30] text-white rounded-2xl text-base font-semibold shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {isGenerating ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span className="text-sm">Generating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <IoSparkles className="w-5 h-5" />
                      <span>Generate Adventure</span>
                    </div>
                  )}
                </Button>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
