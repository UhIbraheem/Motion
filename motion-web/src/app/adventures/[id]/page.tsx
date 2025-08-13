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
import businessPhotosService from '@/services/BusinessPhotosService';
import { IoSparkles, IoRefresh, IoShareSocial, IoChatbubbleEllipses, IoArrowBack, IoImages, IoPencil } from 'react-icons/io5';

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
  const [shareLoading, setShareLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load adventure either from sessionStorage (fresh generation) or fetch from DB if persisted
  useEffect(() => {
    const loadAdventure = async () => {
      if (sessionStorage.getItem('adventure')) {
        setAdventure(JSON.parse(sessionStorage.getItem('adventure')!));
      } else if (id) {
        // Fetch from backend
        const { data, error } = await AdventureService.getAdventureById(id);
        if (data) {
          // Map SavedAdventure to GeneratedAdventure
          setAdventure({
            id: data.id,
            title: data.custom_title || (data as any).description || 'Adventure',
            steps: (data.adventure_steps || []).map((step: any) => ({
              time: '',
              title: step.title,
              location: step.location || '',
              booking: step.business_info ? { method: step.business_info.name } : undefined,
              notes: step.description || '',
            })),
            estimatedDuration: data.duration_hours ? `${data.duration_hours} hours` : '',
            estimatedCost: data.estimated_cost || '',
            createdAt: data.saved_at || '',
            description: data.custom_description || (data as any).description || '',
            location: data.location || '',
            isCompleted: false,
            isFavorite: false,
            filtersUsed: undefined,
            scheduledFor: data.scheduled_for || '',
            rating: data.rating || 0,
            category: '',
          });
        }
        if (error) setError(error);
      }
    };
    loadAdventure();
  }, [id]);
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        if (typeof window !== 'undefined') {
          const raw = sessionStorage.getItem('lastGeneratedAdventure');
          if (raw) {
            const parsed: GeneratedAdventure = JSON.parse(raw);
            setAdventure(parsed);
          }
        }
        if (id && typeof id === 'string') {
          try {
            const res = await fetch(`/api/adventures/photos?adventureId=${id}`);
            if (res.ok) {
              const json = await res.json();
              setPhotos(json.photos || []);
            }
          } catch {}
        }
      } catch (e: any) {
        setError(e.message || 'Failed to load adventure');
      } finally {
        setLoading(false);
      }
    };
    init();
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
          const newPhotos = await businessPhotosService.getAdventurePhotosMulti(descriptors, 2);
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

  const handleShareCommunity = async () => {
    if (!user || !id) return;
    setShareLoading(true);
    try {
      const res = await fetch('/api/community-adventures', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id, adventureId: id, makePublic: true }) });
      if (res.ok) {
        toast.success('Adventure shared to community!');
      } else {
        toast.error('Failed to share adventure.');
      }
    } finally { setShareLoading(false); }
  };

  if (!user) return <div className="min-h-screen bg-gray-50"><Navigation /><main className="pt-16 p-8 text-center">Sign in required.</main></div>;
  if (loading) return <div className="min-h-screen bg-gray-50"><Navigation /><main className="pt-16 p-8 flex items-center justify-center"><div className="animate-spin h-8 w-8 border-b-2 border-[#3c7660] rounded-full"/></main></div>;
  if (error) return <div className="min-h-screen bg-gray-50"><Navigation /><main className="pt-16 p-8 text-center text-red-600">{error}</main></div>;
  if (!adventure) return <div className="min-h-screen bg-gray-50"><Navigation /><main className="pt-16 p-8 text-center">Adventure not found</main></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Navigation />
      <main className="pt-16 pb-24 w-[95%] max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-1 text-gray-600 hover:text-gray-900"><IoArrowBack className="w-4 h-4"/>Back</Button>
          <h1 className="text-2xl font-bold text-gray-900 flex-1">{adventure.title}</h1>
          <Button size="sm" variant="outline" onClick={handleShareCommunity} disabled={shareLoading}>{shareLoading ? 'Sharing...' : (<span className="flex items-center gap-1"><IoShareSocial className="w-4 h-4"/>Share</span>)}</Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            {adventure.steps.map((s, i) => {
              const isActive = i === activeStep;
              return (
                <Card key={i} className={`border ${isActive ? 'border-[#3c7660] shadow-md' : 'border-gray-200'} transition-all`}> 
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2"><Badge variant={isActive ? 'default':'secondary'}>{i+1}</Badge>{s.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" onClick={() => { setActiveStep(i); }}><IoPencil className="w-4 h-4"/></Button>
                      <Button size="sm" variant="ghost" disabled={regenerating} onClick={() => { setActiveStep(i); handleRegenerateStep(); }}><IoRefresh className={`w-4 h-4 ${regenerating && isActive ? 'animate-spin':''}`}/></Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 pb-4">
                    <p className="text-sm text-gray-700 whitespace-pre-line">{s.notes || 'No notes provided.'}</p>
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
            <Card className="border border-gray-200">
              <CardHeader className="pb-2 flex flex-row items-center justify-between"><CardTitle className="text-base flex items-center gap-2"><IoChatbubbleEllipses className="w-4 h-4"/>Reviews</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-gray-500">Share to community to enable reviews.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
