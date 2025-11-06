import React, { useState, useEffect } from 'react';
import { X, MapPin, Clock, Calendar as CalendarIcon, Star, CheckCircle2, Circle, Phone, Globe, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, ExternalLink, RefreshCw, TrendingUp, DollarSign, Navigation, Sparkles, Award, Users, ImageIcon, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { toast } from 'sonner';
import Image from 'next/image';
import GooglePlacesService from '@/services/GooglePlacesService';
import AdventureService from '@/services/AdventureService';

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

  // Step editing state
  const [editingStep, setEditingStep] = useState<AdventureStep | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedStepData, setEditedStepData] = useState<Partial<AdventureStep>>({});
  const [isSavingStep, setIsSavingStep] = useState(false);
  const [deletingStepId, setDeletingStepId] = useState<string | null>(null);

  // Step navigation state for horizontal progress line
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

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
    onMarkCompleted();
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

  const handleEditStep = (step: AdventureStep) => {
    setEditingStep(step);
    setEditedStepData({
      title: step.title,
      description: step.description,
      duration: step.duration,
      location: step.location
    });
    setEditDialogOpen(true);
  };

  const handleSaveStep = async () => {
    if (!editingStep || !adventure.id) return;

    setIsSavingStep(true);
    try {
      const updatedAdventure = await AdventureService.updateStep(
        adventure.id,
        editingStep.id,
        editedStepData
      );

      if (updatedAdventure && onUpdate) {
        onUpdate(); // Trigger parent refresh
        toast.success('Step updated successfully!');
        setEditDialogOpen(false);
        setEditingStep(null);
        setEditedStepData({});
      } else {
        toast.error('Failed to update step');
      }
    } catch (error: any) {
      console.error('Error saving step:', error);
      toast.error(error?.message || 'Failed to update step');
    } finally {
      setIsSavingStep(false);
    }
  };

  const handleDeleteStep = async (stepId: string) => {
    if (!adventure.id) return;

    if (!confirm('Are you sure you want to delete this step? This action cannot be undone.')) {
      return;
    }

    setDeletingStepId(stepId);
    try {
      const updatedAdventure = await AdventureService.deleteStep(adventure.id, stepId);

      if (updatedAdventure && onUpdate) {
        onUpdate(); // Trigger parent refresh
        toast.success('Step deleted successfully!');
      } else {
        toast.error('Failed to delete step');
      }
    } catch (error: any) {
      console.error('Error deleting step:', error);
      toast.error(error?.message || 'Failed to delete step');
    } finally {
      setDeletingStepId(null);
    }
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

  // Step navigation handlers
  const goToNextStep = () => {
    if (currentStepIndex < adventure.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const goToStep = (index: number) => {
    setCurrentStepIndex(index);
  };

  // Reset to first step when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
    }
  }, [isOpen]);

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

  // Get current step based on navigation
  const sortedSteps = [...adventure.steps].sort((a, b) => a.step_order - b.step_order);
  const currentStep = sortedSteps[currentStepIndex];
  const stepPhotos = currentStep ? getStepPhotos(currentStep) : [];
  const currentStepPhoto = stepPhotos[0];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white/95 backdrop-blur-2xl rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300">

        {/* Compact Header */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-2xl border-b border-white/30 px-6 py-4 z-10 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            {/* Editable Title */}
            <div className="flex-1 mr-4">
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleTitleSave();
                      if (e.key === 'Escape') handleTitleCancel();
                    }}
                    className="text-xl font-bold text-gray-900 bg-gray-50 border-2 border-[#3c7660] rounded-lg px-3 py-1 flex-1 focus:outline-none focus:ring-2 focus:ring-[#3c7660]/20"
                    autoFocus
                  />
                  <Button size="sm" onClick={handleTitleSave} className="bg-[#3c7660] hover:bg-[#2a5444]">
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleTitleCancel}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="cursor-pointer group" onClick={() => setIsEditingTitle(true)}>
                  <h2 className="text-xl font-bold text-gray-900 group-hover:text-[#3c7660] transition-colors">
                    {adventure.title}
                  </h2>
                  <p className="text-[10px] text-gray-400 mt-0.5">Click to edit</p>
                </div>
              )}
            </div>

            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="shrink-0"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Compact 2x2 Info Grid */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {/* Progress */}
            <div className="flex items-center gap-2 bg-white/70 backdrop-blur-xl rounded-xl px-3 py-1.5 border border-white/40 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-[#3c7660]" />
              <div>
                <p className="text-[9px] text-gray-500 uppercase font-semibold tracking-wide">Progress</p>
                <p className="text-sm font-bold text-gray-900">{completedSteps}/{totalSteps} steps</p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2 bg-white/70 backdrop-blur-xl rounded-xl px-3 py-1.5 border border-white/40 shadow-sm">
              <CalendarIcon className="w-4 h-4 text-[#f2cc6c]" />
              <div>
                <p className="text-[9px] text-gray-500 uppercase font-semibold tracking-wide">Status</p>
                <p className="text-sm font-bold text-gray-900">
                  {adventure.is_completed ? 'Completed' : selectedDate ? format(selectedDate, 'MMM d') : 'Unscheduled'}
                </p>
              </div>
            </div>

            {/* Duration */}
            <div className="flex items-center gap-2 bg-white/70 backdrop-blur-xl rounded-xl px-3 py-1.5 border border-white/40 shadow-sm">
              <Clock className="w-4 h-4 text-[#3c7660]" />
              <div>
                <p className="text-[9px] text-gray-500 uppercase font-semibold tracking-wide">Duration</p>
                <p className="text-sm font-bold text-gray-900">{adventure.duration}</p>
              </div>
            </div>

            {/* Budget */}
            <div className="flex items-center gap-2 bg-white/70 backdrop-blur-xl rounded-xl px-3 py-1.5 border border-white/40 shadow-sm">
              <DollarSign className="w-4 h-4 text-[#3c7660]" />
              <div>
                <p className="text-[9px] text-gray-500 uppercase font-semibold tracking-wide">Budget</p>
                <p className="text-sm font-bold text-gray-900">{adventure.difficulty}</p>
              </div>
            </div>
          </div>

          {/* Horizontal Progress Line */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                Steps ({currentStepIndex + 1}/{sortedSteps.length})
              </p>
            </div>

            <div className="flex items-center justify-between gap-1">
              {sortedSteps.map((step, index) => {
                const isCompleted = step.completed;
                const isCurrent = index === currentStepIndex;
                const isLast = index === sortedSteps.length - 1;

                return (
                  <div key={step.id} className="flex items-center flex-1">
                    {/* Step Circle */}
                    <button
                      onClick={() => goToStep(index)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-md hover:scale-110 ${
                        isCompleted
                          ? 'bg-[#3c7660] text-white'
                          : isCurrent
                          ? 'bg-[#f2cc6c] text-gray-900 ring-4 ring-[#f2cc6c]/30'
                          : 'bg-white border-2 border-gray-300 text-gray-400'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </button>

                    {/* Connecting Line */}
                    {!isLast && (
                      <div className={`h-0.5 flex-1 mx-1 rounded-full transition-colors ${
                        isCompleted && sortedSteps[index + 1]?.completed
                          ? 'bg-[#3c7660]'
                          : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Current Step Content - No Scrolling */}
        {currentStep && (
          <div className="px-6 py-5 max-h-[calc(92vh-300px)] overflow-y-auto bg-gradient-to-br from-gray-50/50 via-white/80 to-[#f8f2d5]/20">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white/40 overflow-hidden shadow-lg">
              <div className="flex flex-col md:flex-row">
                {/* Step Photo */}
                <div className="md:w-2/5 relative">
                  <div className="relative h-64 md:h-full min-h-[300px] bg-gradient-to-br from-gray-100 to-gray-200">
                    {currentStepPhoto ? (
                      <Image
                        src={currentStepPhoto}
                        alt={currentStep.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 40vw"
                        priority
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ImageIcon className="w-16 h-16 text-gray-400" />
                      </div>
                    )}

                    {/* Step Number Badge */}
                    <div className={`absolute top-4 left-4 w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base shadow-xl backdrop-blur-md border-2 ${
                      currentStep.completed
                        ? 'bg-[#3c7660] text-white border-[#3c7660]'
                        : 'bg-white/90 text-gray-900 border-white'
                    }`}>
                      {currentStep.completed ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <span>{currentStepIndex + 1}</span>
                      )}
                    </div>

                    {/* Completion Status */}
                    {currentStep.completed && (
                      <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 text-xs font-bold rounded-lg shadow-lg flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Completed
                      </div>
                    )}

                    {/* Additional Photos Indicator */}
                    {stepPhotos.length > 1 && (
                      <div className="absolute bottom-4 right-4 flex gap-2">
                        {stepPhotos.slice(1, 4).map((photo, photoIndex) => (
                          <div key={photoIndex} className="relative w-11 h-11 rounded-lg overflow-hidden border-2 border-white shadow-lg">
                            <Image
                              src={photo}
                              alt={`${currentStep.title} photo ${photoIndex + 2}`}
                              fill
                              className="object-cover"
                              sizes="44px"
                            />
                          </div>
                        ))}
                        {stepPhotos.length > 4 && (
                          <div className="w-11 h-11 rounded-lg bg-black/60 backdrop-blur-md border-2 border-white shadow-lg flex items-center justify-center">
                            <span className="text-white text-xs font-bold">+{stepPhotos.length - 4}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Step Details */}
                <div className="md:w-3/5 p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{currentStep.title}</h3>
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{currentStep.location}</span>
                      </div>
                      {currentStep.time && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">{currentStep.time}</span>
                        </div>
                      )}
                    </div>

                    {/* Step Actions Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditStep(currentStep)}>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit Step
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteStep(currentStep.id)}
                          className="text-red-600"
                          disabled={deletingStepId === currentStep.id}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {deletingStepId === currentStep.id ? 'Deleting...' : 'Delete Step'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Rating & Verified Badge */}
                  <div className="flex items-center gap-2 mb-3">
                    {currentStep.rating && (
                      <Badge variant="outline" className="bg-amber-50 border-amber-300 text-amber-700 text-xs">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        {currentStep.rating}
                      </Badge>
                    )}
                    {currentStep.validated && (
                      <Badge variant="outline" className="bg-emerald-50 border-emerald-300 text-emerald-700 text-xs">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm leading-relaxed mb-3">{currentStep.description}</p>

                  {/* Business Details */}
                  {(currentStep.business_hours || currentStep.business_phone || currentStep.business_website) && (
                    <div className="p-3 bg-gradient-to-r from-[#f8f2d5] to-[#f2cc6c]/20 rounded-xl border border-[#f2cc6c]/30 mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-[#3c7660]" />
                        <span className="font-semibold text-gray-900 text-sm">Business Details</span>
                      </div>
                      <div className="space-y-1 text-xs text-gray-700">
                        {currentStep.business_hours && (
                          <div className="font-medium">Hours: {currentStep.business_hours}</div>
                        )}
                        {currentStep.business_phone && (
                          <div>Phone: {currentStep.business_phone}</div>
                        )}
                        {currentStep.business_website && (
                          <a
                            href={currentStep.business_website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#3c7660] hover:underline flex items-center gap-1"
                          >
                            Website
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(getGoogleMapsLink(currentStep), '_blank')}
                      className="flex items-center gap-1.5 text-xs"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      Directions
                    </Button>
                    {currentStep.business_phone && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`tel:${currentStep.business_phone}`, '_self')}
                        className="flex items-center gap-1.5 text-xs"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        Call
                      </Button>
                    )}
                    {currentStep.business_website && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(currentStep.business_website, '_blank')}
                        className="flex items-center gap-1.5 text-xs"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        Website
                      </Button>
                    )}
                  </div>

                  {/* Step Completion Checkbox */}
                  {canCompleteSteps && (
                    <div className="pt-3 border-t border-gray-200">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={currentStep.completed || false}
                          onChange={(e) => handleStepToggle(currentStep.id, e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-[#3c7660] focus:ring-[#3c7660]"
                        />
                        <span className="text-sm font-medium text-gray-700 group-hover:text-[#3c7660]">
                          Mark this step as completed
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fixed Navigation Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between">
          {/* Previous Button */}
          <Button
            onClick={goToPreviousStep}
            disabled={currentStepIndex === 0}
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          {/* Schedule/Complete Actions */}
          <div className="flex gap-2">
            <Popover open={isScheduleSectionOpen} onOpenChange={setIsScheduleSectionOpen}>
              <PopoverTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-1.5"
                >
                  <CalendarIcon className="w-4 h-4" />
                  {selectedDate ? 'Reschedule' : 'Schedule'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                  mode="single"
                  selected={tempSelectedDate}
                  onSelect={handleDateSelect}
                  initialFocus
                />
                <div className="p-3 border-t">
                  <Button
                    onClick={handleScheduleSubmit}
                    disabled={!tempSelectedDate}
                    className="w-full bg-[#3c7660] hover:bg-[#2a5444]"
                    size="sm"
                  >
                    Confirm Schedule
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {!adventure.is_completed && canMarkComplete && (
              <Button
                onClick={handleMarkCompleted}
                className="bg-[#3c7660] hover:bg-[#2a5444] flex items-center gap-1.5"
                size="sm"
              >
                <Award className="w-4 h-4" />
                Mark Complete
              </Button>
            )}
          </div>

          {/* Next Button */}
          <Button
            onClick={goToNextStep}
            disabled={currentStepIndex === sortedSteps.length - 1}
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

      </div>

      {/* Step Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Step</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="step-title">Title</Label>
              <Input
                id="step-title"
                value={editedStepData.title || ''}
                onChange={(e) => setEditedStepData({ ...editedStepData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="step-description">Description</Label>
              <Textarea
                id="step-description"
                value={editedStepData.description || ''}
                onChange={(e) => setEditedStepData({ ...editedStepData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="step-location">Location</Label>
              <Input
                id="step-location"
                value={editedStepData.location || ''}
                onChange={(e) => setEditedStepData({ ...editedStepData, location: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="step-duration">Duration</Label>
              <Input
                id="step-duration"
                value={editedStepData.duration || ''}
                onChange={(e) => setEditedStepData({ ...editedStepData, duration: e.target.value })}
                placeholder="e.g., 1 hour"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveStep}
              disabled={isSavingStep}
              className="bg-[#3c7660] hover:bg-[#2a5444]"
            >
              {isSavingStep ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
