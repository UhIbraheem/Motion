"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { aiService, type GeneratedAdventure } from '@/services/aiService';
import AdventureService from '@/services/AdventureService';
import { fetchStepPhotos } from '@/services/PlacesPhotoService';
import { IoSparkles, IoRefresh, IoArrowBack, IoImages, IoPencil, IoSave, IoCalendarOutline } from 'react-icons/io5';

interface PersistedPhoto { id?: string; url: string; step_index?: number; photo_order?: number; label?: string; source?: string; }

export default function AdventureDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [adventure, setAdventure] = useState<GeneratedAdventure | null>(null);
  const [photos, setPhotos] = useState<PersistedPhoto[]>([]);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');

  // Load adventure either from sessionStorage (fresh generation) or fetch from DB if persisted
  useEffect(() => {
    const loadAdventure = async () => {
      setLoading(true);
      try {
        // First try sessionStorage for fresh generations
        if (typeof window !== 'undefined') {
          const sessionAdventure = sessionStorage.getItem('lastGeneratedAdventure');
          if (sessionAdventure) {
            const parsed = JSON.parse(sessionAdventure);
            setAdventure(parsed);
            setLoading(false);
            return;
          }
        }

        // If not in session, fetch from database
        if (id) {
          const response = await fetch(`/api/adventures/${id}`);
          if (response.ok) {
            const { adventure: fetchedAdventure } = await response.json();
            setAdventure(fetchedAdventure);
          } else {
            setError('Adventure not found');
          }
        }
      } catch (e: any) {
        setError(e.message || 'Failed to load adventure');
      } finally {
        setLoading(false);
      }
    };

    loadAdventure();
  }, [id]);
  
  // Load photos for the adventure
  useEffect(() => {
    const loadPhotos = async () => {
      if (id && typeof id === 'string') {
        try {
          const res = await fetch(`/api/adventures/photos?adventureId=${id}`);
          if (res.ok) {
            const json = await res.json();
            setPhotos(json.photos || []);
          }
        } catch (error) {
          console.error('Failed to load photos:', error);
        }
      }
    };
    loadPhotos();
  }, [id]);

  const currentStep = adventure?.steps?.[activeStep];
  const stepPhotos = photos.filter(p => p.step_index === activeStep).sort((a,b)=> (a.photo_order||0)-(b.photo_order||0));

  const handleRegenerateStep = useCallback(async () => {
    if (!adventure) return;
    setRegenerating(true);
    try {
      const userRequest = 'Regenerate this step';
      const { step, error } = await aiService.regenerateStep(adventure, activeStep, userRequest);
      if (step) {
        const updated = { ...adventure, steps: adventure.steps.map((s,i)=> i===activeStep ? step : s) };
        setAdventure(updated);
        if (typeof window !== 'undefined') sessionStorage.setItem('lastGeneratedAdventure', JSON.stringify(updated));
        try {
          const descriptors = [{ name: step.title, location: step.location }];
          const newPhotos = await fetchStepPhotos(descriptors, 2);
          if (newPhotos.length) {
            setPhotos(prev => [...prev.filter(p => p.step_index !== activeStep), ...newPhotos.map(p => ({...p, step_index: activeStep}))]);
          }
        } catch {}
        toast.success('Step regenerated!');
      } else {
        toast.error(error || 'Failed to regenerate step');
      }
    } finally {
      setRegenerating(false);
    }
  }, [adventure, activeStep]);

  const handleSaveAdventure = async () => {
    if (!user || !adventure) return;
    
    setSaving(true);
    try {
      // Check if this is a local/temporary adventure
      const isLocalAdventure = id === 'local';
      
      const saveResponse = await fetch('/api/adventures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          adventure: adventure,
          persistPhotos: true
        })
      });

      if (saveResponse.ok) {
        const result = await saveResponse.json();
        toast.success('Adventure saved to your plans!');
        
        // Clear session storage since it's now saved
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('lastGeneratedAdventure');
        }
        
        // If it was a local adventure, navigate to plans page
        // If it was already saved, stay on the adventure page
        if (isLocalAdventure) {
          router.push('/plans');
        } else if (result.adventureId) {
          router.push(`/adventures/${result.adventureId}`);
        }
      } else {
        toast.error('Failed to save adventure');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save adventure');
    } finally {
      setSaving(false);
    }
  };

  const handleScheduleAdventure = async () => {
    if (!user || !adventure) return;
    
    // For now, just save the adventure - we can add scheduling UI later
    await handleSaveAdventure();
    toast.success('Adventure saved! You can schedule it from your Plans page.');
  };

  if (!user) return <div className="min-h-screen bg-gray-50"><Navigation /><main className="pt-20 p-8 text-center">Sign in required.</main></div>;
  if (loading) return <div className="min-h-screen bg-gray-50"><Navigation /><main className="pt-20 p-8 flex items-center justify-center"><div className="animate-spin h-8 w-8 border-b-2 border-[#3c7660] rounded-full"/></main></div>;
  if (error) return <div className="min-h-screen bg-gray-50"><Navigation /><main className="pt-20 p-8 text-center text-red-600">{error}</main></div>;
  if (!adventure) return <div className="min-h-screen bg-gray-50"><Navigation /><main className="pt-20 p-8 text-center">Adventure not found</main></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Navigation />
      <main className="pt-20 pb-24 w-[95%] max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-1 text-gray-600 hover:text-gray-900"><IoArrowBack className="w-4 h-4"/>Back</Button>
          
          {/* Editable Title */}
          {isEditingTitle ? (
            <div className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="text-2xl font-bold text-gray-900 bg-transparent border-b-2 border-[#3c7660] focus:outline-none flex-1"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setAdventure(prev => prev ? {...prev, title: editedTitle} : null);
                    setIsEditingTitle(false);
                  }
                  if (e.key === 'Escape') {
                    setEditedTitle(adventure.title);
                    setIsEditingTitle(false);
                  }
                }}
              />
              <Button size="sm" variant="ghost" onClick={() => {
                setAdventure(prev => prev ? {...prev, title: editedTitle} : null);
                setIsEditingTitle(false);
              }}>
                ✓
              </Button>
              <Button size="sm" variant="ghost" onClick={() => {
                setEditedTitle(adventure.title);
                setIsEditingTitle(false);
              }}>
                ✕
              </Button>
            </div>
          ) : (
            <h1 
              className="text-2xl font-bold text-gray-900 flex-1 cursor-pointer hover:text-[#3c7660] transition-colors"
              onClick={() => {
                setEditedTitle(adventure.title);
                setIsEditingTitle(true);
              }}
              title="Click to edit title"
            >
              {adventure.title}
            </h1>
          )}
          
          <div className="flex gap-2">
            {/* Quality Badge for Google Places Validated Adventures */}
            {(adventure as any).google_places_validated && (
              <Badge variant="outline" className="gap-1 text-green-700 border-green-200 bg-green-50">
                <span className="text-green-600">✓</span>
                Verified Places
              </Badge>
            )}
            <Button size="sm" variant="outline" onClick={handleSaveAdventure} disabled={saving}>
              <IoSave className="w-4 h-4"/>
              {saving ? 'Saving...' : 'Save to Plans'}
            </Button>
            <Button size="sm" variant="default" onClick={handleScheduleAdventure} disabled={saving} className="bg-[#3c7660] hover:bg-[#2d5a48]">
              <IoCalendarOutline className="w-4 h-4"/>
              Schedule
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            {adventure.steps.map((s, i) => {
              const isActive = i === activeStep;
              return (
                <Card key={i} className={`border ${isActive ? 'border-[#3c7660] shadow-md' : 'border-gray-200'} transition-all`}> 
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Badge variant={isActive ? 'default':'secondary'}>{i+1}</Badge>
                      <div className="flex flex-col">
                        {/* Primary: Business Name (real place) */}
                        {s.business_name ? (
                          <>
                            <span className="font-semibold text-gray-900">{s.business_name}</span>
                            <span className="text-xs font-normal text-gray-500">{s.title}</span>
                          </>
                        ) : (
                          /* Fallback: Activity Title if no business name */
                          <span className="font-semibold text-gray-900">{s.title || (s as any).activity}</span>
                        )}
                      </div>
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" onClick={() => { setActiveStep(i); }}><IoPencil className="w-4 h-4"/></Button>
                      <Button size="sm" variant="ghost" disabled={regenerating} onClick={() => { setActiveStep(i); handleRegenerateStep(); }}><IoRefresh className={`w-4 h-4 ${regenerating && isActive ? 'animate-spin':''}`}/></Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 pb-4">
                    <div className="space-y-2">
                      {/* Location and Business Info */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm text-gray-600 font-medium">{s.location}</p>
                          {/* Show business name from step data */}
                          {((s as any).business_name || (s as any).title) && (
                            <p className="text-xs text-gray-500">
                              {(s as any).business_name || (s as any).title}
                            </p>
                          )}
                        </div>
                        {/* Rating and Validation Status */}
                        <div className="flex items-center gap-2">
                          {(s as any).rating && (
                            <div className="flex items-center gap-1 text-xs bg-[#f2cc6c]/20 px-2 py-1 rounded-full">
                              <span className="text-[#3c7660]">⭐</span>
                              <span className="font-medium text-[#3c7660]">{(s as any).rating}</span>
                            </div>
                          )}
                          {(s as any).validated && (
                            <div className="flex items-center gap-1 text-xs bg-green-50 px-2 py-1 rounded-full">
                              <span className="text-green-600">✓</span>
                              <span className="text-green-700">Verified</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Business Hours */}
                      {(s as any).business_hours && (
                        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded-md">
                          <strong>Hours:</strong> {(s as any).business_hours}
                        </div>
                      )}
                      
                      {/* Contact Info */}
                      {((s as any).business_phone || (s as any).business_website) && (
                        <div className="flex gap-3 text-xs">
                          {(s as any).business_phone && (
                            <a href={`tel:${(s as any).business_phone}`} className="text-[#3c7660] hover:underline">
                              📞 {(s as any).business_phone}
                            </a>
                          )}
                          {(s as any).business_website && (
                            <a href={(s as any).business_website} target="_blank" rel="noopener noreferrer" className="text-[#3c7660] hover:underline">
                              🌐 Website
                            </a>
                          )}
                        </div>
                      )}
                      
                      {/* Notes */}
                      <p className="text-sm text-gray-700 whitespace-pre-line pt-1">{s.notes || (s as any).description || 'No notes provided.'}</p>
                    </div>
                    
                    {isActive && stepPhotos.length > 0 && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {stepPhotos.map((p, idx) => (
                          <div key={idx} className="relative w-full aspect-video rounded-xl overflow-hidden border border-gray-200">
                            <img src={p.url} alt={p.label || 'photo'} className="object-cover w-full h-full" />
                            {p.label && <div className="absolute bottom-1 left-1 text-[10px] px-1.5 py-0.5 bg-black/50 text-white rounded-full backdrop-blur-sm">{p.label}</div>}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <div className="space-y-6">
            <Card className="border border-gray-200">
              <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><IoSparkles className="w-4 h-4"/>Refine Step</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <Button size="sm" className="w-full justify-start gap-2" variant="outline" onClick={handleRegenerateStep}>Try a different vibe</Button>
                <Button size="sm" className="w-full justify-start gap-2" variant="outline" onClick={handleRegenerateStep}>I have been here before</Button>
                <Button size="sm" className="w-full justify-start gap-2" variant="outline" onClick={handleRegenerateStep}>I don't like this place</Button>
                <Button size="sm" className="w-full justify-start gap-2" variant="outline" onClick={handleRegenerateStep}>Surprise me with something new</Button>
              </CardContent>
            </Card>
            <Card className="border border-gray-200">
              <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><IoImages className="w-4 h-4"/>Photos</CardTitle></CardHeader>
              <CardContent>
                {stepPhotos.length === 0 && <p className="text-xs text-gray-500">No photos for this step yet.</p>}
                {stepPhotos.length > 0 && <p className="text-xs text-gray-600">{stepPhotos.length} photo(s) fetched from Google Places.</p>}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
