"use client";

import React, { useState, useEffect, memo, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { usePersistentState } from '@/hooks/usePersistentState';
import { useRouter } from 'next/navigation';
import {
  IoLocationOutline,
  IoRestaurant,
  IoLeaf,
  IoSparkles,
  IoMusicalNotes,
  IoGameController,
  IoBookOutline,
  IoCafeOutline,
  IoFitnessOutline,
  IoSchoolOutline,
  IoTime,
  IoCash,
  IoPeople,
  IoCompass,
  IoColorPalette,
  IoHeart,
  IoNutrition,
  IoGift,
  IoFlash,
  IoFlower
} from 'react-icons/io5';
import { WebAIAdventureService, type AdventureFilters } from '@/services/aiService';
import { experienceTypes as EXPERIENCE_TYPES } from '@/data/experienceTypes';
import { VIBES } from '@/data/vibes';
import { BUDGET_TIERS, detectCurrencyFromLocation, getBudgetPromptText, formatBudgetDisplay, getBudgetRange } from '@/config/budgetConfig';

// Map string icon identifiers from experienceTypes data file to actual components
const experienceIconMap: Record<string, React.ComponentType<any>> = {
  'diamond': IoSparkles,
  'map': IoCompass,
  'leaf': IoLeaf,
  'musical-notes': IoMusicalNotes,
  'person': IoSparkles,
  'library': IoBookOutline,
  'gift': IoSparkles,
  'color-palette': IoColorPalette,
  'restaurant': IoRestaurant,
  'ice-cream': IoCafeOutline,
  'extension-puzzle': IoGameController,
  'body': IoFitnessOutline,
};

// Restrict plan vibes to curated 6 keys only (updated: include special-occasion, replace mindful with elegant)
const PLAN_VIBE_KEYS = ['romantic','chill','spontaneous','trending','elegant','special-occasion'];
const vibeOptions = VIBES.filter(v => PLAN_VIBE_KEYS.includes(v.key)).map(v => ({
  value: v.key,
  label: v.label,
  description: v.shortDescription
}));

const durationOptions = [
  { value: 'short', label: 'Short (≈2 hrs)', description: 'About 1–2 hours', icon: IoTime },
  { value: 'half-day', label: 'Half Day (4–6 hrs)', description: 'Solid half day', icon: IoTime },
  { value: 'full-day', label: 'Full Day (6+ hrs)', description: 'Immersive day arc', icon: IoTime }
];

// Dietary restriction vs preference split
const dietaryRestrictionOptions = [
  { value: 'vegetarian', label: 'Vegetarian', icon: IoLeaf, color: 'text-green-500' },
  { value: 'vegan', label: 'Vegan', icon: IoLeaf, color: 'text-green-600' },
  { value: 'gluten-free', label: 'Gluten Free', icon: IoNutrition, color: 'text-yellow-600' },
  { value: 'dairy-free', label: 'Dairy Free', icon: IoNutrition, color: 'text-blue-500' },
  { value: 'nut-free', label: 'Nut Free', icon: IoNutrition, color: 'text-orange-500' },
  { value: 'halal', label: 'Halal', icon: IoRestaurant, color: 'text-teal-500' },
  { value: 'kosher', label: 'Kosher', icon: IoRestaurant, color: 'text-indigo-500' }
];
const dietaryPreferenceOptions = [
  { value: 'keto', label: 'Keto', icon: IoFitnessOutline, color: 'text-purple-500' },
  { value: 'high-protein', label: 'High Protein', icon: IoFitnessOutline, color: 'text-rose-500' },
  { value: 'low-carb', label: 'Low Carb', icon: IoFitnessOutline, color: 'text-emerald-600' },
  { value: 'sustainable', label: 'Sustainable', icon: IoLeaf, color: 'text-lime-600' },
  { value: 'local-produce', label: 'Local Produce', icon: IoLeaf, color: 'text-green-700' }
];

// Use the centralized budget configuration
const budgetOptions = BUDGET_TIERS.map(tier => ({
  value: tier.id,
  label: tier.label,
  symbol: tier.symbol,
  description: tier.description
}));

interface FormData {
  vibe: string;
  categories: string[]; // experience type ids
  location: string;
  duration: string;
  budget: string;
  groupSize: string;
  radius: string;
  startTime: string;
  endTime: string;
  dietaryRestrictions: string[];
  dietaryPreferences: string[];
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
  // Persistent selections (localStorage) for user convenience
  const defaultFormData: FormData = {
    vibe: '',
    categories: [],
    location: '',
    duration: '',
    budget: '',
    groupSize: '',
  radius: '10',
  startTime: '10:00',
  endTime: '',
    dietaryRestrictions: [],
    dietaryPreferences: []
  };
  
  const [formData, setFormData] = usePersistentState<FormData>('motion:create:form', defaultFormData);

  // Reset form to defaults
  const resetForm = () => {
    setFormData(defaultFormData);
    setLocationInput('');
  };

  // Backward compatibility: ensure newly added arrays exist if older localStorage version
  useEffect(() => {
    setFormData(prev => {
      let changed = false;
      const next: FormData = { ...prev } as FormData;
      if (!Array.isArray(next.dietaryRestrictions)) { next.dietaryRestrictions = []; changed = true; }
      if (!(next as any).dietaryPreferences || !Array.isArray(next.dietaryPreferences)) { (next as any).dietaryPreferences = []; changed = true; }
      return changed ? next : prev;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [locationInput, setLocationInput] = useState(formData.location || '');
  const bgRef = useRef<HTMLDivElement | null>(null);
  const blobRef = useRef<HTMLDivElement | null>(null);

  // Load user usage stats
  useEffect(() => {
    if (user) {
      loadUsageStats();
    }
  }, [user]);

  const loadUsageStats = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/users/${user.id}/usage-stats`);
      if (!res.ok) return;
      const stats: UsageStats = await res.json();
      setUsageStats(stats);
    } catch (error) {
      // silently ignore usage stats load errors
      console.log('Usage stats error, continuing without stats');
    }
  };
  const handleVibeSelect = (vibe: string) => setFormData(prev => ({ ...prev, vibe }));

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => {
      const already = prev.categories.includes(category);
      if (already) {
        return { ...prev, categories: prev.categories.filter(c => c !== category) };
      }
      if (prev.categories.length >= 4) {
        toast.warning('Max 4 experience types');
        return prev;
      }
      return { ...prev, categories: [...prev.categories, category] };
    });
  };

  const handleDietaryToggle = (dietary: string, type: 'restriction' | 'preference') => {
    setFormData(prev => {
      const key = type === 'restriction' ? 'dietaryRestrictions' : 'dietaryPreferences';
      const current = prev[key as 'dietaryRestrictions' | 'dietaryPreferences'];
      const exists = current.includes(dietary);
      return {
        ...prev,
        [key]: exists ? current.filter(d => d !== dietary) : [...current, dietary]
      } as FormData;
    });
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
        radius: formData.radius ? parseInt(formData.radius, 10) : undefined,
        duration: formData.duration === 'short' ? 'quick' : formData.duration === 'half-day' ? 'half-day' : formData.duration === 'full-day' ? 'full-day' : undefined,
        budget: formData.budget ? formData.budget as 'budget' | 'moderate' | 'premium' : undefined,
        dietaryRestrictions: [...formData.dietaryRestrictions, ...formData.dietaryPreferences],
        groupSize: formData.groupSize ? parseInt(formData.groupSize, 10) : undefined,
  experienceTypes: Array.from(new Set([...formData.categories, formData.vibe ? formData.vibe : ''])).filter(Boolean),
  startTime: formData.startTime || undefined,
  endTime: formData.endTime || undefined,
      };

      const { data, error } = await ai.generateAdventure(filters);
      if (error || !data) {
        toast.error('Generation failed. Try adjusting filters.');
      } else {
        // Store the result in sessionStorage for temporary viewing
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('lastGeneratedAdventure', JSON.stringify(data));
        }
        
        // Navigate to temporary adventure view (not saved to database yet)
        toast.success('Adventure created! Save it to your plans when ready.');
        router.push('/adventures/local');
      }
    } catch (error) {
    toast.error('Unexpected error during generation');
    } finally {
      setIsGenerating(false);
    }
  };

  // Sync debounced location input into formData (runs every time locationInput settles)
  useEffect(() => {
    const id = setTimeout(() => {
      setFormData(p => p.location === locationInput ? p : { ...p, location: locationInput });
    }, 250);
    return () => clearTimeout(id);
  }, [locationInput]);

  // Interactive background tracking cursor position (throttled via rAF)
  useEffect(() => {
    const el = bgRef.current;
    if (!el) return;
    let frame = 0;
    const handler = (e: MouseEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        const rect = window.document.documentElement.getBoundingClientRect();
        const xPct = (e.clientX / rect.width) * 100;
        const yPct = (e.clientY / rect.height) * 100;
        el.style.setProperty('--mx', `${xPct}%`);
        el.style.setProperty('--my', `${yPct}%`);
        frame = 0;
      });
    };
    window.addEventListener('mousemove', handler);
    return () => {
      window.removeEventListener('mousemove', handler);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // IMPORTANT: Avoid conditional hook usage; keep all hooks above any early return.
  const experienceButtons = EXPERIENCE_TYPES.filter(et => et.id !== 'special-occasion'); // removed special-occasion (treated as vibe)
  const selectedCount = formData.categories.length;
  const coreProgress = (
    (formData.location ? 0.33 : 0) +
    (formData.vibe ? 0.33 : 0) +
    (formData.categories.length ? 0.34 : 0)
  );
  const experienceTypeColors: Record<string,string> = {
    'hidden-gem':'from-amber-500 to-amber-600',
    'explorer':'from-sky-500 to-sky-600',
    'nature':'from-green-500 to-green-600',
    'partier':'from-pink-500 to-pink-600',
    'solo-freestyle':'from-indigo-500 to-indigo-600',
    'academic-weapon':'from-blue-600 to-blue-700',
    'artsy':'from-purple-500 to-purple-600',
    'foodie-adventure':'from-orange-500 to-orange-600',
    'culture-dive':'from-teal-600 to-teal-700',
    'sweet-treat':'from-fuchsia-500 to-fuchsia-600',
    'puzzle-solver':'from-red-500 to-red-600',
    'wellness':'from-emerald-500 to-emerald-600'
  };

  // Color accents per vibe for richer differentiation
  const planVibeColors: Record<string,{pill:string; dot:string; icon: React.ReactNode}> = {
    'romantic': { pill: 'from-rose-500 to-pink-500', dot: 'from-pink-400 to-rose-500', icon: <IoHeart className="w-3.5 h-3.5"/> },
    'chill': { pill: 'from-sky-400 to-cyan-500', dot: 'from-cyan-400 to-sky-500', icon: <IoCafeOutline className="w-3.5 h-3.5"/> },
    'spontaneous': { pill: 'from-violet-500 to-fuchsia-500', dot: 'from-fuchsia-500 to-violet-500', icon: <IoSparkles className="w-3.5 h-3.5"/> },
  'trending': { pill: 'from-amber-500 to-orange-600', dot: 'from-orange-500 to-amber-500', icon: <IoSparkles className="w-3.5 h-3.5"/> },
    'mindful': { pill: 'from-emerald-500 to-teal-600', dot: 'from-teal-500 to-emerald-600', icon: <IoFlower className="w-3.5 h-3.5"/> },
    'special-occasion': { pill: 'from-indigo-500 to-purple-600', dot: 'from-purple-500 to-indigo-600', icon: <IoGift className="w-3.5 h-3.5"/> }
  };

  if (!user) {
    return null; // safe early return AFTER all hooks declared
  }

  const ExperienceTypeButton = memo(({ id, name, icon }: { id: string; name: string; icon: string; }) => {
    const selected = formData.categories.includes(id);
    const IconComp = experienceIconMap[icon] || IoSparkles;
    return (
      <button
        type="button"
        onClick={() => handleCategoryToggle(id)}
        className={`group relative flex-shrink-0 px-4 h-11 rounded-full text-sm font-medium inline-flex items-center gap-2 border transition-all duration-200 ${selected ? 'bg-gradient-to-r from-[#2d5a48] to-[#3c7660] border-[#2d5a48] text-white shadow-md shadow-[#2d5a48]/30' : 'bg-white/80 border-gray-200 text-gray-700 hover:border-[#3c7660] hover:text-[#2d5a48]'} `}
        aria-pressed={selected}
        aria-label={`Experience type ${name}${selected ? ' selected' : ''}`}
      >
        <span className="relative flex items-center gap-2">
          <span className={`w-7 h-7 rounded-full grid place-items-center text-white text-[11px] font-semibold shadow bg-gradient-to-br ${selected ? 'from-[#2d5a48] to-[#3c7660]' : experienceTypeColors[id] || 'from-[#3c7660] to-[#2d5a48]'} `}>
            <IconComp className="w-3.5 h-3.5" />
          </span>
          {name}
        </span>
      </button>
    );
  });
  ExperienceTypeButton.displayName = 'ExperienceTypeButton';

  const disabledGenerate = isGenerating || !formData.location || formData.categories.length === 0;

  return (
    <TooltipProvider>
      <div className="relative min-h-screen overflow-hidden">
        {/* Animated gradient background */}
        <div ref={bgRef} aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--mx,_20%)_var(--my,_20%),rgba(60,118,96,0.35),transparent_60%),radial-gradient(circle_at_calc(100%-var(--mx,_20%))_30%,rgba(45,90,72,0.30),transparent_55%),radial-gradient(circle_at_50%_80%,rgba(30,60,48,0.30),transparent_60%)] transition-[--mx,--my] duration-300" />
          <div ref={blobRef} className="absolute w-[38rem] h-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#3c7660]/25 via-[#2d5a48]/20 to-transparent blur-3xl opacity-70 mix-blend-multiply animate-pulse" style={{left:'50%',top:'50%'}} />
          <div className="absolute inset-0 backdrop-blur-[2px]" />
        </div>
        <Navigation />
        <main className="pt-20 pb-24">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            {/* Header Card */}
            <Card className="mb-8 border-none shadow-xl bg-white/70 backdrop-blur-md relative overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-[#2d5a48] via-[#3c7660] to-[#2d5a48] bg-clip-text text-transparent flex items-center gap-2">Create an Adventure <IoSparkles className="w-6 h-6 text-[#3c7660]"/></h1>
                    <p className="text-sm md:text-base text-gray-600 mt-2 max-w-xl">Pick a plan vibe (1) + up to 4 experience types. We’ll craft a locally-aware, photo-rich flow.</p>
                  </div>
                  {usageStats ? (
                    <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#3c7660]/90 to-[#2d5a48]/90 text-white px-5 py-2 shadow-md">
                      <IoSparkles className="w-4 h-4" />
                      <span className="text-xs font-medium">{usageStats.generationsUsed}/{usageStats.generationsLimit} generations</span>
                    </div>
                  ) : (
                    <div className="w-40 h-8 rounded-full bg-gray-200/50 animate-pulse" aria-label="Loading usage stats" />
                  )}
                </div>
              </CardHeader>
              <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-amber-200/40 to-yellow-100/40">
                <div className="h-full bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 transition-all" style={{width: `${Math.min(100, Math.round(coreProgress * 100))}%`}} aria-label="Form completion progress" />
              </div>
            </Card>

            {/* Grid Layout */}
            <div className="grid gap-6 md:grid-cols-12 auto-rows-min">
      {/* Location + Budget + Group (left 1/3, spans two rows) */}
    <Card className="md:col-span-4 md:row-span-2 shadow-lg border-gray-100/60 bg-white/70 backdrop-blur-md">
                <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-black"><IoLocationOutline className="w-4 h-4"/>Location & Basics</CardTitle>
                </CardHeader>
        <CardContent className="flex flex-col justify-between gap-4 min-h-[28rem]">
                  <div>
                    <label className="text-xs font-medium text-gray-600 flex items-center gap-1 mb-1">City / Area</label>
                    <Input placeholder="e.g. San Francisco" value={locationInput} onChange={e=>setLocationInput(e.target.value)} className="h-10 text-sm" />
                  </div>
                  
                  {/* Group Size */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 flex items-center gap-1"><IoPeople className="w-3.5 h-3.5"/>Group Size</label>
                    <Input type="number" min={1} max={14} value={formData.groupSize} onChange={e=>setFormData(p=>({...p, groupSize: e.target.value }))} className="h-10 text-sm" placeholder="1-14 people" />
                  </div>

                  {/* Radius and Start Time */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                        <IoCompass className="w-3.5 h-3.5"/>
                        Radius: {formData.radius || '10'} miles
                      </label>
                      <style jsx>{`
                        input[type="range"]::-webkit-slider-thumb {
                          appearance: none;
                          width: 20px;
                          height: 20px;
                          border-radius: 50%;
                          background: #3c7660;
                          cursor: pointer;
                          border: 2px solid white;
                          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                        }
                        input[type="range"]::-moz-range-thumb {
                          width: 20px;
                          height: 20px;
                          border-radius: 50%;
                          background: #3c7660;
                          cursor: pointer;
                          border: 2px solid white;
                          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                        }
                      `}</style>
                      <input 
                        type="range" 
                        min="1" 
                        max="25" 
                        step="1" 
                        value={formData.radius || '10'} 
                        onChange={e=>setFormData(p=>({...p, radius: e.target.value}))} 
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #3c7660 0%, #3c7660 ${((parseInt(formData.radius || '10') - 1) / 24) * 100}%, #e5e7eb ${((parseInt(formData.radius || '10') - 1) / 24) * 100}%, #e5e7eb 100%)`
                        }}
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>1mi</span>
                        <span>13mi</span>
                        <span>25mi</span>
                      </div>
                    </div>
                    <div>
                      {/* 30-min slider from 6:00 to 23:00, with live value and progress fill */}
                      {(() => {
                        const toMinutes = (hhmm: string) => {
                          if (!hhmm) return 600; // 10:00 default
                          const [h, m] = hhmm.split(':').map(Number);
                          return h * 60 + m;
                        };
                        const toHHMM = (min: number) => {
                          const h = Math.floor(min / 60);
                          const m = min % 60;
                          return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
                        };
                        const label = (min: number) => {
                          const h = Math.floor(min / 60);
                          const m = min % 60;
                          const ampm = h >= 12 ? 'PM' : 'AM';
                          const hr12 = ((h + 11) % 12) + 1;
                          return `${hr12}:${m.toString().padStart(2,'0')} ${ampm}`;
                        };
                        const min = 6*60;
                        const max = 23*60;
                        const val = Math.min(Math.max(toMinutes(formData.startTime || '10:00'), min), max);
                        const pct = ((val - min) / (max - min)) * 100;
                        return (
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-xs font-medium text-gray-600 flex items-center gap-1"><IoTime className="w-3.5 h-3.5"/>Start Time</label>
                              <span className="text-[11px] font-semibold text-[#2d5a48]">{label(val)}</span>
                            </div>
                            <style jsx>{`
                              input[type="range"]::-webkit-slider-thumb {
                                appearance: none;
                                width: 20px;
                                height: 20px;
                                border-radius: 50%;
                                background: #3c7660;
                                cursor: pointer;
                                border: 2px solid white;
                                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                              }
                              input[type="range"]::-moz-range-thumb {
                                width: 20px;
                                height: 20px;
                                border-radius: 50%;
                                background: #3c7660;
                                cursor: pointer;
                                border: 2px solid white;
                                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                              }
                            `}</style>
                            <input
                              type="range"
                              min={min}
                              max={max}
                              step={30}
                              value={val}
                              onChange={e=>{
                                const v = parseInt(e.target.value,10);
                                setFormData(p=>({...p, startTime: toHHMM(v)}));
                              }}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                              style={{
                                background: `linear-gradient(to right, #3c7660 0%, #3c7660 ${pct}%, #e5e7eb ${pct}%, #e5e7eb 100%)`
                              }}
                            />
                            <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                              <span>6:00 AM</span>
                              <span>{label(val)}</span>
                              <span>11:00 PM</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Budget - Now has its own full section */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1"><IoCash className="w-3.5 h-3.5"/>Budget</label>
                    <div className="grid grid-cols-3 gap-3 w-full">
                      {budgetOptions.map(opt => {
                        const active = formData.budget === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={()=>setFormData(p=>({...p, budget: active ? '' : opt.value }))}
                            className={`px-3 h-12 rounded-xl text-sm font-medium border flex flex-col items-center justify-center transition w-full ${active ? 'bg-gradient-to-r from-amber-500 to-amber-600 border-amber-500 text-white shadow-md scale-105' : 'bg-white/80 border-gray-200 text-gray-700 hover:border-amber-500 hover:text-amber-600 hover:scale-102'}`}
                            aria-pressed={active}
                          >
                            <span className="text-lg leading-none font-normal">{opt.symbol}</span>
                            <span className="text-xs leading-none mt-1 opacity-80">{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1"><IoTime className="w-3.5 h-3.5"/>Duration</label>
                    <div className="grid grid-cols-3 gap-3">
                      {durationOptions.map(opt => {
                        const active = formData.duration === opt.value;
                        return (
                          <button 
                            key={opt.value} 
                            type="button" 
                            onClick={()=>setFormData(p=>({...p, duration: active ? '' : opt.value}))} 
                            className={`px-3 h-11 rounded-xl text-xs font-medium border transition w-full ${active ? 'bg-[#2d5a48] border-[#2d5a48] text-white shadow-md scale-105' : 'bg-white/80 border-gray-200 text-gray-700 hover:border-[#3c7660] hover:text-[#2d5a48] hover:scale-102'}`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {/* Optional End Time slider */}
                  <div>
                    {(() => {
                      const toMinutes = (hhmm: string) => {
                        if (!hhmm) return 0;
                        const [h, m] = hhmm.split(':').map(Number);
                        return h * 60 + m;
                      };
                      const toHHMM = (min: number) => {
                        const h = Math.floor(min / 60);
                        const m = min % 60;
                        return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
                      };
                      const label = (min: number) => {
                        if (!min) return 'Not set';
                        const h = Math.floor(min / 60);
                        const m = min % 60;
                        const ampm = h >= 12 ? 'PM' : 'AM';
                        const hr12 = ((h + 11) % 12) + 1;
                        return `${hr12}:${m.toString().padStart(2,'0')} ${ampm}`;
                      };
                      const min = 6*60;
                      const max = 23*60;
                      const val = formData.endTime ? Math.min(Math.max(toMinutes(formData.endTime), min), max) : 0;
                      const pct = val ? ((val - min) / (max - min)) * 100 : 0;
                      return (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-medium text-gray-600 flex items-center gap-1"><IoTime className="w-3.5 h-3.5"/>End Time (optional)</label>
                            <span className="text-[11px] font-semibold text-[#2d5a48]">{label(val)}</span>
                          </div>
                          <style jsx>{`
                            input[type="range"]::-webkit-slider-thumb {
                              appearance: none;
                              width: 20px;
                              height: 20px;
                              border-radius: 50%;
                              background: #3c7660;
                              cursor: pointer;
                              border: 2px solid white;
                              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                            }
                            input[type="range"]::-moz-range-thumb {
                              width: 20px;
                              height: 20px;
                              border-radius: 50%;
                              background: #3c7660;
                              cursor: pointer;
                              border: 2px solid white;
                              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                            }
                          `}</style>
                          <input
                            type="range"
                            min={min}
                            max={max}
                            step={30}
                            value={val || min}
                            onChange={e=>{
                              const v = parseInt(e.target.value,10);
                              setFormData(p=>({...p, endTime: toHHMM(v)}));
                            }}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            style={{
                              background: `linear-gradient(to right, #3c7660 0%, #3c7660 ${pct}%, #e5e7eb ${pct}%, #e5e7eb 100%)`
                            }}
                          />
                          <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                            <span>6:00 AM</span>
                            <span>{label(val)}</span>
                            <span>11:00 PM</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>

      {/* Vibe Selector - Enhanced with bigger buttons (right 2/3, top) */}
    <Card className="md:col-span-8 shadow-lg border-gray-100/60 bg-white/70 backdrop-blur-md">
                <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-black"><IoHeart className="w-4 h-4"/>Plan Vibe</CardTitle>
                </CardHeader>
        <CardContent className="pt-0 pb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {vibeOptions.map(v => {
                      const active = formData.vibe === v.value;
                      const colors = planVibeColors[v.value] || { pill: 'from-[#3c7660] to-[#2d5a48]', dot: 'from-[#2d5a48] to-[#3c7660]', icon: <IoSparkles className="w-3.5 h-3.5"/> };
                      return (
                        <button 
                          key={v.value} 
                          type="button" 
                          onClick={()=>handleVibeSelect(active ? '' : v.value)} 
                          className={`group relative px-4 h-11 rounded-full text-sm font-medium inline-flex items-center gap-2 border transition-all duration-200 w-full ${active ? `bg-gradient-to-r ${colors.pill} border-transparent text-white shadow-md shadow-[#2d5a48]/30` : 'bg-white/80 border-gray-200 text-gray-700 hover:border-[#3c7660] hover:text-[#2d5a48]'} `}
                          aria-pressed={active}
                          aria-label={`Plan vibe ${v.label}${active ? ' selected' : ''}`}
                        >
                          <span className="relative flex items-center gap-2">
                            <span className={`w-7 h-7 rounded-full grid place-items-center text-white text-[11px] font-semibold shadow bg-gradient-to-br ${colors.dot} `}>
                              {colors.icon}
                            </span>
                            {v.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

      {/* Dietary (right 2/3, bottom) */}
    <Card className="md:col-span-8 shadow-lg border-gray-100/60 bg-white/70 backdrop-blur-md">
                <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-black"><IoRestaurant className="w-4 h-4"/>Dietary</CardTitle>
                </CardHeader>
        <CardContent className="space-y-4 pt-0 pb-4">
                  <div>
                    <p className="text-[11px] font-medium text-gray-500 mb-1">Restrictions</p>
                    <div className="flex flex-wrap gap-2">
                      {dietaryRestrictionOptions.map(opt => {
                        const active = formData.dietaryRestrictions.includes(opt.value);
                        const IconComp = opt.icon;
                        return (
                          <button key={opt.value} type="button" onClick={()=>handleDietaryToggle(opt.value,'restriction')} className={`px-3 h-9 rounded-full text-xs font-medium border inline-flex items-center gap-1 transition ${active ? 'bg-[#3c7660] border-[#3c7660] text-white shadow-sm' : 'bg-white/80 border-gray-200 text-gray-600 hover:border-[#3c7660] hover:text-[#2d5a48]'}`}>
                            <IconComp className="w-3.5 h-3.5" /> {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-gray-500 mb-1">Preferences</p>
                    <div className="flex flex-wrap gap-2">
                      {dietaryPreferenceOptions.map(opt => {
                        const active = formData.dietaryPreferences.includes(opt.value);
                        const IconComp = opt.icon;
                        return (
                          <button key={opt.value} type="button" onClick={()=>handleDietaryToggle(opt.value,'preference')} className={`px-3 h-9 rounded-full text-xs font-medium border inline-flex items-center gap-1 transition ${active ? 'bg-amber-600 border-amber-600 text-white shadow-sm' : 'bg-white/80 border-gray-200 text-gray-600 hover:border-amber-500 hover:text-amber-600'}`}>
                            <IconComp className="w-3.5 h-3.5" /> {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Experience Types (Full width below) */}
              <Card className="md:col-span-12 shadow-lg border-gray-100/60 bg-white/75 backdrop-blur-xl">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-900"><IoCompass className="w-4 h-4"/>Experience Types</CardTitle>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 font-medium">{selectedCount} selected</span>
                    <button type="button" onClick={()=>setFormData(p=>({...p, categories:[], vibe:'', duration:'', dietaryRestrictions:[], dietaryPreferences:[], budget:'', groupSize:'', radius:'10', startTime:''}))} className="text-xs text-[#2d5a48] hover:underline">Clear All</button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {experienceButtons.map(et => (
                      <ExperienceTypeButton key={et.id} id={et.id} name={et.name} icon={et.icon} />
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="md:col-span-12 shadow-md border-gray-100/60 bg-white/65 backdrop-blur">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2"><IoSparkles className="w-4 h-4"/>Tips</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-gray-600 grid gap-2 md:grid-cols-3">
                  <div><span className="font-medium text-[#2d5a48]">Balance:</span> Mix contrasting types (e.g. Hidden Gem + Nature) for richer pacing.</div>
                  <div><span className="font-medium text-[#2d5a48]">Keep it Tight:</span> 2–4 types usually yields the most cohesive flow.</div>
                  <div><span className="font-medium text-[#2d5a48]">Plan Vibe:</span> Pick one vibe. That sets tone; types fill texture.</div>
                  <div><span className="font-medium text-[#2d5a48]">Photos:</span> We try to fetch real place imagery—precise locations help.</div>
                  <div><span className="font-medium text-[#2d5a48]">Refine Later:</span> You can regenerate individual steps after creation.</div>
                  <div><span className="font-medium text-[#2d5a48]">Dietary:</span> Add restrictions now to avoid unsuitable food steps.</div>
                </CardContent>
              </Card>

              {/* Generate Panel */}
              <Card className="md:col-span-12 shadow-xl border-none bg-gradient-to-r from-[#2d5a48] via-[#3c7660] to-[#2d5a48] text-white">
                <CardContent className="py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <IoSparkles className="w-6 h-6" />
                    <div>
                      <p className="text-sm font-medium">Ready to generate?</p>
                      <p className="text-xs text-white/80">We’ll produce a step-by-step plan with photos and places.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" onClick={resetForm} className="h-12 px-6 rounded-xl bg-transparent border-white/30 text-white hover:bg-white/10 font-medium inline-flex items-center gap-2">
                          Reset Form
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Clear all selections and start over</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button disabled={disabledGenerate} onClick={handleGenerate} className="h-12 px-8 rounded-xl bg-white text-[#2d5a48] hover:bg-white/90 font-semibold inline-flex items-center gap-2 disabled:opacity-60">
                          {isGenerating ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#2d5a48]"></div><span>Generating...</span></> : <><IoSparkles className="w-5 h-5"/><span>Create Adventure</span></>}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Create an AI plan from your selections</TooltipContent>
                    </Tooltip>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
