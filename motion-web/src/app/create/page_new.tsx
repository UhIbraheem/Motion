"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import AIFilters from '@/components/AIFilters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  IoLocationOutline,
  IoTimeOutline,
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
  IoRocket,
  IoCheckmarkCircle,
  IoWarning,
  IoCompass,
  IoCash
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
  
  // Usage tracking state
  const [usageStats, setUsageStats] = useState({
    generationsUsed: 8,
    generationsLimit: 15,
    editsUsed: 3,
    editsLimit: 10,
    resetDate: '2025-08-12' // Weekly reset
  });
  
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

  // AI Filters state
  const [aiFilters, setAiFilters] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleCategory = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleGenerate = async () => {
    // Check usage limits
    if (usageStats.generationsUsed >= usageStats.generationsLimit) {
      alert(`You've reached your weekly limit of ${usageStats.generationsLimit} generations. Resets on ${usageStats.resetDate}.`);
      return;
    }

    // Require auth for actual generation
    if (!user) {
      window.location.href = '/auth/signin';
      return;
    }
    
    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      setIsGenerating(false);
      // Update usage stats
      setUsageStats(prev => ({ ...prev, generationsUsed: prev.generationsUsed + 1 }));
      // In real implementation, this would call the AI service and navigate to results
      console.log('Generated adventure with:', { formData, aiFilters });
    }, 3000);
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return formData.mood !== '';
      case 2: return formData.categories.length > 0;
      case 3: return formData.budget !== '' && formData.duration !== '' && formData.location !== '';
      case 4: return true; // AI filters are optional
      default: return false;
    }
  };

  // Don't render anything until mounted
  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Navigation />
      
      <main className="pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header with Usage Stats */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-[#3c7660] to-[#2d5a48] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <IoSparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Create Your Perfect Adventure</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
              Tell us what you're in the mood for, and our AI will craft a personalized experience just for you
            </p>

            {/* Usage Tracking Display */}
            <div className="bg-white rounded-lg p-4 border border-gray-200 max-w-md mx-auto">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <IoRocket className="w-4 h-4 text-[#3c7660]" />
                  <span className="text-sm font-medium text-gray-700">Generations This Week</span>
                </div>
                <span className="text-sm font-bold text-[#3c7660]">
                  {usageStats.generationsUsed}/{usageStats.generationsLimit}
                </span>
              </div>
              <Progress value={usageStats.generationsUsed} max={usageStats.generationsLimit} className="mb-1" />
              <div className="text-xs text-gray-500">
                Resets on {new Date(usageStats.resetDate).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Step {currentStep} of {totalSteps}</span>
              <span className="text-sm text-gray-500">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
            </div>
            <Progress value={currentStep} max={totalSteps} />
          </div>

          {/* Step Content */}
          <div className="space-y-8">
            {/* Step 1: Mood Selection */}
            {currentStep === 1 && (
              <Card className="border-2 border-[#3c7660]/20 rounded-2xl shadow-lg bg-gradient-to-br from-white to-[#3c7660]/5">
                <CardHeader className="pb-6 text-center">
                  <CardTitle className="flex items-center justify-center gap-3 text-2xl text-[#3c7660]">
                    <IoHeart className="w-6 h-6" />
                    What's your mood today?
                  </CardTitle>
                  <p className="text-gray-600 mt-2">Choose the vibe that matches how you're feeling</p>
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
                          className={`h-auto p-6 rounded-2xl border-2 transition-all duration-300 ${
                            isSelected
                              ? `border-[#3c7660] ${mood.bg} shadow-lg scale-105 transform`
                              : 'border-gray-200 hover:border-[#3c7660]/50 hover:shadow-md hover:scale-102'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-3">
                            <div className={`p-3 rounded-full ${isSelected ? 'bg-white shadow-md' : mood.bg}`}>
                              <IconComponent className={`w-6 h-6 ${mood.color}`} />
                            </div>
                            <span className={`font-medium ${isSelected ? 'text-[#3c7660]' : 'text-gray-700'}`}>
                              {mood.label}
                            </span>
                            {isSelected && <IoCheckmarkCircle className="w-5 h-5 text-[#3c7660]" />}
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Activity Categories */}
            {currentStep === 2 && (
              <Card className="border-2 border-[#3c7660]/20 rounded-2xl shadow-lg bg-gradient-to-br from-white to-[#3c7660]/5">
                <CardHeader className="pb-6 text-center">
                  <CardTitle className="flex items-center justify-center gap-3 text-2xl text-[#3c7660]">
                    <IoCompass className="w-6 h-6" />
                    What interests you?
                  </CardTitle>
                  <p className="text-gray-600 mt-2">Select all activities that sound appealing (choose multiple)</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {activityCategories.map((category) => {
                      const IconComponent = category.icon;
                      const isSelected = formData.categories.includes(category.value);
                      return (
                        <Button
                          key={category.value}
                          variant="ghost"
                          onClick={() => toggleCategory(category.value)}
                          className={`h-auto p-4 rounded-2xl border-2 transition-all duration-300 ${
                            isSelected
                              ? 'border-[#3c7660] bg-[#3c7660]/10 shadow-lg scale-105 transform'
                              : 'border-gray-200 hover:border-[#3c7660]/50 hover:shadow-md hover:scale-102'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-3">
                            <div className={`p-2 rounded-full ${isSelected ? 'bg-white shadow-md' : 'bg-gray-50'}`}>
                              <IconComponent className={`w-5 h-5 ${category.color}`} />
                            </div>
                            <span className={`text-sm font-medium ${isSelected ? 'text-[#3c7660]' : 'text-gray-700'}`}>
                              {category.label}
                            </span>
                            {isSelected && <IoCheckmarkCircle className="w-4 h-4 text-[#3c7660]" />}
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                  
                  {formData.categories.length > 0 && (
                    <div className="mt-6 p-4 bg-[#3c7660]/5 rounded-lg border border-[#3c7660]/20">
                      <div className="flex items-center space-x-2 mb-2">
                        <IoCheckmarkCircle className="w-4 h-4 text-[#3c7660]" />
                        <span className="text-sm font-medium text-[#3c7660]">Selected Categories:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.categories.map(cat => {
                          const category = activityCategories.find(c => c.value === cat);
                          return (
                            <Badge key={cat} className="bg-[#3c7660] text-white">
                              {category?.label}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 3: Logistics */}
            {currentStep === 3 && (
              <Card className="border-2 border-[#3c7660]/20 rounded-2xl shadow-lg bg-gradient-to-br from-white to-[#3c7660]/5">
                <CardHeader className="pb-6 text-center">
                  <CardTitle className="flex items-center justify-center gap-3 text-2xl text-[#3c7660]">
                    <IoLocationOutline className="w-6 h-6" />
                    Adventure Details
                  </CardTitle>
                  <p className="text-gray-600 mt-2">Help us customize your perfect experience</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Location */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <IoLocationOutline className="w-4 h-4 text-[#3c7660]" />
                      Where are you looking to explore?
                    </label>
                    <Input
                      placeholder="Enter city, neighborhood, or specific area"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className="rounded-xl border-2 border-gray-200 focus:border-[#3c7660] py-3 px-4"
                    />
                  </div>

                  {/* Budget & Duration Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Budget */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <IoCash className="w-4 h-4 text-[#3c7660]" />
                        What's your budget?
                      </label>
                      <div className="space-y-2">
                        {budgetOptions.map((budget) => (
                          <Button
                            key={budget.value}
                            variant="ghost"
                            onClick={() => setFormData(prev => ({ ...prev, budget: budget.value }))}
                            className={`w-full justify-start p-4 rounded-xl border-2 transition-all ${
                              formData.budget === budget.value
                                ? 'border-[#3c7660] bg-[#3c7660]/10 text-[#3c7660]'
                                : 'border-gray-200 hover:border-[#3c7660]/50'
                            }`}
                          >
                            <div className="text-left">
                              <div className="font-medium">{budget.label}</div>
                              <div className="text-sm text-gray-500">{budget.description}</div>
                            </div>
                            {formData.budget === budget.value && (
                              <IoCheckmarkCircle className="w-5 h-5 text-[#3c7660] ml-auto" />
                            )}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <IoTimeOutline className="w-4 h-4 text-[#3c7660]" />
                        How much time do you have?
                      </label>
                      <div className="space-y-2">
                        {durationOptions.map((duration) => (
                          <Button
                            key={duration.value}
                            variant="ghost"
                            onClick={() => setFormData(prev => ({ ...prev, duration: duration.value }))}
                            className={`w-full justify-start p-4 rounded-xl border-2 transition-all ${
                              formData.duration === duration.value
                                ? 'border-[#3c7660] bg-[#3c7660]/10 text-[#3c7660]'
                                : 'border-gray-200 hover:border-[#3c7660]/50'
                            }`}
                          >
                            <div className="text-left">
                              <div className="font-medium">{duration.label}</div>
                              <div className="text-sm text-gray-500">{duration.description}</div>
                            </div>
                            {formData.duration === duration.value && (
                              <IoCheckmarkCircle className="w-5 h-5 text-[#3c7660] ml-auto" />
                            )}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">
                      Anything else we should know? (Optional)
                    </label>
                    <Textarea
                      placeholder="Special interests, accessibility needs, group preferences..."
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="rounded-xl border-2 border-gray-200 focus:border-[#3c7660] min-h-[100px]"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: AI Filters */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <Card className="border-2 border-[#3c7660]/20 rounded-2xl shadow-lg bg-gradient-to-br from-white to-[#3c7660]/5">
                  <CardHeader className="pb-6 text-center">
                    <CardTitle className="flex items-center justify-center gap-3 text-2xl text-[#3c7660]">
                      <IoSparkles className="w-6 h-6" />
                      AI-Powered Customization
                    </CardTitle>
                    <p className="text-gray-600 mt-2">Fine-tune your adventure with intelligent filters (Optional)</p>
                  </CardHeader>
                  <CardContent>
                    <AIFilters onFiltersChange={setAiFilters} />
                  </CardContent>
                </Card>

                {/* Generation Button */}
                <Card className="border-2 border-[#3c7660] rounded-2xl shadow-lg bg-gradient-to-r from-[#3c7660] to-[#2d5a48]">
                  <CardContent className="p-8 text-center">
                    <div className="text-white mb-6">
                      <IoRocket className="w-12 h-12 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold mb-2">Ready to Generate Your Adventure?</h3>
                      <p className="opacity-90">Our AI will create a personalized experience just for you</p>
                    </div>
                    
                    <Button
                      onClick={handleGenerate}
                      disabled={isGenerating || usageStats.generationsUsed >= usageStats.generationsLimit}
                      className="bg-white text-[#3c7660] hover:bg-gray-100 text-lg px-8 py-4 rounded-xl font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#3c7660] mr-3"></div>
                          Generating Your Adventure...
                        </>
                      ) : usageStats.generationsUsed >= usageStats.generationsLimit ? (
                        <>
                          <IoWarning className="w-5 h-5 mr-2" />
                          Weekly Limit Reached
                        </>
                      ) : (
                        <>
                          <IoSparkles className="w-5 h-5 mr-2" />
                          Generate My Adventure
                        </>
                      )}
                    </Button>

                    {usageStats.generationsUsed >= usageStats.generationsLimit && (
                      <p className="text-white/80 text-sm mt-3">
                        Your weekly limit resets on {new Date(usageStats.resetDate).toLocaleDateString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-6">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-6 py-3 rounded-xl border-2 border-gray-300 hover:border-[#3c7660] disabled:opacity-50"
              >
                Previous Step
              </Button>

              <div className="flex space-x-2">
                {Array.from({ length: totalSteps }, (_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      i + 1 <= currentStep ? 'bg-[#3c7660]' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              {currentStep < totalSteps ? (
                <Button
                  onClick={nextStep}
                  disabled={!isStepValid()}
                  className="px-6 py-3 rounded-xl bg-[#3c7660] hover:bg-[#2d5a48] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-3 rounded-xl border-2 border-[#3c7660] text-[#3c7660] hover:bg-[#3c7660] hover:text-white"
                >
                  Start Over
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
