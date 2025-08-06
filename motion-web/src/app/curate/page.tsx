"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AdventureFilters from '@/components/AdventureFilters';
import { AdventureFilters as AdventureFiltersType, WebAIAdventureService, GeneratedAdventure } from '@/services/aiService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SubscriptionBadge from '@/components/SubscriptionBadge';
import { IoArrowBack, IoCalendar, IoLocation, IoTime, IoPeople, IoLockClosed } from 'react-icons/io5';
import Link from 'next/link';

const CuratePage: React.FC = () => {
  const { user, canGenerate, canEdit, decrementGeneration, decrementEdit } = useAuth();

  // Initialize filters exactly matching mobile app
  const [filters, setFilters] = useState<AdventureFiltersType>({
    location: '',
    duration: 'half-day',
    budget: 'moderate',
    timeOfDay: 'flexible',
    groupSize: 1,
    radius: 5,
    transportMethod: 'flexible',
    // Phase 1 additions (exactly matching mobile)
    experienceTypes: [],
    dietaryRestrictions: [],
    foodPreferences: [],
    startTime: '10:00',
    endTime: '16:00',
    flexibleTiming: true,
    customEndTime: false,
    // Phase 2 additions (exactly matching mobile)
    otherRestriction: '',
  });

  const [generatedAdventure, setGeneratedAdventure] = useState<GeneratedAdventure | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Scheduling states (exactly matching mobile)
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const aiService = new WebAIAdventureService();

  // Random greeting rotation (exactly matching mobile)
  const greetings = [
    "What's the vibe?",
    "What are you looking for?", 
    "What's the plan?",
    "Ready to explore?",
    "Where to today?",
    "What's calling you?",
    "Adventure awaits...",
    "What sounds good?",
    "Let's get started",
    "Time to discover"
  ];

  const [greeting, setGreeting] = useState(greetings[0]);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * greetings.length);
    setGreeting(greetings[randomIndex]);
  }, []);

  // Smart end time calculation based on duration (exactly matching mobile)
  const calculateEndTime = (startTime: string, duration: string): string => {
    const start = parseInt(startTime.split(':')[0]);
    let hours = 4; // default
    
    switch (duration) {
      case 'quick': hours = 2; break;
      case 'half-day': hours = 6; break;
      case 'full-day': hours = 9; break;
    }
    
    const endHour = start + hours;
    return `${endHour}:00`;
  };

  // Format time for display (24h to 12h) (exactly matching mobile)
  const formatTimeDisplay = (time: string): string => {
    const hour = parseInt(time.split(':')[0]);
    if (hour === 0) return '12:00 AM';
    if (hour < 12) return `${hour}:00 AM`;
    if (hour === 12) return '12:00 PM';
    return `${hour - 12}:00 PM`;
  };

  // Handle start time change with auto end time calculation (exactly matching mobile)
  const handleStartTimeChange = (startTime: string) => {
    const newEndTime = filters.customEndTime ? filters.endTime : calculateEndTime(startTime, filters.duration ?? 'half-day');
    setFilters((prev: AdventureFiltersType) => ({
      ...prev,
      startTime,
      endTime: newEndTime
    }));
  };

  // Handle duration change with auto end time calculation (exactly matching mobile)
  const handleDurationChange = (duration: string) => {
    const newEndTime = filters.customEndTime ? filters.endTime : calculateEndTime(filters.startTime ?? '', duration);
    setFilters((prev: AdventureFiltersType) => ({
      ...prev,
      duration: duration as any,
      endTime: newEndTime
    }));
  };

  // Generate adventure (exactly matching mobile logic)
  const generateAdventure = async () => {
    if (!filters.location || filters.location.trim() === '') {
      setError('Location Required: Please enter your location to generate an adventure.');
      return;
    }

    // Check subscription limits - FEATURE GATING
    if (!user) {
      setError('Sign In Required: Please sign in to generate adventures.');
      return;
    }

    if (!canGenerate()) {
      const tierInfo = user.subscriptionTier === 'free' 
        ? `You've used all ${user.generationsLimit} free generations this month. Upgrade to Explorer ($6/month) for unlimited generations!`
        : 'Generation limit reached for your subscription tier.';
      
      setError(`Generation Limit Reached: ${tierInfo}`);
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    try {
      const result = await aiService.generateAdventure(filters);
      
      if (result.error) {
        setError(`Generation Failed: ${result.error}`);
        return;
      }

      if (result.data) {
        setGeneratedAdventure(result.data);
        // Decrement generation count for free tier users
        await decrementGeneration();
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Reset form (exactly matching mobile)
  const resetForm = () => {
    setGeneratedAdventure(null);
    setError(null);
  };

  // Save adventure (exactly matching mobile logic)
  const saveAdventure = async () => {
    if (!generatedAdventure || !user?.id) {
      setError('Please generate an adventure and make sure you are logged in.');
      return;
    }

    setIsSaving(true);
    
    try {
      const result = await aiService.saveAdventure(
        generatedAdventure, 
        user.id, 
        selectedDate?.toISOString()
      );
      
      if (result.error) {
        setError(`Save Failed: ${result.error}`);
        return;
      }

      const scheduledText = selectedDate 
        ? ` and scheduled for ${selectedDate.toLocaleDateString('en-US', { 
            weekday: 'long',
            month: 'long', 
            day: 'numeric',
            year: 'numeric'
          })}`
        : '';

      // Show success message (web equivalent of mobile Alert)
      alert(`Adventure Saved! "${generatedAdventure.title}" has been saved to your plans${scheduledText}.`);
      resetForm();
    } catch (error) {
      setError('Failed to save adventure. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Date handling functions (exactly matching mobile)
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowDatePicker(false);
    
    // Update the generated adventure with the scheduled date
    if (generatedAdventure) {
      setGeneratedAdventure({
        ...generatedAdventure,
        scheduledFor: date.toISOString(),
      });
    }
  };

  const openDatePicker = () => {
    setShowDatePicker(true);
  };

  // Require authentication to use curate feature
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-[#3c7660]/10 rounded-full flex items-center justify-center mx-auto">
              <IoLockClosed className="w-8 h-8 text-[#3c7660]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-800">Sign in required</h2>
              <p className="text-gray-600">
                You need to be signed in to create personalized adventures
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/auth/signin">
                <Button className="w-full bg-[#3c7660] hover:bg-[#2a5444] text-white">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button variant="outline" className="w-full border-[#3c7660] text-[#3c7660] hover:bg-[#3c7660]/10">
                  Create Account
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Only show filters if no adventure is generated (exactly matching mobile)
  if (!generatedAdventure) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdventureFilters
          greeting={greeting}
          filters={filters}
          setFilters={setFilters}
          isGenerating={isGenerating}
          onGenerateAdventure={generateAdventure}
          onStartTimeChange={handleStartTimeChange}
          onDurationChange={handleDurationChange}
        />

        {/* Subscription Status */}
        <div className="max-w-4xl mx-auto px-4 py-4">
          <SubscriptionBadge />
        </div>

        {error && (
          <div className="max-w-4xl mx-auto px-4">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <p className="text-red-700">{error}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  // Show generated adventure (exactly matching mobile structure)
  if (generatedAdventure) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-4 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={resetForm}
              className="flex items-center gap-2"
            >
              <IoArrowBack className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Your Adventure</h1>
              <p className="text-gray-600">Ready to explore?</p>
            </div>
          </div>

          {/* Adventure Overview */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-[#3c7660] to-[#2a5444] text-white">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">{generatedAdventure.title}</h2>
              <p className="text-lg mb-6 opacity-90">{generatedAdventure.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <IoTime className="w-5 h-5" />
                  <span>{generatedAdventure.estimatedDuration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <IoLocation className="w-5 h-5" />
                  <span>{filters.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <IoPeople className="w-5 h-5" />
                  <span>{filters.groupSize} {filters.groupSize === 1 ? 'person' : 'people'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <IoCalendar className="w-5 h-5" />
                  <span>{generatedAdventure.estimatedCost}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Adventure Steps */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-800">Your Itinerary</h3>
            {generatedAdventure.steps.map((step, index) => (
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-[#3c7660] text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-800">{step.title}</h4>
                        {step.time && (
                          <Badge variant="outline" className="border-[#3c7660] text-[#3c7660]">
                            {step.time}
                          </Badge>
                        )}
                      </div>
                      {step.notes && <p className="text-gray-700 mb-3">{step.notes}</p>}
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <IoLocation className="w-4 h-4" />
                          <span>{step.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Save Adventure */}
          <div className="flex justify-center pt-6">
            <Button
              onClick={saveAdventure}
              disabled={isSaving}
              className="bg-[#f2cc6c] hover:bg-[#e6b85c] text-[#2a5444] font-semibold px-8 py-3"
            >
              {isSaving ? 'Saving...' : 'Save to My Plans'}
            </Button>
          </div>

          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <p className="text-red-700">{error}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default CuratePage;
