"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  IoLocationOutline,
  IoTimeOutline,
  IoRestaurant,
  IoLeaf,
  IoCamera,
  IoWine,
  IoWalk,
  IoAdd,
  IoSparkles,
  IoHeart,
  IoStar,
  IoTrendingUp,
  IoColorPalette,
  IoMusicalNotes,
  IoGameController,
  IoBookOutline,
  IoCafeOutline,
  IoFitnessOutline,
  IoSchoolOutline
} from 'react-icons/io5';

const moodOptions = [
  { value: 'adventurous', label: 'Adventurous', icon: IoWalk, color: 'text-blue-500', bg: 'bg-blue-50' },
  { value: 'romantic', label: 'Romantic', icon: IoHeart, color: 'text-pink-500', bg: 'bg-pink-50' },
  { value: 'relaxed', label: 'Relaxed', icon: IoLeaf, color: 'text-green-500', bg: 'bg-green-50' },
  { value: 'social', label: 'Social', icon: IoWine, color: 'text-purple-500', bg: 'bg-purple-50' },
  { value: 'cultural', label: 'Cultural', icon: IoCamera, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { value: 'foodie', label: 'Foodie', icon: IoRestaurant, color: 'text-orange-500', bg: 'bg-orange-50' }
];

const activityCategories = [
  { value: 'food', label: 'Food & Dining', icon: IoRestaurant, color: 'text-orange-500' },
  { value: 'nature', label: 'Nature & Outdoors', icon: IoLeaf, color: 'text-green-500' },
  { value: 'culture', label: 'Culture & Arts', icon: IoCamera, color: 'text-purple-500' },
  { value: 'nightlife', label: 'Nightlife', icon: IoWine, color: 'text-pink-500' },
  { value: 'adventure', label: 'Adventure Sports', icon: IoWalk, color: 'text-blue-500' },
  { value: 'wellness', label: 'Wellness & Spa', icon: IoFitnessOutline, color: 'text-teal-500' },
  { value: 'shopping', label: 'Shopping', icon: IoColorPalette, color: 'text-yellow-500' },
  { value: 'music', label: 'Music & Shows', icon: IoMusicalNotes, color: 'text-indigo-500' },
  { value: 'games', label: 'Games & Fun', icon: IoGameController, color: 'text-red-500' },
  { value: 'learning', label: 'Learning & Classes', icon: IoSchoolOutline, color: 'text-blue-600' },
  { value: 'coffee', label: 'Cafes & Coffee', icon: IoCafeOutline, color: 'text-amber-600' },
  { value: 'books', label: 'Books & Reading', icon: IoBookOutline, color: 'text-emerald-600' }
];

const budgetOptions = [
  { value: '$', label: 'Budget-friendly ($)', description: 'Under $50 per person' },
  { value: '$$', label: 'Moderate ($$)', description: '$50-150 per person' },
  { value: '$$$', label: 'Premium ($$$)', description: '$150+ per person' }
];

const durationOptions = [
  { value: '1', label: '1 hour', description: 'Quick experience' },
  { value: '2', label: '2 hours', description: 'Short adventure' },
  { value: '3', label: '3 hours', description: 'Half day' },
  { value: '4', label: '4 hours', description: 'Extended experience' },
  { value: '6', label: '6 hours', description: 'Full day' },
  { value: '8', label: '8+ hours', description: 'All day adventure' }
];

export default function CreatePage() {
  const { user, loading } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    mood: '',
    categories: [] as string[],
    budget: '',
    duration: '',
    location: '',
    description: '',
    timeOfDay: '',
    groupSize: '2'
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until mounted
  if (!mounted) {
    return null;
  }

  const toggleCategory = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleGenerate = async () => {
    // Require auth for actual generation
    if (!user) {
      window.location.href = '/auth/signin';
      return;
    }
    
    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      setIsGenerating(false);
      // In real implementation, this would call the AI service and navigate to results
      console.log('Generated adventure with:', formData);
    }, 3000);
  };

  const isFormValid = formData.mood && formData.categories.length > 0 && formData.budget && formData.duration && formData.location;

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <main className="pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="bg-gradient-to-r from-[#3c7660] to-[#2d5a48] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <IoSparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Create Your Perfect Adventure</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tell us what you're in the mood for, and our AI will craft a personalized experience just for you
            </p>
          </div>

          <div className="space-y-8">
            {/* Step 1: Mood Selection */}
            <Card className="border-2 border-gray-100 rounded-2xl shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="bg-[#3c7660] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</div>
                  What's your mood today?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {moodOptions.map((mood) => {
                    const IconComponent = mood.icon;
                    const isSelected = formData.mood === mood.value;
                    return (
                      <Button
                        key={mood.value}
                        variant="ghost"
                        onClick={() => setFormData(prev => ({ ...prev, mood: mood.value }))}
                        className={`h-auto p-6 rounded-2xl border-2 transition-all duration-200 ${
                          isSelected
                            ? `border-[#3c7660] ${mood.bg} shadow-md scale-105`
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-3">
                          <div className={`p-3 rounded-full ${isSelected ? 'bg-white' : mood.bg}`}>
                            <IconComponent className={`w-6 h-6 ${mood.color}`} />
                          </div>
                          <span className={`font-medium ${isSelected ? 'text-[#3c7660]' : 'text-gray-700'}`}>
                            {mood.label}
                          </span>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Step 2: Activity Categories */}
            <Card className="border-2 border-gray-100 rounded-2xl shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="bg-[#3c7660] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</div>
                  What activities interest you?
                  <Badge variant="secondary" className="ml-2">Select multiple</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {activityCategories.map((category) => {
                    const IconComponent = category.icon;
                    const isSelected = formData.categories.includes(category.value);
                    return (
                      <Button
                        key={category.value}
                        variant="ghost"
                        onClick={() => toggleCategory(category.value)}
                        className={`h-auto p-4 rounded-xl border transition-all duration-200 ${
                          isSelected
                            ? 'border-[#3c7660] bg-[#3c7660]/5 shadow-md'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <IconComponent className={`w-5 h-5 ${isSelected ? 'text-[#3c7660]' : category.color}`} />
                          <span className={`text-xs font-medium text-center ${isSelected ? 'text-[#3c7660]' : 'text-gray-700'}`}>
                            {category.label}
                          </span>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Step 3: Details */}
            <Card className="border-2 border-gray-100 rounded-2xl shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="bg-[#3c7660] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</div>
                  Adventure Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Budget */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Budget Range</label>
                    <div className="space-y-2">
                      {budgetOptions.map((budget) => (
                        <Button
                          key={budget.value}
                          variant="ghost"
                          onClick={() => setFormData(prev => ({ ...prev, budget: budget.value }))}
                          className={`w-full justify-start p-4 h-auto rounded-xl border transition-all duration-200 ${
                            formData.budget === budget.value
                              ? 'border-[#3c7660] bg-[#3c7660]/5 shadow-md'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-left">
                            <div className={`font-medium ${formData.budget === budget.value ? 'text-[#3c7660]' : 'text-gray-900'}`}>
                              {budget.label}
                            </div>
                            <div className="text-sm text-gray-500">{budget.description}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Duration</label>
                    <div className="space-y-2">
                      {durationOptions.map((duration) => (
                        <Button
                          key={duration.value}
                          variant="ghost"
                          onClick={() => setFormData(prev => ({ ...prev, duration: duration.value }))}
                          className={`w-full justify-start p-4 h-auto rounded-xl border transition-all duration-200 ${
                            formData.duration === duration.value
                              ? 'border-[#3c7660] bg-[#3c7660]/5 shadow-md'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-left">
                            <div className={`font-medium ${formData.duration === duration.value ? 'text-[#3c7660]' : 'text-gray-900'}`}>
                              {duration.label}
                            </div>
                            <div className="text-sm text-gray-500">{duration.description}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <div className="relative">
                    <IoLocationOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="Enter your city or neighborhood..."
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className="pl-10 pr-4 py-3 rounded-xl border-gray-300 focus:border-[#3c7660] focus:ring-[#3c7660]"
                    />
                  </div>
                </div>

                {/* Optional: Additional preferences */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <Textarea
                    placeholder="Any specific preferences, dietary restrictions, or special requests..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="resize-none rounded-xl border-gray-300 focus:border-[#3c7660] focus:ring-[#3c7660]"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Generate Button */}
            <div className="text-center pt-4">
              <Button
                onClick={handleGenerate}
                disabled={!isFormValid || isGenerating}
                size="lg"
                className="bg-gradient-to-r from-[#3c7660] to-[#2d5a48] hover:from-[#2d5a48] hover:to-[#1e3d2f] text-white px-12 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Crafting Your Adventure...
                  </>
                ) : (
                  <>
                    <IoSparkles className="w-5 h-5 mr-3" />
                    {user ? 'Generate My Adventure' : 'Sign In to Generate Adventure'}
                  </>
                )}
              </Button>
              
              {!user && (
                <p className="text-sm text-gray-600 mt-3">
                  Complete the form above, then sign in to generate your personalized adventure
                </p>
              )}
              
              {user && !isFormValid && (
                <p className="text-sm text-gray-500 mt-3">
                  Please complete all required fields to generate your adventure
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
