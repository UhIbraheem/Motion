'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  IoClose, 
  IoTime, 
  IoLocationOutline, 
  IoCash, 
  IoStar, 
  IoCheckmarkCircle,
  IoHeart,
  IoBookmark,
  IoShare,
  IoCalendarOutline,
  IoPersonOutline,
  IoChevronBack,
  IoChevronForward,
  IoCalendar,
  IoCheckmark
} from 'react-icons/io5';

interface AdventurePhoto {
  url: string;
  source: 'google' | 'ai_generated' | 'user_uploaded';
  width?: number;
  height?: number;
}

interface AdventureStep {
  time: string;
  title: string;
  location?: string;
  business_info?: {
    name: string;
    address?: string;
    phone?: string;
    rating?: number;
  };
  booking?: any;
  notes?: string;
  duration?: string;
  cost?: string;
}

interface Adventure {
  id: string;
  custom_title: string;
  custom_description?: string;
  location?: string;
  duration_hours?: number;
  estimated_cost?: string;
  rating?: number;
  steps?: AdventureStep[];
  adventure_steps?: AdventureStep[];
  shared_date: string;
  user_id: string;
  view_count?: number;
  save_count?: number;
  heart_count?: number;
  profiles?: {
    id: string;
    display_name?: string;
    first_name?: string;
    last_name?: string;
    profile_picture_url?: string;
  };
  adventure_photos?: Array<{
    photo_url: string;
    is_cover_photo: boolean;
  }>;
  photos?: AdventurePhoto[];
  total_time?: string;
  is_completed?: boolean;
  scheduled_for?: string;
}

interface AdventureModalProps {
  adventure: Adventure | null;
  isOpen: boolean;
  onClose: () => void;
  user?: any;
  userLiked?: boolean;
  userSaved?: boolean;
  onLike?: (adventureId: string) => void;
  onSave?: (adventureId: string) => void;
  onShare?: (adventure: Adventure) => void;
}

