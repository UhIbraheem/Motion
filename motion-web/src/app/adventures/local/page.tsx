"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type GeneratedAdventure } from '@/services/aiService';
import { IoSparkles, IoArrowBack, IoPencil, IoSave, IoCalendarOutline } from 'react-icons/io5';
import { TokenUsageBadge } from '@/components/TokenUsageBadge';

export default function LocalAdventurePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [adventure, setAdventure] = useState<GeneratedAdventure | null>(null);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sessionAdventure = sessionStorage.getItem('lastGeneratedAdventure');
      if (sessionAdventure) {
        const parsed = JSON.parse(sessionAdventure);
        setAdventure(parsed);
      } else {
        // No session data, redirect back to create
        router.push('/create');
      }
    }
  }, [router]);

  const handleSaveAdventure = async () => {
    if (!user || !adventure) return;
    
    setSaving(true);
    try {
      const persistRes = await fetch('/api/adventures', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          userId: user.id, 
          adventure: adventure, 
          persistPhotos: true 
        }) 
      });
      
      if (persistRes.ok) {
        const json = await persistRes.json();
        if (json.adventureId) {
          toast.success('Adventure saved successfully!');
          // Clear the session storage to clean up the create page
          sessionStorage.removeItem('lastGeneratedAdventure');
          // Redirect to plans page with highlight parameter
          router.push(`/plans?highlight=${json.adventureId}`);
          return;
        }
      }
      
      toast.error('Failed to save adventure. Please try again.');
    } catch (error) {
      toast.error('Failed to save adventure. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleScheduleAdventure = async () => {
    // For now, just save the adventure - we can add scheduling UI later
    await handleSaveAdventure();
    toast.success('Adventure saved! You can schedule it from your Plans page.');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="pt-20 p-8 text-center">
          <p className="text-gray-600">Sign in required.</p>
        </main>
      </div>
    );
  }

  if (!adventure) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="pt-20 p-8 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-[#3c7660] rounded-full"/>
        </main>
      </div>
    );
  }

  const currentStep = adventure?.steps?.[activeStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Navigation />
      <main className="pt-20 pb-24 w-[95%] max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.back()} 
            className="gap-1 text-gray-600 hover:text-gray-900"
          >
            <IoArrowBack className="w-4 h-4"/>
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 flex-1 flex items-center gap-2">
            {adventure.title}
            {/* Quality Badge for Google Places Validated Adventures */}
            {(adventure as any).google_places_validated && (
              <Badge variant="outline" className="gap-1 text-green-700 border-green-200 bg-green-50 text-sm">
                <span className="text-green-600">✓</span>
                Verified
              </Badge>
            )}
          </h1>
          <div className="flex gap-2">
            {/* Token Usage Badge */}
            {adventure._meta && (
              <TokenUsageBadge meta={adventure._meta} variant="compact" />
            )}
            <Button 
              onClick={handleSaveAdventure}
              disabled={saving}
              className="bg-[#3c7660] hover:bg-[#3c7660]/90 text-white gap-2"
            >
              <IoSave className="w-4 h-4"/>
              {saving ? 'Saving...' : 'Save to Plans'}
            </Button>
            <Button 
              onClick={handleScheduleAdventure}
              disabled={saving}
              variant="outline"
              className="gap-2"
            >
              <IoCalendarOutline className="w-4 h-4"/>
              Schedule
            </Button>
          </div>
        </div>

        <div className="bg-[#f2cc6c]/20 border border-[#f2cc6c]/30 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <IoSparkles className="w-5 h-5 text-[#3c7660]"/>
            <p className="text-sm text-[#3c7660]">
              <strong>Temporary Adventure:</strong> This adventure is stored locally. Save it to your account to keep it permanently and enable photos.
            </p>
          </div>
        </div>

        {adventure.description && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <p className="text-gray-700">{adventure.description}</p>
              <div className="flex gap-4 mt-4 text-sm text-gray-600">
                {adventure.estimatedDuration && (
                  <span>⏱️ {adventure.estimatedDuration}</span>
                )}
                {adventure.estimatedCost && (
                  <span>💰 {adventure.estimatedCost}</span>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            {adventure.steps.map((step, i) => {
              const isActive = i === activeStep;
              return (
                <Card 
                  key={i} 
                  className={`border ${isActive ? 'border-[#3c7660] shadow-md' : 'border-gray-200'} transition-all cursor-pointer`}
                  onClick={() => setActiveStep(i)}
                > 
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Badge variant={isActive ? 'default' : 'secondary'}>
                        {i + 1}
                      </Badge>
                      <div className="flex flex-col">
                        {/* Primary: Business Name (real place) */}
                        {(step as any).business_name ? (
                          <>
                            <span className="font-semibold text-gray-900">{(step as any).business_name}</span>
                            <span className="text-xs font-normal text-gray-500">{step.title}</span>
                          </>
                        ) : (
                          /* Fallback: Activity Title if no business name */
                          <span className="font-semibold text-gray-900">{step.title}</span>
                        )}
                      </div>
                    </CardTitle>
                    {step.time && (
                      <p className="text-sm text-gray-500">🕐 {step.time}</p>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0 pb-4">
                    <div className="space-y-2">
                      {/* Location and Business Info */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          {step.location && (
                            <p className="text-sm text-gray-600 font-medium">📍 {step.location}</p>
                          )}
                        </div>
                        {/* Rating and Validation Status */}
                        <div className="flex items-center gap-2">
                          {(step as any).rating && (
                            <div className="flex items-center gap-1 text-xs bg-[#f2cc6c]/20 px-2 py-1 rounded-full">
                              <span className="text-[#3c7660]">⭐</span>
                              <span className="font-medium text-[#3c7660]">{(step as any).rating}</span>
                            </div>
                          )}
                          {(step as any).validated && (
                            <div className="flex items-center gap-1 text-xs bg-green-50 px-2 py-1 rounded-full">
                              <span className="text-green-600">✓</span>
                              <span className="text-green-700">Verified</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Business Hours */}
                      {(step as any).business_hours && (
                        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded-md">
                          <strong>Hours:</strong> {(step as any).business_hours}
                        </div>
                      )}
                      
                      {/* Contact Info */}
                      {((step as any).business_phone || (step as any).business_website) && (
                        <div className="flex gap-3 text-xs">
                          {(step as any).business_phone && (
                            <a href={`tel:${(step as any).business_phone}`} className="text-[#3c7660] hover:underline">
                              📞 Call
                            </a>
                          )}
                          {(step as any).business_website && (
                            <a href={(step as any).business_website} target="_blank" rel="noopener noreferrer" className="text-[#3c7660] hover:underline">
                              🌐 Website
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-700 whitespace-pre-line mt-3">
                      {step.notes || 'No additional details provided.'}
                    </p>
                    {step.booking && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs font-medium text-gray-700 mb-1">Booking Info:</p>
                        <p className="text-xs text-gray-600">{step.booking.method}</p>
                        {step.booking.link && (
                          <a 
                            href={step.booking.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-[#3c7660] hover:underline"
                          >
                            Visit Website →
                          </a>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="space-y-4">
            {currentStep && (
              <Card className="border border-gray-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <IoPencil className="w-4 h-4"/>
                    Step {activeStep + 1} Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-1">Activity:</p>
                      <p className="text-sm text-gray-900">{currentStep.title}</p>
                    </div>
                    {currentStep.location && (
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-1">Location:</p>
                        <p className="text-sm text-gray-900">{currentStep.location}</p>
                      </div>
                    )}
                    {currentStep.time && (
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-1">Time:</p>
                        <p className="text-sm text-gray-900">{currentStep.time}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">📸 Photos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-500">
                  Save the adventure to your account to enable photo fetching from Google Places.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
