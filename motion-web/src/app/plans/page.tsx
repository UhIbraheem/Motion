'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  MapPin,
  Clock,
  Star,
  CalendarDays,
  CheckCircle2,
  Plus,
  MoreHorizontal,
  LayoutGrid,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Compass,
  TrendingUp,
  DollarSign,
  Sparkles,
  Award,
  Navigation as NavigationIcon,
  Calendar as CalendarIcon,
  Filter,
  Search
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import AdventureService from '@/services/AdventureService';
import GooglePlacesService from '@/services/GooglePlacesService';
import { SavedAdventure } from '@/types/adventureTypes';
import EnhancedPlansModal from '@/components/EnhancedPlansModal';

export default function PlansPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="pt-20 pb-24 w-[95%] max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-b-2 border-[#3c7660] rounded-full"/>
          </div>
        </main>
      </div>
    }>
      <PlansContent />
    </Suspense>
  );
}

function PlansContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  const [savedAdventures, setSavedAdventures] = useState<SavedAdventure[]>([]);
  const [scheduledAdventures, setScheduledAdventures] = useState<SavedAdventure[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adventurePhotos, setAdventurePhotos] = useState<Record<string, string>>({}); // Cache for fetched photos
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<Record<string, number>>({}); // Track photo index per adventure

  // Modal state
  const [selectedAdventure, setSelectedAdventure] = useState<SavedAdventure | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [highlightedAdventureId, setHighlightedAdventureId] = useState<string | null>(null);
  const [isScheduling, setIsScheduling] = useState(false); // Loading state for scheduling

  // Share to Discover with a quick review
  const handleShare = async (rating: number, text?: string) => {
    if (!selectedAdventure || !user) return;
    try {
      const res = await fetch('/api/community-adventures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, adventureId: selectedAdventure.id, makePublic: true })
      });
      if (!res.ok) throw new Error('Share failed');
      const { communityAdventureId } = await res.json();
      if (communityAdventureId && rating) {
        await fetch('/api/community-adventures/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, communityId: communityAdventureId, rating, text: text || '' })
        });
      }
      toast.success('Shared to Discover');
      setIsModalOpen(false);
    } catch (e) {
      console.error('Share error:', e);
      toast.error('Failed to share');
    }
  };

  // Load adventures
  useEffect(() => {
    console.log('👤 [Plans] useEffect triggered, user:', { hasUser: !!user, userId: user?.id, email: user?.email });
    if (user) {
      console.log('👤 [Plans] User authenticated, calling loadAdventures...');
      loadAdventures();
    } else {
      console.log('👤 [Plans] No user found, setting loading=false');
      setLoading(false);
      setInitialLoadComplete(true);
    }
  }, [user]);

  // Handle highlighting newly saved adventures
  useEffect(() => {
    const highlightId = searchParams.get('highlight');
    if (highlightId) {
      setHighlightedAdventureId(highlightId);
      // Remove highlight after 3 seconds
      const timer = setTimeout(() => {
        setHighlightedAdventureId(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Fetch photos for adventures that don't have them
  useEffect(() => {
    const fetchMissingPhotos = async () => {
      for (const adventure of savedAdventures) {
        // Skip if we already have a photo cached
        if (adventurePhotos[adventure.id]) continue;
        
        // Skip if adventure_photos exists
        if (adventure.adventure_photos?.length > 0 && adventure.adventure_photos[0]?.photo_url) {
          setAdventurePhotos(prev => ({
            ...prev,
            [adventure.id]: adventure.adventure_photos[0].photo_url
          }));
          continue;
        }
        
        // Check steps for existing photo data
        if (adventure.adventure_steps?.length > 0) {
          for (const step of adventure.adventure_steps) {
            const stepData = step as any;
            if (stepData.google_photo_url) {
              setAdventurePhotos(prev => ({
                ...prev,
                [adventure.id]: stepData.google_photo_url
              }));
              break;
            }
            if (stepData.google_places?.photo_url) {
              setAdventurePhotos(prev => ({
                ...prev,
                [adventure.id]: stepData.google_places.photo_url
              }));
              break;
            }
          }
          
          // If still no photo, fetch from Google Places
          if (!adventurePhotos[adventure.id]) {
            const firstStep = adventure.adventure_steps[0] as any;
            if (firstStep?.business_name) {
              console.log('🔍 Fetching photo for:', adventure.custom_title, firstStep.business_name);
              try {
                const placeData = await GooglePlacesService.getPlaceDataWithCache(
                  firstStep.business_name,
                  firstStep.location || adventure.location
                );
                if (placeData?.photo_url) {
                  setAdventurePhotos(prev => ({
                    ...prev,
                    [adventure.id]: placeData.photo_url as string
                  }));
                }
              } catch (err) {
                console.error('Failed to fetch photo:', err);
              }
            }
          }
        }
      }
    };
    
    if (savedAdventures.length > 0) {
      fetchMissingPhotos();
    }
  }, [savedAdventures]);

  const loadAdventures = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('📋 Loading adventures for user:', user.id);
      
      // Use the original working service method
      const adventures = await AdventureService.getUserSavedAdventures(user.id);
      
      console.log('✅ Loaded adventures:', adventures.length);
      console.log('🔍 Adventure completion status:', adventures.map(a => ({ 
        id: a.id, 
        title: a.custom_title, 
        completed: a.is_completed,
        scheduled: a.scheduled_for 
      })));
      
      setSavedAdventures(adventures);
      
      // Filter scheduled adventures
      const scheduled = adventures.filter((adventure: SavedAdventure) => adventure.scheduled_for);
      setScheduledAdventures(scheduled);

    } catch (error) {
      console.error('❌ Error loading adventures:', error);
      setError('Failed to load your adventures. Please try again.');
      toast.error('Failed to load adventures');
    } finally {
      setLoading(false);
      setInitialLoadComplete(true);
    }
  };

  // Enhanced step toggle with backend sync
  const handleStepToggle = async (stepId: string, completed: boolean) => {
    if (!selectedAdventure) return;

    try {
      // Update locally first for immediate feedback
      const updatedSteps = selectedAdventure.adventure_steps.map(step => 
        step.id === stepId ? { ...step, completed } : step
      );
      
      const updatedAdventure = { ...selectedAdventure, adventure_steps: updatedSteps };
      setSelectedAdventure(updatedAdventure);

      // Also update the adventure in the main list for consistency
      setSavedAdventures(prev => prev.map(adv => 
        adv.id === selectedAdventure.id ? updatedAdventure : adv
      ));

      // Sync with backend
      await AdventureService.updateStepCompletion(selectedAdventure.id, stepId, completed);
      
      toast.success(completed ? 'Step completed!' : 'Step unchecked');
      
      // Check if all steps are completed and it's scheduled for today or past
      const allCompleted = updatedSteps.every((step: any) => step.completed);
      const scheduledDate = selectedAdventure.scheduled_for ? new Date(selectedAdventure.scheduled_for) : null;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (allCompleted && scheduledDate && scheduledDate <= today) {
        toast.success('🎉 Adventure ready to complete! You can mark it as finished.', { duration: 5000 });
      }
      
    } catch (error) {
      console.error('Error updating step:', error);
      toast.error('Failed to update step');
      
      // Revert local changes on error
      setSelectedAdventure(selectedAdventure);
      setSavedAdventures(prev => prev.map(adv => 
        adv.id === selectedAdventure.id ? selectedAdventure : adv
      ));
    }
  };

  // Schedule adventure with enhanced error handling and loading state
  const handleSchedule = async (date: Date) => {
    console.log('📅 [Plans] handleSchedule called with date:', date);

    if (!selectedAdventure) {
      console.error('❌ [Plans] No adventure selected for scheduling');
      toast.error('No adventure selected');
      return;
    }

    if (!user) {
      console.error('❌ [Plans] No user found');
      toast.error('Please sign in to schedule adventures');
      return;
    }

    // Validate date is in the future
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const scheduleDate = new Date(date);
    scheduleDate.setHours(0, 0, 0, 0);

    if (scheduleDate < now) {
      toast.error('Please select a future date for your adventure.');
      return;
    }

    console.log('📅 [Plans] Setting isScheduling = true');
    setIsScheduling(true);

    try {
      console.log('📅 [Plans] Scheduling adventure:', {
        id: selectedAdventure.id,
        title: selectedAdventure.custom_title,
        date: date.toISOString(),
        alreadyScheduled: !!selectedAdventure.scheduled_for,
        userId: user.id
      });

      // Handle rescheduling case
      if (selectedAdventure.scheduled_for) {
        const oldDate = new Date(selectedAdventure.scheduled_for).toLocaleDateString();
        const newDate = date.toLocaleDateString();
        console.log(`🔄 [Plans] Rescheduling from ${oldDate} to ${newDate}`);
      }

      console.log('📅 [Plans] Calling AdventureService.scheduleAdventure...');

      // Call service - now returns full updated adventure
      const updatedAdventure = await AdventureService.scheduleAdventure(
        selectedAdventure.id,
        date
      );

      console.log('✅ [Plans] Adventure scheduled successfully:', {
        id: updatedAdventure.id,
        scheduled_for: updatedAdventure.scheduled_for,
        is_scheduled: updatedAdventure.is_scheduled
      });

      // Update selected adventure in modal
      setSelectedAdventure(updatedAdventure);

      // Update in the main adventures list
      setSavedAdventures(prev =>
        prev.map(adv => (adv.id === updatedAdventure.id ? updatedAdventure : adv))
      );

      // Update scheduled adventures list for tab counter
      if (updatedAdventure.scheduled_for) {
        setScheduledAdventures(prev => {
          const exists = prev.find(a => a.id === updatedAdventure.id);
          if (exists) {
            return prev.map(a => a.id === updatedAdventure.id ? updatedAdventure : a);
          } else {
            return [...prev, updatedAdventure];
          }
        });
      }

      // Show success message
      const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      if (selectedAdventure.scheduled_for) {
        toast.success(`Adventure rescheduled to ${formattedDate}! 📅`);
      } else {
        toast.success(`Adventure scheduled for ${formattedDate}! 🎉`);
      }

      // Close the schedule modal
      setShowScheduleModal(false);
      console.log('📅 [Plans] Schedule modal closed');

    } catch (error: any) {
      console.error('❌ [Plans] Scheduling failed:', {
        error: error?.message,
        stack: error?.stack,
        adventureId: selectedAdventure.id,
        name: error?.name
      });

      // Show user-friendly error message
      toast.error(error?.message || 'Failed to schedule adventure. Please try again.', {
        duration: 5000,
      });
    } finally {
      console.log('📅 [Plans] Setting isScheduling = false');
      setIsScheduling(false);
    }
  };

  // Mark adventure as completed
  const handleMarkCompleted = async () => {
    if (!selectedAdventure) return;

    const allStepsCompleted = selectedAdventure.adventure_steps.every((step: any) => step.completed);
    
    if (!allStepsCompleted) {
      toast.error('Please complete all steps first');
      return;
    }

    try {
      // Sync with backend first
      await AdventureService.markAdventureCompleted(selectedAdventure.id);
      
      // Update locally
      const updatedAdventure = { 
        ...selectedAdventure, 
        is_completed: true 
      };
      setSelectedAdventure(updatedAdventure);
      
      toast.success('Adventure completed! 🎉');
      setIsModalOpen(false);
      
      // Reload to sync
      await loadAdventures();
      
    } catch (error: any) {
      console.error('❌ Completion failed:', error);
      toast.error(error?.message || 'Failed to mark as completed');
    }
  };

  // Delete adventure
  const handleDelete = async (adventureToDelete?: SavedAdventure) => {
    const targetAdventure = adventureToDelete || selectedAdventure;
    if (!targetAdventure) return;

    if (!confirm('Are you sure you want to delete this adventure? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('🗑️ Deleting adventure:', targetAdventure.id);
      
      // Remove from backend
      const success = await AdventureService.deleteAdventure(targetAdventure.id);
      
      if (success) {
        toast.success('Adventure deleted successfully');
        setIsModalOpen(false);
        
        // Remove from local state immediately
        setSavedAdventures(prev => prev.filter(a => a.id !== targetAdventure.id));
        setScheduledAdventures(prev => prev.filter(a => a.id !== targetAdventure.id));
        
        // Reload to ensure sync
        await loadAdventures();
      } else {
        throw new Error('Failed to delete adventure');
      }
      
    } catch (error) {
      console.error('Error deleting adventure:', error);
      toast.error('Failed to delete adventure. Please try again.');
    }
  };

  // Duplicate adventure (Do it again)
  const handleDuplicate = async () => {
    if (!selectedAdventure || !user) return;

    try {
      const newAdventureId = await AdventureService.duplicateAdventure(
        selectedAdventure.id,
        user.id
      );
      
      if (newAdventureId) {
        toast.success('🔄 Adventure copied! You can now schedule and plan it again.');
        setIsModalOpen(false);
        
        // Reload adventures to show the new copy
        await loadAdventures();
      } else {
        throw new Error('Failed to duplicate adventure');
      }
    } catch (error) {
      console.error('Error duplicating adventure:', error);
      toast.error('Failed to copy adventure. Please try again.');
    }
  };

  // Open adventure modal
  const openAdventureModal = (adventure: SavedAdventure) => {
    setSelectedAdventure(adventure);
    setIsModalOpen(true);
  };

  // Get adventures filtered by tab
  const getFilteredAdventures = () => {
    switch (activeTab) {
      case 'scheduled':
        // Ordered by soonest to latest scheduled date
        // IMPORTANT: Check BOTH scheduled_for AND is_scheduled flag
        return savedAdventures
          .filter(adventure =>
            adventure.scheduled_for &&
            adventure.is_scheduled === true &&
            !adventure.is_completed
          )
          .sort((a, b) => {
            const dateA = new Date(a.scheduled_for!);
            const dateB = new Date(b.scheduled_for!);
            return dateA.getTime() - dateB.getTime();
          });
      case 'completed':
        // Most recently completed to oldest
        return savedAdventures
          .filter(adventure => adventure.is_completed === true)
          .sort((a, b) => {
            const dateA = new Date(a.saved_at);
            const dateB = new Date(b.saved_at);
            return dateB.getTime() - dateA.getTime();
          });
      case 'all':
      default:
        // All plans ordered by last created (newest first)
        return savedAdventures.sort((a, b) => {
          const dateA = new Date(a.saved_at);
          const dateB = new Date(b.saved_at);
          return dateB.getTime() - dateA.getTime();
        });
    }
  };

  /**
   * Get photo URL with caching and multiple fallbacks
   * Implements localStorage cache with 24hr TTL
   */
  const getAdventurePhoto = (adventure: SavedAdventure): string => {
    const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
    const cacheKey = `motion_photo_${adventure.id}`;

    // Check memory cache first (fastest)
    if (adventurePhotos[adventure.id]) {
      return adventurePhotos[adventure.id];
    }

    // Check localStorage cache
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { url, cachedAt } = JSON.parse(cached);
        if (Date.now() - cachedAt < CACHE_TTL) {
          console.log(`📷 [Photo] Cache hit for ${adventure.id}`);
          // Update memory cache
          setAdventurePhotos(prev => ({ ...prev, [adventure.id]: url }));
          return url;
        } else {
          // Expired, remove it
          localStorage.removeItem(cacheKey);
        }
      }
    } catch (e) {
      console.warn('📷 [Photo] Cache read error:', e);
    }

    // Priority 1: adventure_photos array (database stored photos)
    if (adventure.adventure_photos?.length > 0) {
      for (const photo of adventure.adventure_photos) {
        if (photo.photo_url) {
          const url = photo.photo_url;
          cachePhoto(adventure.id, url);
          return url;
        }
      }
    }

    // Priority 2: First step's primary photo
    if (adventure.adventure_steps?.length > 0) {
      const firstStep = adventure.adventure_steps[0] as any;

      // Check for photos array with primary flag
      if (firstStep.photos?.length > 0) {
        const primaryPhoto = firstStep.photos.find((p: any) => p.isPrimary);
        if (primaryPhoto?.url) {
          cachePhoto(adventure.id, primaryPhoto.url);
          return primaryPhoto.url;
        }
        // Use first photo if no primary
        if (firstStep.photos[0]?.url) {
          cachePhoto(adventure.id, firstStep.photos[0].url);
          return firstStep.photos[0].url;
        }
      }

      // Check google_photo_url
      if (firstStep.google_photo_url) {
        cachePhoto(adventure.id, firstStep.google_photo_url);
        return firstStep.google_photo_url;
      }

      // Check google_places.photo_url
      if (firstStep.google_places?.photo_url) {
        cachePhoto(adventure.id, firstStep.google_places.photo_url);
        return firstStep.google_places.photo_url;
      }

      // Check generic photo_url
      if (firstStep.photo_url) {
        cachePhoto(adventure.id, firstStep.photo_url);
        return firstStep.photo_url;
      }
    }

    // Priority 3: Any step with a photo
    if (adventure.adventure_steps?.length > 0) {
      for (const step of adventure.adventure_steps) {
        const stepData = step as any;

        if (stepData.photos?.length > 0 && stepData.photos[0]?.url) {
          cachePhoto(adventure.id, stepData.photos[0].url);
          return stepData.photos[0].url;
        }

        if (stepData.google_photo_url) {
          cachePhoto(adventure.id, stepData.google_photo_url);
          return stepData.google_photo_url;
        }

        if (stepData.google_places?.photo_url) {
          cachePhoto(adventure.id, stepData.google_places.photo_url);
          return stepData.google_places.photo_url;
        }

        if (stepData.photo_url) {
          cachePhoto(adventure.id, stepData.photo_url);
          return stepData.photo_url;
        }
      }
    }

    // Priority 4: Unsplash generic category image based on adventure location
    const location = adventure.location?.toLowerCase() || '';
    let unsplashQuery = 'adventure';

    if (location.includes('beach') || location.includes('miami') || location.includes('bahamas')) {
      unsplashQuery = 'beach';
    } else if (location.includes('mountain') || location.includes('denver') || location.includes('colorado')) {
      unsplashQuery = 'mountain';
    } else if (location.includes('city') || location.includes('new york') || location.includes('chicago')) {
      unsplashQuery = 'city';
    } else if (location.includes('food') || location.includes('restaurant')) {
      unsplashQuery = 'food';
    }

    const unsplashUrl = `https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&q=80`;

    // Priority 5: Final fallback placeholder
    const fallbackUrl = '/images/adventure-placeholder.png';

    // Try Unsplash first, then fallback
    const finalUrl = unsplashUrl;
    cachePhoto(adventure.id, finalUrl);
    return finalUrl;
  };

  /**
   * Cache photo URL to localStorage and memory
   */
  const cachePhoto = (adventureId: string, url: string) => {
    try {
      const cacheKey = `motion_photo_${adventureId}`;
      localStorage.setItem(cacheKey, JSON.stringify({
        url,
        cachedAt: Date.now()
      }));
      setAdventurePhotos(prev => ({ ...prev, [adventureId]: url }));
    } catch (e) {
      console.warn('📷 [Photo] Cache write error:', e);
    }
  };

  /**
   * Clear expired cache entries on mount
   */
  useEffect(() => {
    const clearExpiredCache = () => {
      const CACHE_TTL = 24 * 60 * 60 * 1000;
      const keysToRemove: string[] = [];

      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith('motion_photo_')) {
            const cached = localStorage.getItem(key);
            if (cached) {
              const { cachedAt } = JSON.parse(cached);
              if (Date.now() - cachedAt >= CACHE_TTL) {
                keysToRemove.push(key);
              }
            }
          }
        }

        keysToRemove.forEach(key => localStorage.removeItem(key));
        if (keysToRemove.length > 0) {
          console.log(`📷 [Photo] Cleared ${keysToRemove.length} expired cache entries`);
        }
      } catch (e) {
        console.warn('📷 [Photo] Cache cleanup error:', e);
      }
    };

    clearExpiredCache();
  }, []);

  // Get all available photos for an adventure
  const getAllAdventurePhotos = (adventure: SavedAdventure): string[] => {
    const photos: string[] = [];

    // Check cache first
    if (adventurePhotos[adventure.id]) {
      photos.push(adventurePhotos[adventure.id]);
    }

    // Check adventure_photos table
    if (adventure.adventure_photos?.length > 0) {
      for (const photo of adventure.adventure_photos) {
        if (photo.photo_url && !photos.includes(photo.photo_url)) {
          photos.push(photo.photo_url);
        }
      }
    }

    // Get photos from all steps
    if (adventure.adventure_steps?.length > 0) {
      for (const step of adventure.adventure_steps) {
        const stepData = step as any;
        const photoUrl = stepData.google_photo_url || stepData.google_places?.photo_url || stepData.photo_url;
        if (photoUrl && !photos.includes(photoUrl)) {
          photos.push(photoUrl);
        }
      }
    }

    // If no photos found, return fallback
    if (photos.length === 0) {
      photos.push('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop');
    }

    return photos;
  };

  // Get up to 3 step photos for card display (one per step)
  const getStepPhotos = (adventure: SavedAdventure): string[] => {
    const photos: string[] = [];

    // Priority 1: Check adventure_photos first (most reliable)
    if (adventure.adventure_photos?.length > 0) {
      for (const photo of adventure.adventure_photos) {
        if (photos.length >= 3) break;
        if (photo.photo_url && !photos.includes(photo.photo_url)) {
          photos.push(photo.photo_url);
        }
      }
    }

    // Priority 2: Get photos from steps (one per step, up to 3)
    if (photos.length < 3 && adventure.adventure_steps?.length > 0) {
      for (const step of adventure.adventure_steps) {
        if (photos.length >= 3) break; // Max 3 photos

        const stepData = step as any;
        const photoUrl = stepData.google_photo_url || stepData.google_places?.photo_url || stepData.photo_url;
        if (photoUrl && !photos.includes(photoUrl)) {
          photos.push(photoUrl);
        }
      }
    }

    // Priority 3: Use cached photo from memory
    if (photos.length === 0 && adventurePhotos[adventure.id]) {
      photos.push(adventurePhotos[adventure.id]);
    }

    // Priority 4: Fallback to a nice location-based image
    if (photos.length === 0) {
      const location = adventure.location?.toLowerCase() || '';
      if (location.includes('beach') || location.includes('miami') || location.includes('ocean')) {
        photos.push('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80'); // Beach
      } else if (location.includes('mountain') || location.includes('hike') || location.includes('trail')) {
        photos.push('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80'); // Mountain
      } else if (location.includes('city') || location.includes('urban') || location.includes('downtown')) {
        photos.push('https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80'); // City
      } else if (location.includes('food') || location.includes('restaurant') || location.includes('cafe')) {
        photos.push('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80'); // Food
      } else {
        photos.push('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80'); // Default adventure
      }
    }

    console.log('📸 [getStepPhotos]', {
      adventureId: adventure.id,
      title: adventure.custom_title,
      photosFound: photos.length,
      photos: photos
    });

    return photos;
  };

  // Navigate photos for a specific adventure
  const navigatePhoto = (adventureId: string, direction: 'prev' | 'next', adventure: SavedAdventure) => {
    const allPhotos = getAllAdventurePhotos(adventure);
    const currentIndex = currentPhotoIndex[adventureId] || 0;
    
    let newIndex: number;
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % allPhotos.length;
    } else {
      newIndex = currentIndex === 0 ? allPhotos.length - 1 : currentIndex - 1;
    }
    
    setCurrentPhotoIndex(prev => ({
      ...prev,
      [adventureId]: newIndex
    }));
  };

  // Calendar event handler
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  // Ultra-modern adventure card with premium design
  const renderAdventureCard = (adventure: SavedAdventure, cardIndex: number) => {
    const stepPhotos = getStepPhotos(adventure); // Get up to 3 step photos
    const hasPhotos = stepPhotos.length > 0;

    const completedSteps = adventure.adventure_steps.filter((step: any) => step.completed).length;
    const totalSteps = adventure.adventure_steps.length;
    const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

    const formatBudget = (cost: string | number | null | undefined) => {
      if (!cost) return '$';
      const costStr = String(cost);
      if (costStr.includes('$')) return costStr;
      if (/^\d+$/.test(costStr)) return `$${costStr}`;
      return `$${costStr}`;
    };

    const budgetPerPerson = formatBudget(adventure.estimated_cost || '$');
    const isHighlighted = highlightedAdventureId === adventure.id;

    return (
      <div
        key={adventure.id}
        className={`group relative overflow-hidden rounded-2xl transition-all duration-500 cursor-pointer border ${
          isHighlighted
            ? 'ring-2 ring-[#f2cc6c] ring-offset-4 shadow-2xl shadow-[#f2cc6c]/30 scale-[1.02] border-[#f2cc6c]'
            : 'hover:scale-[1.02] hover:shadow-2xl border-gray-200/60'
        }`}
        onClick={() => openAdventureModal(adventure)}
      >
        {/* Main Card Container with Apple Glassmorphism */}
        <div className="relative bg-white/90 backdrop-blur-2xl border border-white/30 shadow-xl h-full">

          {/* Hero Image Section - Multiple Photos Grid */}
          <div className="relative h-56 overflow-hidden">
            {hasPhotos ? (
              <div className="absolute inset-0">
                {stepPhotos.length === 1 ? (
                  // Single photo - full width
                  <div className="relative w-full h-full">
                    <Image
                      src={stepPhotos[0]}
                      alt={adventure.custom_title || 'Adventure'}
                      fill
                      className="object-cover transition-all duration-700 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={cardIndex < 3}
                      loading={cardIndex < 3 ? 'eager' : 'lazy'}
                      quality={90}
                    />
                  </div>
                ) : stepPhotos.length === 2 ? (
                  // Two photos - side by side
                  <div className="flex gap-1 h-full">
                    {stepPhotos.map((photo, idx) => (
                      <div key={idx} className="relative flex-1">
                        <Image
                          src={photo}
                          alt={`${adventure.custom_title} - Stop ${idx + 1}`}
                          fill
                          className="object-cover transition-all duration-700 group-hover:scale-110"
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                          priority={cardIndex < 3 && idx === 0}
                          loading={cardIndex < 3 && idx === 0 ? 'eager' : 'lazy'}
                          quality={85}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  // Three photos - grid layout (1 large + 2 small)
                  <div className="flex gap-1 h-full">
                    {/* First photo - takes 60% width */}
                    <div className="relative w-[60%]">
                      <Image
                        src={stepPhotos[0]}
                        alt={`${adventure.custom_title} - Stop 1`}
                        fill
                        className="object-cover transition-all duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 60vw, (max-width: 1200px) 30vw, 20vw"
                        priority={cardIndex < 3}
                        loading={cardIndex < 3 ? 'eager' : 'lazy'}
                        quality={85}
                      />
                    </div>
                    {/* Second and third photos - stacked, 40% width */}
                    <div className="flex flex-col gap-1 w-[40%]">
                      <div className="relative flex-1">
                        <Image
                          src={stepPhotos[1]}
                          alt={`${adventure.custom_title} - Stop 2`}
                          fill
                          className="object-cover transition-all duration-700 group-hover:scale-110"
                          sizes="(max-width: 768px) 40vw, (max-width: 1200px) 20vw, 13vw"
                          loading="lazy"
                          quality={80}
                        />
                      </div>
                      <div className="relative flex-1">
                        <Image
                          src={stepPhotos[2]}
                          alt={`${adventure.custom_title} - Stop 3`}
                          fill
                          className="object-cover transition-all duration-700 group-hover:scale-110"
                          sizes="(max-width: 768px) 40vw, (max-width: 1200px) 20vw, 13vw"
                          loading="lazy"
                          quality={80}
                        />
                      </div>
                    </div>
                  </div>
                )}
                {/* Multi-layer gradient overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-br from-[#3c7660]/10 via-transparent to-[#f2cc6c]/10 pointer-events-none" />
              </div>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#3c7660]/5 via-white to-[#f2cc6c]/5 flex items-center justify-center">
                <Compass className="w-20 h-20 text-[#3c7660]/20 animate-pulse" />
              </div>
            )}

            {/* Step Photos Badge */}
            {stepPhotos.length > 1 && (
              <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-xl rounded-full px-3 py-1.5 shadow-lg border border-white/30">
                <span className="text-white text-xs font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {stepPhotos.length} stops
                </span>
              </div>
            )}

            {/* Top Badges - Status & Actions */}
            <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-10">
              <div className="flex flex-col gap-2">
                {adventure.is_completed && (
                  <Badge className="bg-emerald-500/80 backdrop-blur-xl text-white border border-white/20 shadow-lg shadow-emerald-500/30 text-xs font-semibold">
                    <Award className="mr-1 h-3.5 w-3.5" />
                    Completed
                  </Badge>
                )}
                {adventure.scheduled_for && !adventure.is_completed && (
                  <Badge className="bg-[#3c7660]/70 backdrop-blur-xl border border-white/40 text-white text-xs font-semibold shadow-lg">
                    <CalendarDays className="mr-1 h-3.5 w-3.5" />
                    {new Date(adventure.scheduled_for).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Badge>
                )}
              </div>

              {/* Actions Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-xl rounded-full p-2 shadow-lg border border-white/40 transition-all duration-200 hover:scale-110"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-4 w-4 text-white" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white/95 backdrop-blur-2xl border border-white/40">
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      openAdventureModal(adventure);
                    }}
                    className="cursor-pointer"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Quest Details
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAdventure(adventure);
                      setShowScheduleModal(true);
                    }}
                    className="cursor-pointer"
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    Schedule Adventure
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(adventure);
                    }}
                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Adventure Title Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="space-y-1.5">
                <h3 className="font-bold text-white text-lg leading-tight line-clamp-2 drop-shadow-2xl">
                  {adventure.custom_title || 'Your Adventure'}
                </h3>
                <div className="flex items-center gap-1.5 text-white/90 text-xs">
                  <MapPin className="w-3.5 h-3.5 drop-shadow-lg" />
                  <span className="truncate drop-shadow-lg font-medium">
                    {adventure.location || 'Destination'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card Content - Data Visualization */}
          <div className="p-4 space-y-3">
            
            {/* Progress Visualization - Only for incomplete */}
            {!adventure.is_completed && totalSteps > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 font-medium flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Quest Progress
                  </span>
                  <span className="text-[#3c7660] font-bold">
                    {completedSteps}/{totalSteps} steps
                  </span>
                </div>
                <div className="relative w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#3c7660] to-[#4d987b] rounded-full transition-all duration-700 shadow-sm"
                    style={{ width: `${progress}%` }}
                  />
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </div>
              </div>
            )}

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-2">
              {/* Duration */}
              <div className="bg-gradient-to-br from-[#3c7660]/5 to-transparent rounded-lg p-2.5 border border-[#3c7660]/10">
                <div className="flex items-center gap-1.5 text-gray-600 text-xs font-medium mb-0.5">
                  <Clock className="w-3 h-3" />
                  Duration
                </div>
                <p className="text-base font-bold text-[#3c7660]">
                  {adventure.duration_hours}h
                </p>
              </div>

              {/* Budget */}
              <div className="bg-gradient-to-br from-[#f2cc6c]/5 to-transparent rounded-lg p-2.5 border border-[#f2cc6c]/20">
                <div className="flex items-center gap-1.5 text-gray-600 text-xs font-medium mb-0.5">
                  <DollarSign className="w-3 h-3" />
                  Budget
                </div>
                <p className="text-base font-bold text-[#3c7660]">
                  {budgetPerPerson}
                </p>
              </div>
            </div>

            {/* Action Button */}
            <Button 
              className="w-full bg-gradient-to-r from-[#3c7660] via-[#4d987b] to-[#3c7660] hover:shadow-lg hover:shadow-[#3c7660]/30 text-white font-semibold transition-all duration-300 hover:scale-[1.02] group/btn bg-[length:200%_100%] hover:bg-right"
              onClick={(e) => {
                e.stopPropagation();
                openAdventureModal(adventure);
              }}
            >
              <NavigationIcon className="mr-2 h-4 w-4 group-hover/btn:animate-pulse" />
              Start Quest
            </Button>

            {/* Schedule CTA or Scheduled Date Display */}
            {!adventure.is_completed && (
              <>
                {!adventure.scheduled_for ? (
                  <Button
                    variant="outline"
                    className="w-full border-[#3c7660]/30 text-[#3c7660] hover:bg-[#3c7660]/5 transition-all duration-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAdventure(adventure);
                      setShowScheduleModal(true);
                    }}
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    Schedule This Adventure
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full border-[#3c7660]/30 text-[#3c7660] hover:bg-[#3c7660]/5 transition-all duration-300 justify-between"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAdventure(adventure);
                      setShowScheduleModal(true);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {new Date(adventure.scheduled_for).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <span className="text-xs opacity-60">Reschedule</span>
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Hover Glow Effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#3c7660] via-[#f2cc6c] to-[#3c7660] rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 -z-10" />
      </div>
    );
  };

  // Render calendar view
  const renderCalendarView = () => {
    // Get adventures for selected date
    const getAdventuresForDate = (date: Date): SavedAdventure[] => {
      return scheduledAdventures.filter(adventure => {
        if (!adventure.scheduled_for) return false;
        const adventureDate = new Date(adventure.scheduled_for);
        return adventureDate.toDateString() === date.toDateString();
      });
    };

    const selectedDateAdventures = selectedDate ? getAdventuresForDate(selectedDate) : [];

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <Card className="bg-white/90 backdrop-blur-xl border border-white/40 shadow-md">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-[#3c7660]" />
              Your Adventure Schedule
            </h3>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="rounded-md border-0"
              modifiers={{
                scheduled: scheduledAdventures
                  .filter(a => a.scheduled_for)
                  .map(a => new Date(a.scheduled_for as string))
              }}
              modifiersStyles={{
                scheduled: {
                  backgroundColor: '#3c7660',
                  color: 'white',
                  fontWeight: 'bold'
                }
              }}
            />
            {scheduledAdventures.length === 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-sm text-gray-600">
                  No adventures scheduled yet. Schedule an adventure to see it on the calendar!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected Date Adventures */}
        <Card className="bg-white/90 backdrop-blur-xl border border-white/40 shadow-md">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedDate ?
                `${selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}` :
                'Select a date to view adventures'
              }
            </h3>

            {selectedDate ? (
              <div className="space-y-3">
                {selectedDateAdventures.length > 0 ? (
                  selectedDateAdventures.map(adventure => (
                    <div
                      key={adventure.id}
                      className="p-4 bg-gradient-to-br from-[#f8f2d5] to-white rounded-xl border border-[#3c7660]/20 hover:border-[#3c7660]/40 transition-all cursor-pointer hover:shadow-md"
                      onClick={() => openAdventureModal(adventure)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                            {adventure.custom_title}
                            {adventure.is_completed && (
                              <Badge className="bg-emerald-500 text-white text-xs">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Completed
                              </Badge>
                            )}
                          </h4>
                          <div className="flex items-center text-sm text-gray-600 mb-2">
                            <MapPin className="w-4 h-4 mr-1 text-[#3c7660]" />
                            <span>{adventure.location}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{adventure.duration_hours}h</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              <span>{adventure.estimated_cost}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              <span>{adventure.adventure_steps.filter((s: any) => s.completed).length}/{adventure.adventure_steps.length} steps</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openAdventureModal(adventure);
                          }}
                          className="shrink-0 hover:bg-[#3c7660]/10"
                        >
                          <Eye className="w-4 h-4 text-[#3c7660]" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                      <CalendarDays className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm">
                      No adventures scheduled for this date
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 border-[#3c7660] text-[#3c7660] hover:bg-[#3c7660]/10"
                      onClick={() => setViewMode('grid')}
                    >
                      View All Adventures
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-[#3c7660]/10 to-[#f2cc6c]/10 rounded-full flex items-center justify-center mb-4">
                  <CalendarIcon className="h-10 w-10 text-[#3c7660]" />
                </div>
                <p className="text-gray-600 mb-2 font-medium">
                  Click on a date in the calendar
                </p>
                <p className="text-sm text-gray-500">
                  Dates with scheduled adventures appear in green
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // Show loading only if initial load is not complete
  if (loading && !initialLoadComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-[#f8f2d5]/20 relative">
        <Navigation />
        <div className="pt-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3c7660] mx-auto mb-4"></div>
                <p className="text-[#3c7660] font-medium">Loading your adventures...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white relative">
        <Navigation />
        <div className="pt-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-20">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={loadAdventures} className="bg-[#3c7660] hover:bg-[#2d5a47] text-white">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredAdventures = getFilteredAdventures();

  // Calculate stats
  const completedCount = savedAdventures.filter(a => a.is_completed).length;
  const scheduledCount = scheduledAdventures.length;
  const totalHours = savedAdventures.reduce((sum, a) => sum + (a.duration_hours || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-[#f8f2d5]/20 relative">
      <Navigation />
      
      <div className="pt-20 px-4 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Premium Header with Stats */}
          <div className="mb-10">
            {/* Title Section */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-[#3c7660] to-[#4d987b] bg-clip-text text-transparent">
                  Your Adventure Library
                </h1>
                <p className="text-gray-600 text-lg flex items-center gap-2">
                  {savedAdventures.length === 0 ? (
                    <>
                      <Sparkles className="w-5 h-5 text-[#f2cc6c]" />
                      Start creating your first adventure!
                    </>
                  ) : (
                    <>
                      <Compass className="w-5 h-5 text-[#3c7660]" />
                      {savedAdventures.length} adventure{savedAdventures.length !== 1 ? 's' : ''} ready to explore
                    </>
                  )}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                {/* View Mode Toggle */}
                <div className="flex items-center bg-white rounded-xl p-1.5 shadow-lg border border-gray-100">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={`${
                      viewMode === 'grid' 
                        ? 'bg-gradient-to-r from-[#3c7660] to-[#4d987b] text-white shadow-md' 
                        : 'text-gray-600 hover:text-[#3c7660] hover:bg-[#f8f2d5]/50'
                    } h-9 px-4 transition-all duration-300`}
                  >
                    <LayoutGrid className="h-4 w-4 mr-2" />
                    Grid
                  </Button>
                  <Button
                    variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('calendar')}
                    className={`${
                      viewMode === 'calendar' 
                        ? 'bg-gradient-to-r from-[#3c7660] to-[#4d987b] text-white shadow-md' 
                        : 'text-gray-600 hover:text-[#3c7660] hover:bg-[#f8f2d5]/50'
                    } h-9 px-4 transition-all duration-300`}
                  >
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Calendar
                  </Button>
                </div>
                
                {/* Create New Adventure */}
                <Link href="/create">
                  <Button className="bg-gradient-to-r from-[#3c7660] via-[#4d987b] to-[#3c7660] hover:shadow-xl hover:shadow-[#3c7660]/30 text-white shadow-lg transition-all duration-300 hover:scale-105 h-9 px-6 bg-[length:200%_100%] hover:bg-right">
                    <Plus className="mr-2 h-4 w-4" />
                    New Adventure
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats Cards - Only show if user has adventures */}
            {savedAdventures.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Adventures */}
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-5 border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-3 bg-gradient-to-br from-[#3c7660]/10 to-[#4d987b]/10 rounded-xl">
                      <Compass className="w-6 h-6 text-[#3c7660]" />
                    </div>
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{savedAdventures.length}</p>
                  <p className="text-sm text-gray-600 mt-1">Total Adventures</p>
                </div>

                {/* Completed */}
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-5 border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-3 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-xl">
                      <Award className="w-6 h-6 text-emerald-600" />
                    </div>
                    <Sparkles className="w-5 h-5 text-[#f2cc6c]" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{completedCount}</p>
                  <p className="text-sm text-gray-600 mt-1">Completed</p>
                </div>

                {/* Scheduled */}
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-5 border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-3 bg-gradient-to-br from-[#f2cc6c]/20 to-[#f2cc6c]/10 rounded-xl">
                      <CalendarDays className="w-6 h-6 text-[#3c7660]" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{scheduledCount}</p>
                  <p className="text-sm text-gray-600 mt-1">Scheduled</p>
                </div>

                {/* Total Hours */}
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-5 border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-3 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl">
                      <Clock className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{totalHours}h</p>
                  <p className="text-sm text-gray-600 mt-1">Total Duration</p>
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          {viewMode === 'calendar' ? (
            renderCalendarView()
          ) : (
            <>
              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-lg">
                  <TabsTrigger 
                    value="all" 
                    className="data-[state=active]:bg-[#3c7660] data-[state=active]:text-white"
                  >
                    All ({savedAdventures.length})
                  </TabsTrigger>
                  <TabsTrigger 
                    value="scheduled"
                    className="data-[state=active]:bg-[#3c7660] data-[state=active]:text-white"
                  >
                    Scheduled ({scheduledAdventures.length})
                  </TabsTrigger>
                  <TabsTrigger 
                    value="completed"
                    className="data-[state=active]:bg-[#3c7660] data-[state=active]:text-white"
                  >
                    Completed ({savedAdventures.filter(a => a.is_completed).length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-6">
                  {filteredAdventures.length === 0 ? (
                    <div className="text-center py-20">
                      <div className="mx-auto w-24 h-24 bg-gradient-to-br from-[#3c7660]/10 to-[#f2cc6c]/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
                        <CalendarDays className="h-12 w-12 text-[#3c7660]" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {activeTab === 'scheduled' && 'No scheduled adventures'}
                        {activeTab === 'completed' && 'No completed adventures yet'}
                        {activeTab === 'all' && 'No adventures yet'}
                      </h3>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        {activeTab === 'scheduled' && 'Schedule your saved adventures to start planning your next experience.'}
                        {activeTab === 'completed' && 'Complete some adventures to see them here and share your experiences.'}
                        {activeTab === 'all' && 'Create your first adventure to start exploring like a local.'}
                      </p>
                      <Link href="/create">
                        <Button className="bg-gradient-to-r from-[#3c7660] to-[#4d987b] hover:shadow-lg hover:shadow-[#3c7660]/30 text-white">
                          <Plus className="mr-2 h-4 w-4" />
                          Create Your First Adventure
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredAdventures.map((adventure, index) => renderAdventureCard(adventure, index))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>

  {selectedAdventure && isModalOpen && (
        <EnhancedPlansModal
          adventure={{
            id: selectedAdventure.id,
            title: selectedAdventure.custom_title || 'Your Adventure',
            location: selectedAdventure.location,
            description: selectedAdventure.custom_description || '',
            duration: `${selectedAdventure.duration_hours} hours`,
            difficulty: 'Easy',
            tags: [],
            steps: selectedAdventure.adventure_steps.map((s: any, idx: number) => ({
              id: s.id || `step-${idx}`,
              title: s.title || s.business_name || `Step ${idx + 1}`,
              description: s.notes || s.description || '',
              duration: s.estimated_duration_minutes ? `${s.estimated_duration_minutes} min` : '',
              location: s.location || '',
              business_name: s.business_name,
              rating: s.google_rating || s.rating,
              validated: s.validated,
              step_order: s.step_number || idx + 1,
              completed: s.completed || false,
              time: s.time,
              business_hours: s.business_hours,
              business_phone: s.google_phone || s.business_phone,
              business_website: s.google_website || s.business_website,
              photo_url: s.google_photo_url || s.google_photo_reference || s.photo_url,
              google_places: s.google_places || {
                place_id: s.google_place_id || '',
                name: s.business_name || '',
                address: s.google_address || s.location || '',
                rating: s.google_rating || 0,
                user_rating_count: 0,
                price_level: s.google_price_level || 0,
                types: [],
                photo_url: s.google_photo_url || s.google_photo_reference || '',
                opening_hours: null,
                last_updated: new Date().toISOString()
              },
            })),
            photos: (selectedAdventure.adventure_photos || []).map(p => ({ url: p.photo_url, source: 'user_uploaded' })),
            created_at: selectedAdventure.saved_at,
            scheduled_for: selectedAdventure.scheduled_for,
            is_completed: !!selectedAdventure.is_completed,
            google_places_validated: selectedAdventure.adventure_steps.some((s: any) => s.validated),
          }}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSchedule={(date) => handleSchedule(date)}
          onMarkCompleted={() => handleMarkCompleted()}
          onStepToggle={(stepId, completed) => handleStepToggle(stepId, completed)}
          onDelete={() => handleDelete()}
          onShare={(rating, text) => handleShare(rating, text)}
          onDuplicate={() => handleDuplicate()}
          onUpdate={() => loadAdventures()} // Refresh adventures when modal updates
        />
      )}

      {/* Schedule Modal */}
      <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Adventure</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Select a date for: <span className="font-medium">{selectedAdventure?.custom_title}</span>
            </p>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date()}
              className="rounded-md border"
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowScheduleModal(false);
                  setSelectedDate(undefined);
                }}
                disabled={isScheduling}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedDate && !isScheduling) {
                    handleSchedule(selectedDate);
                    setShowScheduleModal(false);
                    setSelectedDate(undefined);
                  }
                }}
                disabled={!selectedDate || isScheduling}
                className="bg-[#3c7660] hover:bg-[#2a5444] text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isScheduling ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Scheduling...
                  </>
                ) : (
                  'Schedule'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