export default function AdventureModal({
  adventure,
  isOpen,
  onClose,
  user,
  userLiked = false,
  userSaved = false,
  onLike,
  onSave,
  onShare
}: AdventureModalProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [stepCompletions, setStepCompletions] = useState<{ [key: number]: boolean }>({});
  const [showSchedulePicker, setShowSchedulePicker] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<string>('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState(false);

  // Reset photo index when adventure changes
  useEffect(() => {
    setCurrentPhotoIndex(0);
    setStepCompletions({});
  }, [adventure?.id]);

  // JS-based preloading of adjacent images
  useEffect(() => {
    if (typeof window === 'undefined' || !adventure) return;
    const arr = photos as any[];
    if (!arr || arr.length <= 1) return;
    const nextIdx = (currentPhotoIndex + 1) % arr.length;
    const prevIdx = (currentPhotoIndex - 1 + arr.length) % arr.length;
    const nextUrl = arr[nextIdx]?.url || arr[nextIdx]?.photo_url;
    const prevUrl = arr[prevIdx]?.url || arr[prevIdx]?.photo_url;
    if (nextUrl) {
      const imgNext = new (window as any).Image();
      imgNext.src = nextUrl;
    }
    if (prevUrl) {
      const imgPrev = new (window as any).Image();
      imgPrev.src = prevUrl;
    }
  }, [currentPhotoIndex, adventure]);

  if (!adventure) return null;

  const photos = adventure.photos || 
    adventure.adventure_photos?.map(photo => ({
      url: photo.photo_url,
      source: 'user_uploaded' as const
    })) || 
    [{ url: '/api/placeholder/600/400', source: 'ai_generated' as const }];

  // Get the steps for photo context
  const steps = adventure.steps || adventure.adventure_steps || [];

  const nextPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  // Get current photo's restaurant/business name
  const getCurrentPhotoBusinessName = () => {
    if (steps && steps[currentPhotoIndex]) {
      return steps[currentPhotoIndex].business_info?.name || steps[currentPhotoIndex].title;
    }
    return adventure.custom_title;
  };

  const handleLike = () => {
    onLike?.(adventure.id);
  };

  const handleSave = () => {
    onSave?.(adventure.id);
  };

  const handleShare = () => {
    onShare?.(adventure);
  };

  const handleSchedule = async () => {
    if (!scheduleDate) {
      setShowSchedulePicker(s => !s);
      return;
    }
    try {
      setIsScheduling(true);
      // Optimistic UI: mark scheduled locally; TODO backend endpoint integration
      // (Would POST to /api/adventures/{id}/schedule with { date })
      setScheduleSuccess(false);
      await new Promise(r => setTimeout(r, 600));
      (adventure as any).scheduled_for = scheduleDate;
      setScheduleSuccess(true);
      setShowSchedulePicker(false);
    } catch (e) {
      console.error('Schedule failed', e);
    } finally {
      setIsScheduling(false);
    }
  };

  const toggleStepCompletion = (stepIndex: number) => {
    setStepCompletions(prev => ({
      ...prev,
      [stepIndex]: !prev[stepIndex]
    }));
  };

  const getDurationText = (hours?: number): string => {
    if (!hours) return 'Duration varies';
    if (hours < 1) return `${Math.round(hours * 60)} minutes`;
    if (hours === 1) return '1 hour';
    return `${Math.round(hours)} hours`;
  };

  const getRatingStars = (rating?: number) => {
    if (!rating) return null;
    
    return (
      <div className="flex items-center gap-1">
        <IoStar className="w-4 h-4 text-yellow-500 fill-current" />
        <span className="text-sm font-medium text-gray-700">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const formatTime = (timeStr: string) => {
    try {
      const time = new Date(`2000-01-01T${timeStr}`);
      return time.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return timeStr;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <div className="flex flex-col h-full max-h-[90vh]">
          {/* Header Image Section */}
          <div className="relative h-64 md:h-80 overflow-hidden rounded-t-lg flex-shrink-0">
            <Image
              src={photos[currentPhotoIndex]?.url || '/api/placeholder/600/400'}
              alt={adventure.custom_title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 800px"
              className="object-cover"
            />
            {photos.length > 1 && (
              <div className="hidden">
                <Image src={photos[(currentPhotoIndex + 1) % photos.length]?.url || '/api/placeholder/600/400'} alt="preload next" width={10} height={10} />
                <Image src={photos[(currentPhotoIndex - 1 + photos.length) % photos.length]?.url || '/api/placeholder/600/400'} alt="preload prev" width={10} height={10} />
              </div>
            )}
            
            {/* Photo Navigation */}
            {photos.length > 1 && (
              <>
                <div className="absolute inset-0 flex items-center justify-between p-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={prevPhoto}
                    className="w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm p-0 border border-white/20"
                  >
                    <IoChevronBack className="w-5 h-5 text-white" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={nextPhoto}
                    className="w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm p-0 border border-white/20"
                  >
                    <IoChevronForward className="w-5 h-5 text-white" />
                  </Button>
                </div>
                
                {/* Photo Indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {photos.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentPhotoIndex(index);
                      }}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
            
            {/* Business Name Overlay */}
            <div className="absolute bottom-4 left-4">
              <div className="bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
                <span className="text-white text-sm font-medium">
                  {getCurrentPhotoBusinessName()}
                </span>
              </div>
            </div>
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
            
            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm p-0 border border-white/20"
            >
              <IoClose className="w-5 h-5 text-white" />
            </Button>
            
            {/* Status Badge */}
            {adventure.is_completed !== undefined && (
              <div className="absolute top-4 left-4">
                <Badge 
                  variant={adventure.is_completed ? "default" : "secondary"}
                  className={`${
                    adventure.is_completed 
                      ? 'bg-green-500 text-white' 
                      : 'bg-yellow-500 text-white'
                  } backdrop-blur-sm border border-white/20`}
                >
                  {adventure.is_completed ? (
                    <><IoCheckmarkCircle className="w-3 h-3 mr-1" /> Completed</>
                  ) : (
                    <><IoTime className="w-3 h-3 mr-1" /> Upcoming</>
                  )}
                </Badge>
              </div>
            )}
          </div>
          
          {/* Content Section - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  {adventure.custom_title}
                </h1>
                {adventure.custom_description && (
                  <p className="text-gray-600 text-base leading-relaxed">
                    {adventure.custom_description}
                  </p>
                )}
              </div>
              
              {/* Action Buttons */}
              {user && (
                <div className="flex gap-2 ml-4 flex-wrap justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLike}
                    className="w-10 h-10 rounded-full p-0 border border-gray-200 hover:border-gray-300 shadow-sm"
                  >
                    <IoHeart className={`w-5 h-5 ${userLiked ? 'text-red-500' : 'text-gray-400'}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSave}
                    className="w-10 h-10 rounded-full p-0 border border-gray-200 hover:border-gray-300 shadow-sm"
                  >
                    <IoBookmark className={`w-5 h-5 ${userSaved ? 'text-blue-500' : 'text-gray-400'}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShare}
                    className="w-10 h-10 rounded-full p-0 border border-gray-200 hover:border-gray-300 shadow-sm"
                  >
                    <IoShare className="w-5 h-5 text-gray-400" />
                  </Button>
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSchedulePicker(s=>!s)}
                      className="w-10 h-10 rounded-full p-0 border border-gray-200 hover:border-gray-300 shadow-sm"
                      title="Schedule adventure"
                    >
                      <IoCalendar className="w-5 h-5 text-gray-400" />
                    </Button>
                    {showSchedulePicker && (
                      <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-10 space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700"><IoCalendarOutline className="w-4 h-4"/>Schedule</div>
                        <input
                          type="date"
                          value={scheduleDate}
                          onChange={e=>setScheduleDate(e.target.value)}
                          className="w-full border rounded-md px-2 py-1 text-sm"
                        />
                        <div className="flex gap-2">
                          <Button disabled={isScheduling} onClick={handleSchedule} size="sm" className="flex-1 bg-gradient-to-r from-[#2d5a48] to-[#3c7660] text-white hover:opacity-90">
                            {isScheduling ? 'Saving...' : scheduleDate ? 'Save' : 'Pick date'}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={()=>{setShowSchedulePicker(false); setScheduleDate('');}} className="flex-1">Cancel</Button>
                        </div>
                        {scheduleSuccess && (
                          <div className="flex items-center gap-1 text-xs text-green-600"><IoCheckmark className="w-3 h-3"/>Scheduled</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Adventure Details */}
            <div className="flex flex-wrap gap-6 text-sm text-gray-600">
              {adventure.duration_hours && (
                <div className="flex items-center gap-2">
                  <IoTime className="w-4 h-4" />
                  <span>{getDurationText(adventure.duration_hours)}</span>
                </div>
              )}
              {adventure.location && (
                <div className="flex items-center gap-2">
                  <IoLocationOutline className="w-4 h-4" />
                  <span>{adventure.location}</span>
                </div>
              )}
              {adventure.estimated_cost && (
                <div className="flex items-center gap-2">
                  <IoCash className="w-4 h-4" />
                  <span>{adventure.estimated_cost}</span>
                </div>
              )}
              {adventure.rating && getRatingStars(adventure.rating)}
              {adventure.scheduled_for && (
                <div className="flex items-center gap-2">
                  <IoCalendarOutline className="w-4 h-4" />
                  <span>{new Date(adventure.scheduled_for).toLocaleDateString()}</span>
                </div>
              )}
              {scheduleSuccess && adventure.scheduled_for && (
                <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                  <IoCheckmark className="w-4 h-4"/> Scheduled
                </div>
              )}
            </div>
            
            {/* Author Info */}
            {adventure.profiles && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                {adventure.profiles.profile_picture_url ? (
                  <Image
                    src={adventure.profiles.profile_picture_url}
                    alt="Profile"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <IoPersonOutline className="w-5 h-5 text-gray-500" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {adventure.profiles.display_name || 
                     `${adventure.profiles.first_name || ''} ${adventure.profiles.last_name || ''}`.trim() || 
                     'Anonymous'}
                  </p>
                  <p className="text-sm text-gray-500">Adventure Creator</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Adventure Steps */}
          {adventure.steps && adventure.steps.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Adventure Itinerary</h2>
              <div className="space-y-4">
                {adventure.steps.map((step, index) => {
                  const isCompleted = stepCompletions[index] || false;
                  
                  return (
                    <div
                      key={index}
                      className={`p-4 border rounded-xl transition-all ${
                        isCompleted 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Step Number / Completion Button */}
                        <button
                          onClick={() => toggleStepCompletion(index)}
                          className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all ${
                            isCompleted
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'bg-white border-gray-300 text-gray-600 hover:border-[#3c7660]'
                          }`}
                        >
                          {isCompleted ? (
                            <IoCheckmarkCircle className="w-4 h-4" />
                          ) : (
                            index + 1
                          )}
                        </button>
                        
                        {/* Step Content */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className={`font-medium ${isCompleted ? 'text-green-900' : 'text-gray-900'}`}>
                              {step.title}
                            </h3>
                            {step.time && (
                              <span className="text-sm text-gray-500">
                                {formatTime(step.time)}
                              </span>
                            )}
                          </div>
                          
                          {step.location && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <IoLocationOutline className="w-3 h-3" />
                              <span>{step.location}</span>
                            </div>
                          )}
                          
                          {step.business_info && (
                            <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                              <p className="font-medium text-sm">{step.business_info.name}</p>
                              {step.business_info.address && (
                                <p className="text-xs text-gray-600">{step.business_info.address}</p>
                              )}
                              {step.business_info.rating && (
                                <div className="flex items-center gap-1">
                                  <IoStar className="w-3 h-3 text-yellow-500" />
                                  <span className="text-xs text-gray-600">{step.business_info.rating}</span>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {step.notes && (
                            <p className="text-sm text-gray-600 italic">{step.notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Stats Footer */}
          {(adventure.heart_count || adventure.save_count || adventure.view_count) && (
            <div className="flex items-center justify-center gap-6 pt-4 border-t border-gray-200">
              {adventure.heart_count && adventure.heart_count > 0 && (
                <div className="flex items-center gap-2 text-gray-500">
                  <IoHeart className="w-4 h-4" />
                  <span className="text-sm">{adventure.heart_count} likes</span>
                </div>
              )}
              {adventure.save_count && adventure.save_count > 0 && (
                <div className="flex items-center gap-2 text-gray-500">
                  <IoBookmark className="w-4 h-4" />
                  <span className="text-sm">{adventure.save_count} saves</span>
                </div>
              )}
              {adventure.view_count && adventure.view_count > 0 && (
                <div className="flex items-center gap-2 text-gray-500">
                  <span className="text-sm">{adventure.view_count} views</span>
                </div>
              )}
            </div>
          )}
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
