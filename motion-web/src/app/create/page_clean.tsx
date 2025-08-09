"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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

interface FormData {
  mood: string;
  categories: string[];
  location: string;
  duration: string;
  budget: string;
  groupSize: string;
  dietaryRestrictions: string[];
}

export default function CreatePage() {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    mood: '',
    categories: [],
    location: '',
    duration: '',
    budget: '',
    groupSize: '',
    dietaryRestrictions: []
  });

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

  const handleGenerate = async () => {
    if (!user) {
      // Redirect to sign in or show modal
      return;
    }

    setIsGenerating(true);
    
    try {
      // TODO: Call AI generation API with formData
      console.log('Generating adventure with:', formData);
      
      // Mock delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // TODO: Redirect to generated adventure page
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
          </div>

          {/* 4-Box Tetris Layout - 80% width, no gaps */}
          <div className="w-[80%] max-w-7xl mx-auto mb-8">
            <div className="grid grid-cols-4 grid-rows-4 gap-0 aspect-square">
              
              {/* Box 1: Mood Selection - Tall left rectangle (2x4) */}
              <Card className="col-span-2 row-span-4 border-2 border-[#3c7660]/20 rounded-tl-2xl rounded-bl-2xl shadow-lg bg-gradient-to-br from-white to-[#3c7660]/5 overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-xl text-[#3c7660]">
                    <IoHeart className="w-5 h-5" />
                    What's Your Vibe?
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-full overflow-y-auto">
                  <div className="grid grid-cols-1 gap-3">
                    {moodOptions.map((option) => {
                      const IconComponent = option.icon;
                      return (
                        <Button
                          key={option.value}
                          onClick={() => handleMoodSelect(option.value)}
                          variant={formData.mood === option.value ? "default" : "outline"}
                          className={`h-16 justify-start text-left transition-all duration-200 ${
                            formData.mood === option.value
                              ? 'bg-[#3c7660] text-white shadow-lg border-[#3c7660]'
                              : `${option.bg} border-gray-200 hover:border-[#3c7660]/50`
                          }`}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <IconComponent className={`w-5 h-5 ${
                              formData.mood === option.value ? 'text-white' : option.color
                            }`} />
                            <span className="font-medium">{option.label}</span>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Box 2: Experience Types - Top right rectangle (2x2) */}
              <Card className="col-span-2 row-span-2 border-2 border-[#3c7660]/20 rounded-tr-2xl shadow-lg bg-gradient-to-br from-white to-[#3c7660]/5 overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg text-[#3c7660]">
                    <IoCompass className="w-5 h-5" />
                    Experience Type
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-full overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2">
                    {experienceTypes.map((type) => {
                      const IconComponent = type.icon;
                      return (
                        <Button
                          key={type.value}
                          onClick={() => handleCategoryToggle(type.value)}
                          variant={formData.categories.includes(type.value) ? "default" : "outline"}
                          className={`h-12 p-2 text-xs transition-all duration-200 ${
                            formData.categories.includes(type.value)
                              ? 'bg-[#3c7660] text-white shadow-md border-[#3c7660]'
                              : 'border-gray-200 hover:border-[#3c7660]/50 bg-white'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <IconComponent className={`w-4 h-4 ${
                              formData.categories.includes(type.value) ? 'text-white' : type.color
                            }`} />
                            <span className="font-medium leading-tight">{type.label}</span>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Box 3: Details - Bottom right rectangle (2x2) */}
              <Card className="col-span-2 row-span-2 border-2 border-[#3c7660]/20 rounded-br-2xl shadow-lg bg-gradient-to-br from-white to-[#3c7660]/5 overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg text-[#3c7660]">
                    <IoSettingsOutline className="w-5 h-5" />
                    Adventure Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Location Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <IoLocationOutline className="w-4 h-4 inline mr-1" />
                      Location
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter city or area..."
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className="border-gray-200 focus:border-[#3c7660]"
                    />
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
                          className={`h-16 p-2 text-xs transition-all duration-200 ${
                            formData.duration === option.value
                              ? 'bg-[#3c7660] text-white shadow-md border-[#3c7660]'
                              : 'border-gray-200 hover:border-[#3c7660]/50'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <option.icon className="w-4 h-4" />
                            <span className="font-medium">{option.label}</span>
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
                      placeholder="e.g., $50-100"
                      value={formData.budget}
                      onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                      className="border-gray-200 focus:border-[#3c7660]"
                    />
                  </div>

                  {/* Group Size */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <IoPeople className="w-4 h-4 inline mr-1" />
                      Group Size
                    </label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="Number of people"
                      value={formData.groupSize}
                      onChange={(e) => setFormData(prev => ({ ...prev, groupSize: e.target.value }))}
                      className="border-gray-200 focus:border-[#3c7660]"
                    />
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>

          {/* Generate Button */}
          <div className="text-center w-[80%] mx-auto">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !formData.mood || formData.categories.length === 0 || !formData.location}
              className="bg-gradient-to-r from-[#3c7660] to-[#2d5a48] hover:from-[#2d5a48] hover:to-[#1e3c30] text-white px-12 py-4 rounded-2xl text-lg font-semibold shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
            >
              {isGenerating ? (
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Generating Your Adventure...
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <IoSparkles className="w-5 h-5" />
                  Generate My Adventure
                </div>
              )}
            </Button>
            
            {!user && (
              <p className="text-sm text-gray-500 mt-4">
                Sign in to generate and save your adventures
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
