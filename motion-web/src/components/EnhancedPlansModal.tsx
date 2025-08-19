import React, { useState, useEffect } from 'react';
import { X, MapPin, Clock, Calendar as CalendarIcon, Star, CheckCircle2, Circle, Phone, Globe, ChevronDown, ChevronUp, ExternalLink, RefreshCw } from 'lucide-react';
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
    name: string;
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
  onTitleUpdate
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
    if (selectedDate) {
      onSchedule(selectedDate);
      toast.success('Adventure scheduled successfully!');
    }
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

  const toggleStepExpansion = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  // Fetch Google Places data for steps with business names
  useEffect(() => {
    const fetchPlacesData = async () => {
      for (const step of adventure.steps) {
        if (step.business_name && !stepPlacesData[step.id]) {
          try {
            const placeData = await GooglePlacesService.getPlaceDataWithCache(
              step.business_name,
              step.location
            );
            if (placeData) {
              setStepPlacesData(prev => ({
                ...prev,
                [step.id]: placeData
              }));
            }
          } catch (error) {
            console.error('Error fetching place data for step:', step.id, error);
          }
        }
      }
    };

    if (adventure.steps.length > 0) {
      fetchPlacesData();
    }
  }, [adventure.steps, stepPlacesData]);

  const getStepPhoto = (step: AdventureStep) => {
    // Priority: google_places.photo_url > step.photo_url > google_places data > fallback
    return step.google_places?.photo_url || 
           step.photo_url || 
           stepPlacesData[step.id]?.photo_references?.[0] ? 
             GooglePlacesService.getPhotoUrl(stepPlacesData[step.id].photo_references[0], 400) :
           `https://picsum.photos/400/300?random=${step.id}`;
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

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex-1 mr-4">
            {/* Editable Title */}
            {isEditingTitle ? (
              <div className="flex items-center gap-2 mb-1">
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="text-2xl font-bold text-gray-900 bg-transparent border-b-2 border-[#f2cc6c] focus:outline-none focus:border-[#3c7660] transition-colors flex-1"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleTitleSave();
                    if (e.key === 'Escape') handleTitleCancel();
                  }}
                />
                <Button
                  size="sm"
                  onClick={handleTitleSave}
                  className="bg-[#3c7660] hover:bg-[#2d5a47] text-white border border-[#f2cc6c]/30"
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleTitleCancel}
                  className="border-gray-300"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <h2 
                className="text-2xl font-bold text-gray-900 mb-1 cursor-pointer hover:text-[#3c7660] transition-colors border-b-2 border-transparent hover:border-[#f2cc6c]/50 inline-block"
                onClick={() => setIsEditingTitle(true)}
                title="Click to edit title"
              >
                {adventure.title}
              </h2>
            )}
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-[#3c7660]" />
                {adventure.location}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-[#3c7660]" />
                {adventure.duration}
              </div>
              {adventure.google_places_validated && (
                <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
                  <span className="text-green-600">✓</span>
                  Google Verified
                </Badge>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-gray-100">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-500">{completedSteps}/{totalSteps} completed</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-[#3c7660] h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Status Section */}
          <div className="mb-6 p-4 bg-gradient-to-r from-white to-gray-50 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
              <div className="w-2 h-2 bg-[#3c7660] rounded-full mr-2"></div>
              Adventure Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-700 block mb-1">Current Status</span>
                  <div className="flex items-center gap-2">
                    {adventure.is_completed ? (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Completed
                      </Badge>
                    ) : isScheduled ? (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        <CalendarIcon className="w-3 h-3 mr-1" />
                        Scheduled
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-700 border-gray-200">
                        <Clock className="w-3 h-3 mr-1" />
                        Planning
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-700 block mb-1">Scheduled Date</span>
                  <div className="text-sm text-gray-600">
                    {scheduledDate ? (
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4 text-[#3c7660]" />
                        {scheduledDate.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                    ) : (
                      <span className="text-gray-500 italic">Not scheduled yet</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-700 block mb-1">Progress Status</span>
                  <div className="flex items-center gap-2">
                    {canCompleteSteps ? (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Ready to Complete
                      </Badge>
                    ) : adventure.is_completed ? (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <Star className="w-3 h-3 mr-1" />
                        Finished
                      </Badge>
                    ) : !isScheduled ? (
                      <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                        <CalendarIcon className="w-3 h-3 mr-1" />
                        Needs Scheduling
                      </Badge>
                    ) : (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        <Clock className="w-3 h-3 mr-1" />
                        Waiting for Date
                      </Badge>
                    )}
                  </div>
                </div>
                
                {isScheduled && (
                  <div>
                    <span className="text-sm font-medium text-gray-700 block mb-1">Time Status</span>
                    <div className="text-sm text-gray-600">
                      {adventure.is_completed ? (
                        <span className="text-green-600 font-medium">Adventure completed!</span>
                      ) : scheduledDate! > today ? (
                        <span className="text-blue-600">
                          {Math.ceil((scheduledDate!.getTime() - today.getTime()) / (1000 * 3600 * 24))} days to go
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-medium">Available now!</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Scheduling Section */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Schedule Adventure</h3>
            <div className="flex items-center gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button 
                onClick={handleScheduleSubmit}
                disabled={!selectedDate}
                className="bg-[#3c7660] hover:bg-[#2d5a47]"
              >
                {adventure.scheduled_for ? 'Reschedule' : 'Schedule'}
              </Button>
            </div>
            {adventure.scheduled_for && (
              <p className="text-sm text-gray-600 mt-2">
                Currently scheduled for {format(new Date(adventure.scheduled_for), 'PPP')}
              </p>
            )}
          </div>

          {/* Steps Checklist */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Adventure Steps</h3>
            {adventure.steps
              .sort((a, b) => a.step_order - b.step_order)
              .map((step, index) => (
              <Card key={step.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  {/* Step Header */}
                  <div className="flex items-center p-4">
                    <button
                      onClick={() => handleStepToggle(step.id, !step.completed)}
                      className={`mr-3 transition-all ${
                        canCompleteSteps 
                          ? 'hover:scale-110 cursor-pointer' 
                          : 'cursor-not-allowed opacity-50'
                      }`}
                      disabled={!canCompleteSteps}
                    >
                      {step.completed ? (
                        <CheckCircle2 className="w-6 h-6 text-[#3c7660]" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400" />
                      )}
                    </button>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {step.time && (
                          <Badge variant="outline" className="text-xs">
                            {step.time}
                          </Badge>
                        )}
                        <h4 className={`font-medium ${step.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {step.title}
                        </h4>
                        {step.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm text-gray-600">{step.rating}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{step.location}</p>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleStepExpansion(step.id)}
                      className="ml-2"
                    >
                      {expandedSteps.has(step.id) ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  {/* Expanded Step Details */}
                  {expandedSteps.has(step.id) && (
                    <div className="border-t border-gray-100 p-4 bg-gray-50">
                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Step Photo */}
                        <div>
                          <div className="relative aspect-video rounded-lg overflow-hidden mb-3">
                            <Image
                              src={getStepPhoto(step)}
                              alt={step.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          {step.google_places && (
                            <div className="text-xs text-green-600 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Verified by Google Places
                            </div>
                          )}
                        </div>

                        {/* Step Info */}
                        <div className="space-y-3">
                          <div>
                            <h5 className="font-medium text-gray-900 mb-1">Details</h5>
                            <p className="text-sm text-gray-600">{step.description}</p>
                          </div>

                          {/* Google Places Enhanced Info */}
                          {stepPlacesData[step.id] && (
                            <>
                              <div>
                                <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-1">
                                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                                  Business Information
                                </h5>
                                <div className="bg-white rounded-lg p-3 border border-gray-200 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium text-gray-900">{stepPlacesData[step.id].name}</span>
                                    {stepPlacesData[step.id].rating && (
                                      <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                        <span className="text-sm font-medium">{stepPlacesData[step.id].rating}</span>
                                        <span className="text-xs text-gray-500">
                                          ({stepPlacesData[step.id].user_ratings_total} reviews)
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {stepPlacesData[step.id].formatted_address && (
                                    <div className="flex items-start gap-2">
                                      <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                      <span className="text-sm text-gray-600">{stepPlacesData[step.id].formatted_address}</span>
                                    </div>
                                  )}

                                  <div className="flex items-center gap-4">
                                    {stepPlacesData[step.id].price_level !== undefined && (
                                      <div className="flex items-center gap-1">
                                        <span className="text-sm text-gray-600">Budget:</span>
                                        <Badge variant="outline" className="text-xs">
                                          {GooglePlacesService.getPriceLevelText(stepPlacesData[step.id].price_level)}
                                        </Badge>
                                      </div>
                                    )}
                                    
                                    {stepPlacesData[step.id].opening_hours && (
                                      <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm text-gray-600">
                                          {GooglePlacesService.getOpeningStatus(stepPlacesData[step.id].opening_hours).status}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </>
                          )}

                          {/* Legacy business info for non-Google Places steps */}
                          {!stepPlacesData[step.id] && step.business_name && (
                            <div>
                              <h5 className="font-medium text-gray-900 mb-1">Business</h5>
                              <p className="text-sm text-gray-700">{step.business_name}</p>
                            </div>
                          )}

                          {step.business_hours && (
                            <div>
                              <h5 className="font-medium text-gray-900 mb-1">Hours</h5>
                              <p className="text-sm text-gray-600">{step.business_hours}</p>
                            </div>
                          )}

                          <div className="flex gap-2">
                            {(step.google_places?.national_phone_number || stepPlacesData[step.id]?.formatted_phone_number || step.business_phone) && (
                              <Button size="sm" variant="outline" asChild>
                                <a href={`tel:${step.google_places?.national_phone_number || stepPlacesData[step.id]?.formatted_phone_number || step.business_phone}`}>
                                  <Phone className="w-4 h-4 mr-1" />
                                  Call
                                </a>
                              </Button>
                            )}
                            {(step.google_places?.website_uri || stepPlacesData[step.id]?.website || step.business_website) && (
                              <Button size="sm" variant="outline" asChild>
                                <a href={step.google_places?.website_uri || stepPlacesData[step.id]?.website || step.business_website} target="_blank" rel="noopener noreferrer">
                                  <Globe className="w-4 h-4 mr-1" />
                                  Website
                                </a>
                              </Button>
                            )}
                            <Button size="sm" variant="outline" asChild>
                              <a 
                                href={getGoogleMapsLink(step)} 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="w-4 h-4 mr-1" />
                                View on Maps
                              </a>
                            </Button>
                          </div>

                          {step.google_places && (
                            <div className="text-xs text-gray-500 space-y-1">
                              <p>Google Rating: {step.google_places.rating}⭐ ({step.google_places.user_rating_count} reviews)</p>
                              <p>Last updated: {new Date(step.google_places.last_updated).toLocaleDateString()}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 pt-4 border-t border-gray-100">
            {/* Share block */}
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Button
                  onClick={() => setShareOpen((v) => !v)}
                  disabled={!allStepsCompleted && !adventure.is_completed}
                  className="bg-[#3c7660] hover:bg-[#2d5a47] disabled:bg-gray-300"
                >
                  Share to Discover
                </Button>
                {!allStepsCompleted && !adventure.is_completed && (
                  <p className="text-xs text-gray-500">Complete all steps to share your adventure.</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="destructive"
                  onClick={onDelete}
                  className="bg-red-500 hover:bg-red-600"
                >
                  <X className="w-4 h-4 mr-2" />
                  Delete Adventure
                </Button>
                
                {adventure.is_completed && onDuplicate && (
                  <Button
                    onClick={onDuplicate}
                    className="bg-[#f2cc6c] hover:bg-[#e6b85c] text-[#3c7660] border border-[#f2cc6c]/30"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Do it Again
                  </Button>
                )}
                
                <Button
                  onClick={handleMarkCompleted}
                  disabled={!canMarkComplete}
                  className={`${
                    canMarkComplete 
                      ? 'bg-[#3c7660] hover:bg-[#2d5a47]' 
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {adventure.is_completed 
                    ? 'Completed' 
                    : canMarkComplete 
                      ? 'Mark as Completed' 
                      : !isScheduled 
                        ? 'Schedule first'
                        : !isScheduledDateReached
                          ? `Available ${scheduledDate?.toLocaleDateString()}`
                          : `Complete ${totalSteps - completedSteps} more steps`
                  }
                </Button>
              </div>
            </div>

            {shareOpen && (
              <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
                <h4 className="font-medium text-gray-900 mb-2">Add a quick review</h4>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(n => (
                      <button
                        key={n}
                        onClick={() => setShareRating(n)}
                        className="p-1"
                        aria-label={`Rate ${n} star${n>1?'s':''}`}
                      >
                        <Star className={`w-5 h-5 ${n <= shareRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={shareText}
                    onChange={(e) => setShareText(e.target.value)}
                    placeholder="What did you think? (optional)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <Button
                    onClick={() => onShare(shareRating, shareText?.trim() || undefined)}
                    className="bg-[#3c7660] hover:bg-[#2d5a47]"
                  >
                    Publish
                  </Button>
                </div>
                <p className="text-xs text-gray-500">We'll share your plan to the community feed.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
