import React, { useState, useEffect } from 'react';
import { X, MapPin, Clock, Calendar as CalendarIcon, Star, CheckCircle2, Circle, Phone, Globe, ChevronDown, ChevronUp, ExternalLink, RefreshCw, TrendingUp, DollarSign, Navigation, Sparkles, Award, Users, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { toast } from 'sonner';
import Image from 'next/image';
import GooglePlacesService from '@/services/GooglePlacesService';

interface AdventureStep {
  id: string;
  title: string;
  description: string;
  duration: string;
  location: string;
  business_name?: string;
  rating?: number;
  validated?: boolean;
  step_order: number;
  completed?: boolean;
  time?: string; // Step timestamp
  business_hours?: string;
  business_phone?: string;
  business_website?: string;
  photo_url?: string; // Real Google Places photo
  google_places?: {
    place_id: string;
    name: string | { text: string; languageCode: string };
    address: string;
    rating: number;
    user_rating_count: number;
    price_level: number;
    types: string[];
    photo_url: string;
    opening_hours: any;
    google_maps_uri?: string;
    website_uri?: string;
    national_phone_number?: string;
    last_updated: string;
  };
}

interface EnhancedPlansModalProps {
  adventure: {
    id: string;
    title: string;
    location: string;
    description: string;
    duration: string;
    difficulty: string;
    tags: string[];
    steps: AdventureStep[];
    photos: Array<{ url: string; source: string }>;
    created_at: string;
    scheduled_for?: string;
    is_completed: boolean;
    google_places_validated?: boolean;
  };
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (date: Date) => void;
  onMarkCompleted: () => void;
  onStepToggle: (stepId: string, completed: boolean) => void;
  onDelete: () => void;
  onShare: (rating: number, text?: string) => void;
  onDuplicate?: () => void;
  onTitleUpdate?: (newTitle: string) => void;
  onUpdate?: () => void; // Callback to refresh parent state
}

export default function EnhancedPlansModal({
  adventure,
  isOpen,
  onClose,
  onSchedule,
  onMarkCompleted,
  onStepToggle,
  onDelete,
  onShare,
  onDuplicate,
  onTitleUpdate,
  onUpdate
}: EnhancedPlansModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    adventure.scheduled_for ? new Date(adventure.scheduled_for) : undefined
  );
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [shareOpen, setShareOpen] = useState(false);
  const [shareRating, setShareRating] = useState<number>(5);
  const [shareText, setShareText] = useState<string>('');
  const [stepPlacesData, setStepPlacesData] = useState<Record<string, any>>({});
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(adventure.title);
  const [isScheduleSectionOpen, setIsScheduleSectionOpen] = useState(false); // Collapsed by default
  const [tempSelectedDate, setTempSelectedDate] = useState<Date | undefined>(
    adventure.scheduled_for ? new Date(adventure.scheduled_for) : undefined
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(0); // For step navigation
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [draggedStepIndex, setDraggedStepIndex] = useState<number | null>(null);
  const [dragOverStepIndex, setDragOverStepIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const completedSteps = adventure.steps.filter(step => step.completed).length;
  const totalSteps = adventure.steps.length;
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
  const allStepsCompleted = completedSteps === totalSteps;

  // Date-based logic for step completion and marking as complete
  const scheduledDate = adventure.scheduled_for ? new Date(adventure.scheduled_for) : null;
  const today = new Date();
  const isScheduled = !!scheduledDate;
  const isScheduledDateReached = scheduledDate && today >= scheduledDate;
  const canCompleteSteps = isScheduled && isScheduledDateReached && !adventure.is_completed;
  const canMarkComplete = canCompleteSteps && allStepsCompleted;

  const handleScheduleSubmit = () => {
    if (tempSelectedDate) {
      setSelectedDate(tempSelectedDate);
      onSchedule(tempSelectedDate);
      setIsScheduleSectionOpen(false);
      
      // Trigger parent refresh to sync state
      if (onUpdate) {
        onUpdate();
      }
      
      toast.success(`Adventure scheduled for ${tempSelectedDate.toLocaleDateString()}! 🎉`);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setTempSelectedDate(date);
  };

  const handleStepToggle = (stepId: string, completed: boolean) => {
    if (!canCompleteSteps) {
      if (!isScheduled) {
        toast.error('Please schedule this adventure first');
      } else if (!isScheduledDateReached) {
        toast.error('You can only complete steps on or after the scheduled date');
      }
      return;
    }
    onStepToggle(stepId, completed);
  };

  const handleMarkCompleted = () => {
    if (!canMarkComplete) {
      if (!isScheduled) {
        toast.error('Please schedule this adventure first');
      } else if (!isScheduledDateReached) {
        toast.error('You can only mark as complete on or after the scheduled date');
      } else if (!allStepsCompleted) {
        toast.error('Please complete all steps first');
      }
      return;
    }

    // Show celebration toast
    toast.success('🎉 Adventure completed!', {
      description: `Congratulations on completing "${adventure.title}"! Your adventure has been saved to your completed plans.`,
      duration: 5000,
    });

    onMarkCompleted();

    // Close modal after a brief delay to show the celebration
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const handleTitleSave = async () => {
    if (editedTitle.trim() && editedTitle !== adventure.title && onTitleUpdate) {
      try {
        await onTitleUpdate(editedTitle.trim());
        setIsEditingTitle(false);
        toast.success('Title updated successfully!');
      } catch (error) {
        console.error('Error updating title:', error);
        toast.error('Failed to update title');
        setEditedTitle(adventure.title); // Reset to original
      }
    } else {
      setIsEditingTitle(false);
      setEditedTitle(adventure.title); // Reset if no changes
    }
  };

  const handleTitleCancel = () => {
    setEditedTitle(adventure.title);
    setIsEditingTitle(false);
  };

  const toggleStepExpansion = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  // Fetch Google Places data AND photos for steps
  useEffect(() => {
    const fetchPlacesData = async () => {
      const fetchPromises = adventure.steps
        .filter(step => step.business_name && !stepPlacesData[step.id])
        .map(async (step) => {
          try {
            if (!step.business_name) return null;
            
            const placeData = await GooglePlacesService.getPlaceDataWithCache(
              step.business_name,
              step.location
            );
            
            if (placeData) {
              // Fetch multiple photos if available
              let photos: string[] = [];
              const placeDataAny = placeData as any;
              
              if (placeDataAny.photos && Array.isArray(placeDataAny.photos) && placeDataAny.photos.length > 0) {
                // Get up to 3 photos
                photos = placeDataAny.photos.slice(0, 3).map((photo: any) => photo.url || photo);
              } else if (placeData.photo_url) {
                photos = [placeData.photo_url];
              }
              
              return { 
                stepId: step.id, 
                placeData: {
                  ...placeData,
                  photos // Array of photo URLs
                }
              };
            }
          } catch (error) {
            console.error('Error fetching place data for step:', step.id, error);
          }
          return null;
        });

      const results = await Promise.all(fetchPromises);
      
      const newPlacesData: Record<string, any> = {};
      results.forEach(result => {
        if (result) {
          newPlacesData[result.stepId] = result.placeData;
        }
      });

      if (Object.keys(newPlacesData).length > 0) {
        setStepPlacesData(prev => ({
          ...prev,
          ...newPlacesData
        }));
      }
    };

    if (adventure.steps.length > 0) {
      fetchPlacesData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adventure.id]); // Only run when adventure changes

  const getStepPhotos = (step: AdventureStep): string[] => {
    // Get multiple photos for the step
    const photos: string[] = [];
    
    // Priority 1: stepPlacesData photos array (freshly fetched)
    if (stepPlacesData[step.id]?.photos && Array.isArray(stepPlacesData[step.id].photos)) {
      photos.push(...stepPlacesData[step.id].photos);
    }
    
    // Priority 2: google_places.photo_url from database
    if (step.google_places?.photo_url && !photos.includes(step.google_places.photo_url)) {
      photos.push(step.google_places.photo_url);
    }
    
    // Priority 3: step.photo_url
    if (step.photo_url && !photos.includes(step.photo_url)) {
      photos.push(step.photo_url);
    }
    
    // Priority 4: stepPlacesData single photo_url
    if (stepPlacesData[step.id]?.photo_url && !photos.includes(stepPlacesData[step.id].photo_url)) {
      photos.push(stepPlacesData[step.id].photo_url);
    }
    
    // Return up to 3 photos, or fallback if none found
    if (photos.length > 0) {
      return photos.slice(0, 3);
    }
    
    return [`https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop`];
  };

  const getStepPhoto = (step: AdventureStep) => {
    // Get first photo from the array
    return getStepPhotos(step)[0];
  };

  const getGoogleMapsLink = (step: AdventureStep) => {
    // Priority: google_places.google_maps_uri > constructed place_id link
    const googleMapsUri = step.google_places?.google_maps_uri;
    if (googleMapsUri) return googleMapsUri;

    const placeId = step.google_places?.place_id || stepPlacesData[step.id]?.place_id;
    if (placeId) {
      return `https://www.google.com/maps/place/?q=place_id:${placeId}`;
    }

    // Fallback to search query
    const query = encodeURIComponent(`${step.business_name || step.title} ${step.location || ''}`);
    return `https://www.google.com/maps/search/${query}`;
  };

  const extractCountyOrLocality = (address?: string): string | null => {
    if (!address) return null;

    // Extract county/locality from formatted address
    // Format is usually: "123 Street, City, State ZIP, Country"
    const parts = address.split(',').map(p => p.trim());

    // Return the second-to-last or last meaningful part (usually city/county)
    if (parts.length >= 2) {
      // If we have "City, State ZIP" format, return the city
      const cityPart = parts[parts.length - 2];
      // Remove ZIP codes and return clean city/county name
      return cityPart.replace(/\d{5}(-\d{4})?/, '').trim();
    }

    return null;
  };

  const handleStepNavigation = (newIndex: number) => {
    if (newIndex === currentStepIndex || newIndex < 0 || newIndex >= adventure.steps.length) {
      return;
    }

    // Determine slide direction
    setSlideDirection(newIndex > currentStepIndex ? 'left' : 'right');

    // Change step after a brief delay to allow animation
    setTimeout(() => {
      setCurrentStepIndex(newIndex);
      setSlideDirection(null);
    }, 300);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedStepIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStepIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverStepIndex(null);
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedStepIndex === null || draggedStepIndex === dropIndex) {
      setDraggedStepIndex(null);
      setDragOverStepIndex(null);
      return;
    }

    // Ask for confirmation
    const confirmed = window.confirm(
      `Swap step ${draggedStepIndex + 1} with step ${dropIndex + 1}?\n\nThis will reorder your adventure.`
    );

    if (!confirmed) {
      setDraggedStepIndex(null);
      setDragOverStepIndex(null);
      return;
    }

    // Swap the steps
    const sortedSteps = [...adventure.steps].sort((a, b) => a.step_order - b.step_order);
    const draggedStep = sortedSteps[draggedStepIndex];
    const droppedStep = sortedSteps[dropIndex];

    // Swap step_order values
    const tempOrder = draggedStep.step_order;
    draggedStep.step_order = droppedStep.step_order;
    droppedStep.step_order = tempOrder;

    try {
      // TODO: Add API call to update step orders in database
      // await updateStepOrders(adventure.id, [draggedStep, droppedStep]);

      toast.success('Steps reordered!', {
        description: `Moved step ${draggedStepIndex + 1} to position ${dropIndex + 1}`
      });

      // Trigger parent update if available
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error reordering steps:', error);
      toast.error('Failed to reorder steps');
    }

    setDraggedStepIndex(null);
    setDragOverStepIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedStepIndex(null);
    setDragOverStepIndex(null);
  };

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-300 my-8">
        {/* Premium Header */}
        <div className="sticky top-0 bg-gradient-to-br from-white via-white to-[#f8f2d5]/30 border-b border-gray-100 px-8 py-6 flex items-center justify-between rounded-t-3xl z-10 backdrop-blur-sm">
          <div className="flex-1 mr-4">
            {/* Editable Title */}
            {isEditingTitle ? (
              <div className="flex items-center gap-3 mb-2">
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="text-3xl font-bold text-gray-900 bg-white/50 backdrop-blur-sm border-2 border-[#f2cc6c] rounded-xl px-4 py-2 focus:outline-none focus:border-[#3c7660] focus:ring-2 focus:ring-[#3c7660]/20 transition-all flex-1"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleTitleSave();
                    if (e.key === 'Escape') handleTitleCancel();
                  }}
                />
                <Button
                  size="sm"
                  onClick={handleTitleSave}
                  className="bg-white/40 backdrop-blur-md border border-[#3c7660]/30 text-[#3c7660] hover:bg-[#3c7660]/10 hover:border-[#3c7660] hover:shadow-lg transition-all px-6"
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleTitleCancel}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3 mb-2">
                <h2 
                  className="text-3xl font-bold cursor-pointer transition-all inline-block bg-gradient-to-r from-[#3c7660] to-[#4d987b] bg-clip-text text-transparent hover:from-[#2d5a47] hover:to-[#3c7660]"
                  onClick={() => setIsEditingTitle(true)}
                  title="Click to edit title"
                >
                  {adventure.title}
                </h2>
                <span className="text-sm text-gray-400 italic">Click to edit</span>
              </div>
            )}
            
            <div className="flex items-center gap-5 text-sm">
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1.5 border border-gray-100">
                <MapPin className="w-4 h-4 text-[#3c7660]" />
                <span className="font-medium text-gray-700">{adventure.location}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1.5 border border-gray-100">
                <Clock className="w-4 h-4 text-[#3c7660]" />
                <span className="font-medium text-gray-700">{adventure.duration}</span>
              </div>
              {adventure.google_places_validated && (
                <Badge className="bg-white/40 backdrop-blur-md border border-emerald-500/30 text-emerald-700 shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose} 
            className="hover:bg-gray-100/80 backdrop-blur-sm rounded-full p-2.5 transition-all hover:scale-110"
          >
            <X className="w-5 h-5 text-gray-600" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(92vh-120px)] px-8 py-6 bg-gradient-to-br from-gray-50/50 via-white to-[#f8f2d5]/20">
          {/* Premium Progress Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#3c7660]" />
                Quest Progress
              </span>
              <span className="text-sm font-bold text-[#3c7660]">{completedSteps}/{totalSteps} steps</span>
            </div>
            <div className="relative w-full bg-gray-100 rounded-full h-3 overflow-hidden border border-gray-200 shadow-inner">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#3c7660] to-[#4d987b] rounded-full transition-all duration-700 shadow-sm" 
                style={{ width: `${progressPercentage}%` }}
              />
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
          </div>

          {/* Compact Status Row */}
          <div className="mb-6 flex items-center justify-between gap-4 bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-100 shadow-md">
            {/* Status Badge */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-[#3c7660]/10 to-[#4d987b]/10 rounded-lg">
                {adventure.is_completed ? (
                  <Award className="w-4 h-4 text-emerald-600" />
                ) : isScheduled ? (
                  <CalendarIcon className="w-4 h-4 text-[#3c7660]" />
                ) : (
                  <Sparkles className="w-4 h-4 text-[#f2cc6c]" />
                )}
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Status</p>
                {adventure.is_completed ? (
                  <Badge className="bg-emerald-50 border-emerald-200 text-emerald-700 text-xs">
                    <Award className="w-3 h-3 mr-1" />
                    Completed
                  </Badge>
                ) : isScheduled ? (
                  <Badge className="bg-blue-50 border-blue-200 text-blue-700 text-xs">
                    <CalendarIcon className="w-3 h-3 mr-1" />
                    Scheduled{scheduledDate && ` • ${scheduledDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                  </Badge>
                ) : (
                  <Badge className="bg-gray-50 border-gray-200 text-gray-600 text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    Planning
                  </Badge>
                )}
              </div>
            </div>

            {/* Progress Badge */}
            <div className="flex items-center gap-3">
              <div>
                <p className="text-xs text-gray-500 font-medium text-right">Progress</p>
                {canCompleteSteps ? (
                  <Badge className="bg-emerald-50 border-emerald-200 text-emerald-700 text-xs">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Ready
                  </Badge>
                ) : adventure.is_completed ? (
                  <Badge className="bg-emerald-50 border-emerald-200 text-emerald-700 text-xs">
                    <Star className="w-3 h-3 mr-1" />
                    Done
                  </Badge>
                ) : !isScheduled ? (
                  <Badge className="bg-amber-50 border-amber-200 text-amber-700 text-xs">
                    <CalendarIcon className="w-3 h-3 mr-1" />
                    Unscheduled
                  </Badge>
                ) : (
                  <Badge className="bg-blue-50 border-blue-200 text-blue-700 text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    In Progress
                  </Badge>
                )}
              </div>
              <div className="p-2.5 bg-gradient-to-br from-[#f2cc6c]/20 to-[#f2cc6c]/10 rounded-lg">
                <TrendingUp className="w-4 h-4 text-[#3c7660]" />
              </div>
            </div>
          </div>

          {/* Collapsible Interactive Calendar Scheduling Section */}
          {!adventure.is_completed && (
            <div className="mb-8">
              {/* Header Button - Always Visible */}
              <button
                onClick={() => setIsScheduleSectionOpen(!isScheduleSectionOpen)}
                className="w-full relative overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-xl group"
              >
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#f8f2d5] via-[#f2cc6c]/10 to-[#3c7660]/5" />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent" />
                
                <div className="relative p-6 border-2 border-[#f2cc6c]/40 rounded-2xl backdrop-blur-sm group-hover:border-[#3c7660]/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-[#3c7660] to-[#4d987b] rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                        <CalendarIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-xl font-bold text-gray-900 mb-1">
                          {scheduledDate ? 'Scheduled Adventure' : 'Schedule Your Adventure'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {scheduledDate 
                            ? `${scheduledDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`
                            : 'Click to pick the perfect day to explore'
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {scheduledDate && (
                        <div className="text-right mr-4">
                          <div className="bg-white px-4 py-2 rounded-xl shadow-md border border-[#3c7660]/20">
                            <p className="text-2xl font-bold text-[#3c7660]">
                              {scheduledDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                            <p className="text-xs text-gray-600">
                              {scheduledDate.toLocaleDateString('en-US', { weekday: 'short' })}
                            </p>
                          </div>
                        </div>
                      )}
                      <div className={`p-2 rounded-lg transition-all ${
                        isScheduleSectionOpen 
                          ? 'bg-[#3c7660] text-white rotate-180' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        <ChevronDown className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>
              </button>

              {/* Expandable Calendar Section */}
              {isScheduleSectionOpen && (
                <div className="mt-4 relative overflow-hidden animate-in slide-in-from-top-2 duration-300">
                  {/* Animated background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#f8f2d5] via-[#f2cc6c]/10 to-[#3c7660]/5 rounded-3xl" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent rounded-3xl" />
                  
                  <div className="relative rounded-3xl p-8 border-2 border-[#f2cc6c]/40 shadow-2xl backdrop-blur-sm">
                    {/* Inline Calendar - Beautiful Design */}
                    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-gray-100">
                      <Calendar
                        mode="single"
                        selected={tempSelectedDate}
                        onSelect={handleDateSelect}
                        disabled={(date) => {
                          // Allow scheduling for today and future dates (no restriction on time of day)
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today;
                        }}
                        className="rounded-xl border-0 mx-auto"
                        classNames={{
                          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                          month: "space-y-4",
                          caption: "flex justify-center pt-1 relative items-center",
                          caption_label: "text-lg font-bold text-gray-900",
                          nav: "space-x-1 flex items-center",
                          nav_button: "h-9 w-9 bg-transparent hover:bg-[#3c7660]/10 rounded-lg transition-all p-0 inline-flex items-center justify-center",
                          nav_button_previous: "absolute left-1",
                          nav_button_next: "absolute right-1",
                          table: "w-full border-collapse space-y-1",
                          head_row: "flex",
                          head_cell: "text-gray-500 rounded-md w-12 font-semibold text-sm uppercase",
                          row: "flex w-full mt-2",
                          cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-[#3c7660]/10 [&:has([aria-selected])]:rounded-lg",
                          day: "h-12 w-12 p-0 font-semibold hover:bg-[#3c7660]/20 hover:text-[#3c7660] rounded-lg transition-all inline-flex items-center justify-center aria-selected:opacity-100 aria-selected:bg-gradient-to-br aria-selected:from-[#3c7660] aria-selected:to-[#4d987b] aria-selected:text-white aria-selected:shadow-lg aria-selected:scale-105",
                          day_selected: "bg-gradient-to-br from-[#3c7660] to-[#4d987b] text-white hover:bg-[#3c7660] hover:text-white focus:bg-[#3c7660] focus:text-white shadow-lg scale-105",
                          day_today: "bg-[#f2cc6c]/30 text-[#3c7660] font-bold border-2 border-[#f2cc6c]",
                          day_outside: "text-gray-300 opacity-50",
                          day_disabled: "text-gray-300 opacity-30 cursor-not-allowed hover:bg-transparent",
                          day_hidden: "invisible",
                        }}
                      />
                      
                      {/* Quick Date Suggestions */}
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-3">Quick Pick</p>
                        <div className="flex gap-2 flex-wrap">
                          {[
                            { label: 'Today', days: 0 },
                            { label: 'Tomorrow', days: 1 },
                            { label: 'This Weekend', days: (6 - new Date().getDay() + 7) % 7 || 7 },
                            { label: 'Next Week', days: 7 },
                          ].map((suggestion) => {
                            const suggestedDate = new Date();
                            suggestedDate.setDate(suggestedDate.getDate() + suggestion.days);
                            
                            return (
                              <button
                                key={suggestion.label}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDateSelect(suggestedDate);
                                }}
                                className="px-4 py-2 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-[#3c7660]/10 hover:to-[#4d987b]/10 border border-gray-200 hover:border-[#3c7660]/30 rounded-xl text-sm font-medium text-gray-700 hover:text-[#3c7660] transition-all hover:shadow-md"
                              >
                                {suggestion.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Confirm/Cancel Buttons */}
                    {tempSelectedDate && (
                      <div className="mt-6 flex items-center justify-between gap-4 bg-emerald-50 rounded-xl p-5 border border-emerald-200 animate-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-start gap-3 flex-1">
                          <CalendarIcon className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-semibold text-emerald-900">
                              {tempSelectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>
                            <p className="text-xs text-emerald-700 mt-1">
                              Ready to confirm this date for your adventure?
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              setTempSelectedDate(scheduledDate || undefined);
                              setIsScheduleSectionOpen(false);
                            }}
                            variant="outline"
                            className="border-gray-300 hover:bg-gray-50"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleScheduleSubmit();
                            }}
                            className="bg-white/40 backdrop-blur-md border border-[#3c7660]/30 text-[#3c7660] hover:bg-[#3c7660]/10 hover:border-[#3c7660] hover:shadow-lg transition-all"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Confirm Schedule
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step Navigation */}
          <div className="mb-6 bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-100 shadow-lg">
            <div className="text-center mb-4">
              <h3 className="text-sm font-bold text-gray-700 inline-flex items-center gap-2 mb-1">
                <Navigation className="w-4 h-4 text-[#3c7660]" />
                Quick Navigation
              </h3>
              <p className="text-xs text-gray-500">
                Step {currentStepIndex + 1} of {adventure.steps.length}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2.5 flex-wrap">
              {adventure.steps.sort((a, b) => a.step_order - b.step_order).map((step, index) => (
                <button
                  key={step.id}
                  draggable
                  onClick={() => handleStepNavigation(index)}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`flex-shrink-0 w-14 h-14 rounded-xl font-bold text-base transition-all duration-300 border-2 ${
                    index === currentStepIndex
                      ? 'bg-gradient-to-br from-[#3c7660] to-[#4d987b] text-white border-[#3c7660] scale-110 shadow-lg cursor-pointer'
                      : step.completed
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200 hover:scale-105 cursor-move'
                      : dragOverStepIndex === index && draggedStepIndex !== index
                      ? 'bg-blue-100 border-blue-400 border-dashed scale-105 cursor-move'
                      : draggedStepIndex === index
                      ? 'opacity-50 scale-95 cursor-grabbing'
                      : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200 hover:border-[#3c7660] hover:scale-105 cursor-move'
                  }`}
                  title={draggedStepIndex !== null ? 'Drop to swap positions' : `Click to view • Drag to reorder: ${step.title}`}
                >
                  {step.completed ? <CheckCircle2 className="w-5 h-5 mx-auto" /> : index + 1}
                </button>
              ))}
            </div>
            <p className="text-xs text-center text-gray-500 mt-3 italic flex items-center justify-center gap-1.5">
              <span className="inline-block w-1 h-1 bg-[#3c7660] rounded-full"></span>
              Drag & drop to reorder
              <span className="inline-block w-1 h-1 bg-[#3c7660] rounded-full"></span>
              Click to navigate
            </p>
          </div>

          {/* Flowing Adventure Timeline - Modern Card Design */}
          <div className="mb-6">
            {/* Timeline Flow */}
            <div className="relative overflow-hidden">
              {(() => {
                // Calculate the next incomplete step index
                const sortedSteps = [...adventure.steps].sort((a, b) => a.step_order - b.step_order);
                const nextIncompleteIndex = sortedSteps.findIndex(step => !step.completed);

                // Show only the current step
                const step = sortedSteps[currentStepIndex];
                if (!step) return null;

                const stepNumber = currentStepIndex + 1;
                const isLast = currentStepIndex === adventure.steps.length - 1;
                const isFirst = currentStepIndex === 0;
                const stepPhotos = getStepPhotos(step);
                const placeInfo = stepPlacesData[step.id] || step.google_places;

                return (
                  <div className="relative">
                    <div
                      key={step.id}
                      className={`transition-all duration-300 ${
                        slideDirection === 'left' ? 'animate-slide-out-left' :
                        slideDirection === 'right' ? 'animate-slide-out-right' :
                        'animate-slide-in'
                      }`}
                    >
                      {/* Dynamic Step Card */}
                      <div className={`relative bg-white rounded-2xl border-2 overflow-hidden transition-all duration-500 hover:shadow-2xl group ${
                        step.completed 
                          ? 'border-emerald-400 shadow-lg shadow-emerald-100' 
                          : 'border-gray-200 hover:border-[#3c7660]/50'
                      }`}>
                        {/* Completed Ribbon */}
                        {step.completed && (
                          <div className="absolute top-0 right-0 bg-gradient-to-br from-emerald-500 to-green-600 text-white px-6 py-1 text-xs font-bold rounded-bl-xl shadow-lg flex items-center gap-1 z-10">
                            <CheckCircle2 className="w-3 h-3" />
                            COMPLETED
                          </div>
                        )}

                        <div className="flex flex-col md:flex-row">
                          {/* Left: Photo Gallery */}
                          <div className="md:w-2/5 relative">
                            <div className="relative h-64 md:h-full min-h-[300px] bg-gradient-to-br from-gray-100 to-gray-200">
                              {/* Main Photo with Error Handling */}
                              <Image
                                src={stepPhotos[0]}
                                alt={step.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 40vw"
                                quality={95}
                                priority={currentStepIndex < 2}
                                onError={(e) => {
                                  // Fallback to a default image on error
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop';
                                }}
                              />
                              
                              {/* Gradient Overlay */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                              
                              {/* Step Number Badge - Floating with Transparency */}
                              <div className={`absolute top-4 left-4 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-xl transition-all backdrop-blur-md border-2 ${
                                step.completed
                                  ? 'bg-emerald-500/90 border-emerald-300/50 text-white scale-110'
                                  : 'bg-white/20 border-white/40 text-white group-hover:scale-110 group-hover:bg-white/30'
                              }`}>
                                {step.completed ? <CheckCircle2 className="w-6 h-6" /> : stepNumber}
                              </div>

                              {/* Time Overlay - Bottom Left */}
                              <div className="absolute bottom-0 left-0 right-0 p-4">
                                {step.time && (
                                  <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 w-fit">
                                    <Clock className="w-4 h-4 text-white" />
                                    <span className="text-sm font-semibold text-white">{step.time}</span>
                                  </div>
                                )}
                              </div>

                              {/* Additional Photos Thumbnails - Top Right */}
                              {stepPhotos.length > 1 && (
                                <div className="absolute top-6 right-6 flex gap-2">
                                  {stepPhotos.slice(1, 3).map((photo, photoIndex) => (
                                    <div key={photoIndex} className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-white shadow-lg hover:scale-110 transition-transform cursor-pointer">
                                      <Image
                                        src={photo}
                                        alt={`${step.title} photo ${photoIndex + 2}`}
                                        fill
                                        className="object-cover"
                                        sizes="48px"
                                        quality={90}
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.src = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=100&h=100&fit=crop';
                                        }}
                                      />
                                    </div>
                                  ))}
                                  {stepPhotos.length > 3 && (
                                    <div className="w-12 h-12 rounded-lg bg-black/60 backdrop-blur-md border-2 border-white shadow-lg flex items-center justify-center">
                                      <span className="text-xs font-bold text-white">+{stepPhotos.length - 3}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right: Content */}
                          <div className="md:w-3/5 p-6 flex flex-col">
                            {/* Title & Location */}
                            <div className="mb-4">
                              <div className="flex items-start justify-between gap-4 mb-2">
                                <h4 className={`text-2xl font-bold text-gray-900 ${
                                  step.completed ? 'line-through opacity-70' : ''
                                }`}>
                                  {step.title}
                                </h4>
                                {/* Rating & Budget Row */}
                                <div className="flex items-center gap-2 shrink-0">
                                  {/* Rating Badge - Glassmorphism */}
                                  {(placeInfo?.rating || step.rating) && (
                                    <div className="flex items-center gap-1.5 bg-white/40 backdrop-blur-md border border-amber-500/30 px-3 py-1.5 rounded-lg shadow-sm">
                                      <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                                      <span className="text-sm font-bold text-amber-600">
                                        {(placeInfo?.rating || step.rating).toFixed(1)}
                                      </span>
                                      {(placeInfo?.user_ratings_total || placeInfo?.user_rating_count) && (
                                        <span className="text-xs text-gray-600">
                                          ({(placeInfo.user_ratings_total || placeInfo.user_rating_count) > 999 
                                            ? `${((placeInfo.user_ratings_total || placeInfo.user_rating_count) / 1000).toFixed(1)}k` 
                                            : (placeInfo.user_ratings_total || placeInfo.user_rating_count)})
                                        </span>
                                      )}
                                    </div>
                                  )}
                                  {/* Budget/Price Level Badge - Glassmorphism */}
                                  {(placeInfo?.price_level !== undefined && placeInfo?.price_level !== null) && (
                                    <div className="flex items-center gap-1 bg-white/40 backdrop-blur-md border border-emerald-500/30 px-3 py-1.5 rounded-lg shadow-sm">
                                      <DollarSign className="w-4 h-4 text-emerald-600" />
                                      <span className="text-sm font-bold text-emerald-600">
                                        {'$'.repeat(placeInfo.price_level)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              {/* Business Name */}
                              <div className="flex items-center gap-2 text-gray-600 mb-1">
                                <MapPin className="w-4 h-4 text-[#3c7660]" />
                                <span className="text-sm font-bold text-gray-800">
                                  {step.business_name ||
                                   (typeof placeInfo?.name === 'object' ? placeInfo?.name?.text : placeInfo?.name) ||
                                   step.title}
                                </span>
                                {placeInfo && (
                                  <span className="ml-auto flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Verified
                                  </span>
                                )}
                              </div>
                              {/* Address */}
                              {(placeInfo?.formatted_address || placeInfo?.address || step.location) && (
                                <p className="text-xs text-gray-500 ml-6 mb-1">
                                  {placeInfo?.formatted_address || placeInfo?.address || step.location}
                                </p>
                              )}

                              {/* County/Locality & Rating Row */}
                              <div className="flex items-center gap-3 ml-6 mb-2">
                                {(() => {
                                  const county = extractCountyOrLocality(placeInfo?.formatted_address || placeInfo?.address);
                                  return county ? (
                                    <span className="text-xs text-gray-600 font-medium">
                                      📍 {county}
                                    </span>
                                  ) : null;
                                })()}
                                {(placeInfo?.user_ratings_total || placeInfo?.user_rating_count) && (
                                  <span className="text-xs text-gray-500">
                                    ({(placeInfo.user_ratings_total || placeInfo.user_rating_count).toLocaleString()} reviews)
                                  </span>
                                )}
                              </div>

                              {/* Reservation/Booking Info */}
                              {(step.booking || step.business_phone || step.business_website) && (
                                <div className="ml-6 mb-3 p-2.5 bg-blue-50 rounded-lg border border-blue-100">
                                  <div className="flex items-start gap-2">
                                    <CalendarIcon className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                      <p className="text-xs font-semibold text-blue-900 mb-1">Reservation Info</p>
                                      {step.booking && (
                                        <p className="text-xs text-blue-700">
                                          {step.booking.method}
                                          {step.booking.fallback && ` • ${step.booking.fallback}`}
                                        </p>
                                      )}
                                      {!step.booking && step.business_phone && (
                                        <p className="text-xs text-blue-700">
                                          Call ahead recommended: {step.business_phone}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Business Hours - Prominent Display */}
                              {(placeInfo?.opening_hours?.weekday_text || 
                                placeInfo?.regularOpeningHours?.weekdayDescriptions || 
                                placeInfo?.current_opening_hours?.weekday_text || 
                                step.business_hours) && (
                                <div className="mt-3 p-3 bg-gradient-to-r from-[#f8f2d5] to-[#f2cc6c]/20 rounded-xl border border-[#f2cc6c]/30">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Clock className="w-4 h-4 text-[#3c7660]" />
                                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Hours</span>
                                  </div>
                                  {(placeInfo?.opening_hours?.weekday_text || 
                                    placeInfo?.regularOpeningHours?.weekdayDescriptions || 
                                    placeInfo?.current_opening_hours?.weekday_text) ? (
                                    <div className="text-xs text-gray-700 space-y-0.5">
                                      {(placeInfo.opening_hours?.weekday_text || 
                                        placeInfo.regularOpeningHours?.weekdayDescriptions || 
                                        placeInfo.current_opening_hours?.weekday_text)
                                        .slice(0, 3)
                                        .map((dayHours: string, idx: number) => (
                                          <div key={idx} className="font-medium">{dayHours}</div>
                                        ))}
                                      {(placeInfo.opening_hours?.weekday_text || 
                                        placeInfo.regularOpeningHours?.weekdayDescriptions || 
                                        placeInfo.current_opening_hours?.weekday_text).length > 3 && (
                                        <div className="text-[#3c7660] font-semibold cursor-pointer hover:underline">
                                          +{(placeInfo.opening_hours?.weekday_text || 
                                            placeInfo.regularOpeningHours?.weekdayDescriptions || 
                                            placeInfo.current_opening_hours?.weekday_text).length - 3} more days
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <p className="text-xs text-gray-700 font-medium">{step.business_hours}</p>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Description */}
                            <p className="text-sm text-gray-700 leading-relaxed mb-4 flex-1">
                              {step.description}
                            </p>

                            {/* Action Buttons Row */}
                            <div className="flex flex-wrap gap-2 mb-4">
                              {(placeInfo?.formatted_phone_number || placeInfo?.national_phone_number) && (
                                <a
                                  href={`tel:${placeInfo.formatted_phone_number || placeInfo.national_phone_number}`}
                                  className="group flex items-center gap-2 px-4 py-2 bg-white/40 backdrop-blur-md border border-[#3c7660]/30 text-[#3c7660] rounded-lg hover:bg-[#3c7660]/10 hover:border-[#3c7660] hover:shadow-lg transition-all text-sm font-semibold"
                                >
                                  <Phone className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                  Call
                                </a>
                              )}
                              {(placeInfo?.website || placeInfo?.website_uri) && (
                                <a
                                  href={placeInfo.website || placeInfo.website_uri}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group flex items-center gap-2 px-4 py-2 bg-white/40 backdrop-blur-md border border-[#4d987b]/30 text-[#4d987b] rounded-lg hover:bg-[#4d987b]/10 hover:border-[#4d987b] hover:shadow-lg transition-all text-sm font-semibold"
                                >
                                  <Globe className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                  Website
                                </a>
                              )}
                              {/* Google Business Link */}
                              {(placeInfo?.google_maps_uri || placeInfo?.place_id) && (
                                <a
                                  href={placeInfo.google_maps_uri || `https://www.google.com/maps/place/?q=place_id:${placeInfo.place_id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group flex items-center gap-2 px-4 py-2 bg-white/40 backdrop-blur-md border border-[#3c7660]/30 text-[#3c7660] rounded-lg hover:bg-[#3c7660]/10 hover:border-[#3c7660] hover:shadow-lg transition-all text-sm font-semibold"
                                >
                                  <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                  Google
                                </a>
                              )}
                              <a
                                href={getGoogleMapsLink(step)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center gap-2 px-4 py-2 bg-white/40 backdrop-blur-md border border-[#f2cc6c]/50 text-[#d4a84e] rounded-lg hover:bg-[#f2cc6c]/10 hover:border-[#f2cc6c] hover:shadow-lg transition-all text-sm font-semibold"
                              >
                                <Navigation className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                Directions
                              </a>
                            </div>

                            {/* Completion Checkbox */}
                            <div className="pt-4 flex items-center justify-between">
                              <span className="text-sm text-gray-600">
                                {step.completed ? 'Completed on this adventure' : 'Mark as complete when done'}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStepToggle(step.id, !step.completed);
                                }}
                                disabled={!canCompleteSteps}
                                className={`transition-all ${
                                  canCompleteSteps ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed opacity-40'
                                }`}
                              >
                                {step.completed ? (
                                  <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border-2 border-emerald-500 rounded-lg">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                    <span className="text-sm font-bold text-emerald-700">Done!</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-2 border-gray-300 rounded-lg hover:border-[#3c7660] hover:bg-[#3c7660]/5">
                                    <Circle className="w-6 h-6 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-600">Complete</span>
                                  </div>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Navigation buttons */}
                      <div className="flex justify-between items-center mt-6 gap-4">
                        <button
                          onClick={() => handleStepNavigation(currentStepIndex - 1)}
                          disabled={isFirst}
                          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                            isFirst
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white/40 backdrop-blur-md border border-[#3c7660]/30 text-[#3c7660] hover:bg-[#3c7660]/10 hover:border-[#3c7660] hover:shadow-lg'
                          }`}
                        >
                          <ChevronUp className="w-5 h-5 rotate-[-90deg]" />
                          Previous Step
                        </button>
                        <button
                          onClick={() => handleStepNavigation(currentStepIndex + 1)}
                          disabled={isLast}
                          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                            isLast
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white/40 backdrop-blur-md border border-[#3c7660]/30 text-[#3c7660] hover:bg-[#3c7660]/10 hover:border-[#3c7660] hover:shadow-lg'
                          }`}
                        >
                          Next Step
                          <ChevronDown className="w-5 h-5 rotate-[-90deg]" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
