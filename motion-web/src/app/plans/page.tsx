'use client';

import React, { useState, useEffect } from 'react';
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
  IoLocationOutline,
  IoTimeOutline,
  IoStar,
  IoCalendarOutline,
  IoCheckmarkCircle,
  IoAdd,
  IoEllipsisHorizontal,
  IoGridOutline,
  IoCalendar,
  IoTrash,
  IoEye,
  IoChevronDown,
  IoCompass,
  IoChevronUp
} from 'react-icons/io5';
import Link from 'next/link';
import Image from 'next/image';
import AdventureService from '@/services/AdventureService';
import { SavedAdventure } from '@/types/adventureTypes';
import EnhancedPlansModal from '@/components/EnhancedPlansModal';

// Mock calendar events data - this will be replaced with real data from backend
const mockCalendarEvents = [
  {
    id: "cal-1",
    title: "Wine Country Day Trip",
    date: new Date(2025, 7, 25), // August 25, 2025
    startTime: "9:00 AM",
    endTime: "6:00 PM",
    location: "Napa Valley, CA",
    type: 'adventure' as const,
    status: 'planned' as const,
    color: '#3c7660'
  },
  {
    id: "cal-2",
    title: "Mission District Food Tour",
    date: new Date(2025, 7, 28), // August 28, 2025
    startTime: "11:00 AM",
    endTime: "3:00 PM",
    location: "Mission District, SF",
    type: 'scheduled' as const,
    status: 'planned' as const,
    color: '#3c7660'
  },
  {
    id: "cal-3",
    title: "Golden Gate Sunrise Hike",
    date: new Date(2025, 7, 15), // August 15, 2025
    startTime: "6:00 AM",
    endTime: "9:00 AM",
    location: "Golden Gate Park",
    type: 'adventure' as const,
    status: 'completed' as const,
    color: '#3c7660'
  }
];

export default function PlansPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  const [savedAdventures, setSavedAdventures] = useState<SavedAdventure[]>([]);
  const [scheduledAdventures, setScheduledAdventures] = useState<SavedAdventure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [selectedAdventure, setSelectedAdventure] = useState<SavedAdventure | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [highlightedAdventureId, setHighlightedAdventureId] = useState<string | null>(null);

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
    if (user) {
      console.log('👤 User authenticated, loading adventures...', { userId: user.id, email: user.email });
      loadAdventures();
    } else {
      console.log('👤 No user found, skipping adventure load');
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

  // Schedule adventure
  const handleSchedule = async (date: Date) => {
    if (!selectedAdventure) return;

    try {
      // Update locally
      const updatedAdventure = { 
        ...selectedAdventure, 
        scheduled_for: date.toISOString() 
      };
      setSelectedAdventure(updatedAdventure);

  // Sync with backend
  await AdventureService.scheduleAdventure(selectedAdventure.id, date);
      
      toast.success('Adventure scheduled successfully!');
      
      // Reload to sync
      await loadAdventures();
      
    } catch (error) {
      console.error('Error scheduling adventure:', error);
      toast.error('Failed to schedule adventure');
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
      // Update locally
      const updatedAdventure = { 
        ...selectedAdventure, 
        is_completed: true 
      };
      setSelectedAdventure(updatedAdventure);

  // Sync with backend
  await AdventureService.markAdventureCompleted(selectedAdventure.id);
      
      toast.success('Adventure completed! 🎉');
      setIsModalOpen(false);
      
      // Reload to sync
      await loadAdventures();
      
    } catch (error) {
      console.error('Error completing adventure:', error);
      toast.error('Failed to mark as completed');
    }
  };

  // Delete adventure
  const handleDelete = async () => {
    if (!selectedAdventure) return;

    if (!confirm('Are you sure you want to delete this adventure? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('🗑️ Deleting adventure:', selectedAdventure.id);
      
      // Remove from backend
      const success = await AdventureService.deleteAdventure(selectedAdventure.id);
      
      if (success) {
        toast.success('Adventure deleted successfully');
        setIsModalOpen(false);
        
        // Remove from local state immediately
        setSavedAdventures(prev => prev.filter(a => a.id !== selectedAdventure.id));
        setScheduledAdventures(prev => prev.filter(a => a.id !== selectedAdventure.id));
        
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
        return savedAdventures
          .filter(adventure => adventure.scheduled_for && !adventure.is_completed)
          .sort((a, b) => {
            const dateA = new Date(a.scheduled_for!);
            const dateB = new Date(b.scheduled_for!);
            return dateA.getTime() - dateB.getTime();
          });
      case 'completed':
        // Most recently completed to oldest
        return savedAdventures
          .filter(adventure => adventure.is_completed)
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

  // Get real photo URL from Google Places data
  const getAdventurePhoto = (adventure: SavedAdventure) => {
    // Use adventure photos first, then fallback
    if (adventure.adventure_photos?.length > 0) {
      return adventure.adventure_photos[0].photo_url;
    }
    
  // Fallback to local brand image (no external host or SVG)
  return '/icon.png';
  };

  // Calendar event handler
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  // Render adventure card with 4-column design matching discover page
  const renderAdventureCard = (adventure: SavedAdventure) => {
    const photo = getAdventurePhoto(adventure);
    const completedSteps = adventure.adventure_steps.filter((step: any) => step.completed).length;
    const totalSteps = adventure.adventure_steps.length;
    const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
    
    // Format budget with proper dollar signs
    const formatBudget = (cost: string | number | null | undefined) => {
      if (!cost) return '$';
      // Convert to string if it's a number
      const costStr = String(cost);
      // If it already has $, return as is, otherwise add $
      if (costStr.includes('$')) return costStr;
      // If it's just a number, add $ and format nicely
      if (/^\d+$/.test(costStr)) return `$${costStr}`;
      return `$${costStr}`;
    };
    
    const budgetPerPerson = formatBudget(adventure.estimated_cost || '$');
    const isHighlighted = highlightedAdventureId === adventure.id;

    return (
      <Card 
        key={adventure.id}
        className={`group hover:shadow-xl transition-all duration-300 overflow-hidden bg-gradient-to-br from-white to-gray-50 ${
          isHighlighted 
            ? 'border-4 border-[#f2cc6c] shadow-2xl shadow-[#f2cc6c]/25 animate-pulse' 
            : 'border-0 shadow-md'
        }`}
      >
        <div className="relative">
          {/* Adventure Image with overlay title */}
          <div className="h-48 bg-gradient-to-br from-[#3c7660]/20 to-[#f2cc6c]/20 relative overflow-hidden">
            {photo ? (
              <div className="absolute inset-0">
                <Image
                  src={photo}
                  alt={adventure.custom_title || 'Adventure'}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <IoCompass className="w-16 h-16 text-[#3c7660] opacity-40" />
              </div>
            )}

            {/* Title Overlay with blur background */}
            <div className="absolute bottom-4 left-4 right-16">
              <div className="bg-black/20 backdrop-blur-md rounded-lg px-3 py-2 shadow-lg border border-white/20">
                <h3 className="font-bold text-white text-sm leading-tight line-clamp-2 drop-shadow-lg">
                  {adventure.custom_title || 'Your Adventure'}
                </h3>
              </div>
            </div>
            
            {/* Action Menu */}
            <div className="absolute top-3 right-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="bg-black/20 backdrop-blur-md hover:bg-black/30 rounded-full p-2 shadow-lg border border-white/20 transition-all duration-200"
                  >
                    <IoEllipsisHorizontal className="h-4 w-4 text-white" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem 
                    onClick={() => openAdventureModal(adventure)}
                    className="cursor-pointer"
                  >
                    <IoEye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAdventure(adventure);
                      // Open schedule dialog
                    }}
                    className="cursor-pointer"
                  >
                    <IoCalendarOutline className="mr-2 h-4 w-4" />
                    Schedule
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAdventure(adventure);
                      handleDelete();
                    }}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <IoTrash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Status Badge */}
            {adventure.is_completed && (
              <div className="absolute top-3 left-3">
                <Badge className="bg-green-500/90 text-white border-0 text-xs">
                  <IoCheckmarkCircle className="mr-1 h-3 w-3" />
                  Completed
                </Badge>
              </div>
            )}

            {adventure.scheduled_for && !adventure.is_completed && (
              <div className="absolute top-3 left-3">
                <Badge className="bg-[#3c7660]/90 text-white border-0 text-xs">
                  <IoCalendarOutline className="mr-1 h-3 w-3" />
                  Scheduled
                </Badge>
              </div>
            )}
          </div>
        </div>

        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Progress bar for incomplete adventures */}
            {!adventure.is_completed && totalSteps > 0 && (
              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{completedSteps}/{totalSteps}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-[#3c7660] h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Location and key info */}
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <IoLocationOutline className="w-4 h-4 mr-1 flex-shrink-0" />
                <span className="truncate">{adventure.location || 'Location not specified'}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <IoTimeOutline className="w-4 h-4 mr-1 flex-shrink-0" />
                  {adventure.duration_hours}h
                </div>
                <div className="flex items-center justify-end">
                  <Badge className="bg-[#f2cc6c]/10 text-[#3c7660] text-xs border-[#f2cc6c]/30 font-semibold">
                    {budgetPerPerson}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                size="sm"
                className="flex-1 bg-gradient-to-r from-[#3c7660] to-[#2a5444] hover:from-[#2a5444] hover:to-[#1e3c30] text-white text-xs"
                onClick={() => openAdventureModal(adventure)}
              >
                View Details
              </Button>
              
              {!adventure.scheduled_for && !adventure.is_completed && (
                <Button 
                  size="sm"
                  variant="outline"
                  className="px-3 border-[#3c7660] text-[#3c7660] hover:bg-[#3c7660] hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAdventure(adventure);
                    setShowScheduleModal(true);
                  }}
                >
                  <IoCalendarOutline className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render calendar view
  const renderCalendarView = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-md">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule</h3>
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
          </CardContent>
        </Card>

        {/* Selected Date Adventures */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-md">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedDate ? 
                `Adventures for ${selectedDate.toLocaleDateString()}` : 
                'Select a date to view adventures'
              }
            </h3>
            
            {selectedDate ? (
              <div className="space-y-3">
                {mockCalendarEvents
                  .filter(event => 
                    event.date.toDateString() === selectedDate.toDateString()
                  )
                  .map(event => (
                    <div 
                      key={event.id}
                      className="p-3 bg-[#f8f2d5] rounded-lg border border-[#3c7660]/20"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{event.title}</h4>
                          <div className="flex items-center text-sm text-gray-600 mt-1">
                            <IoTimeOutline className="mr-1 h-3 w-3" />
                            <span>{event.startTime} - {event.endTime}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600 mt-1">
                            <IoLocationOutline className="mr-1 h-3 w-3" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                        <Badge 
                          className={`${
                            event.status === 'completed' 
                              ? 'bg-green-500' 
                              : 'bg-[#3c7660]'
                          } text-white border-0`}
                        >
                          {event.status === 'completed' ? 'Completed' : 'Planned'}
                        </Badge>
                      </div>
                    </div>
                  ))
                }
                
                {mockCalendarEvents
                  .filter(event => 
                    event.date.toDateString() === selectedDate.toDateString()
                  ).length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No adventures scheduled for this date
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Click on a date in the calendar to see scheduled adventures
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white relative">
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

  return (
    <div className="min-h-screen bg-white relative">
      <Navigation />
      
      <div className="pt-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Adventures</h1>
              <p className="text-gray-600">
                {savedAdventures.length === 0 
                  ? "Start creating your first adventure!"
                  : `${savedAdventures.length} adventure${savedAdventures.length !== 1 ? 's' : ''} saved`
                }
              </p>
            </div>
            
            <div className="flex items-center gap-3 mt-4 sm:mt-0">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-white rounded-lg p-1 shadow-sm">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={`${
                    viewMode === 'grid' 
                      ? 'bg-[#3c7660] text-white' 
                      : 'text-gray-600 hover:text-[#3c7660] hover:bg-[#f8f2d5]'
                  } h-8`}
                >
                  <IoGridOutline className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('calendar')}
                  className={`${
                    viewMode === 'calendar' 
                      ? 'bg-[#3c7660] text-white' 
                      : 'text-gray-600 hover:text-[#3c7660] hover:bg-[#f8f2d5]'
                  } h-8`}
                >
                  <IoCalendar className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Create New Adventure */}
              <Link href="/create">
                <Button className="bg-[#3c7660] hover:bg-[#2d5a47] text-white shadow-sm">
                  <IoAdd className="mr-2 h-4 w-4" />
                  New Adventure
                </Button>
              </Link>
            </div>
          </div>

          {/* Content */}
          {viewMode === 'calendar' ? (
            renderCalendarView()
          ) : (
            <>
              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList className="bg-white/70 backdrop-blur-sm border-0 shadow-sm">
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
                      <div className="mx-auto w-24 h-24 bg-[#3c7660]/10 rounded-full flex items-center justify-center mb-6">
                        <IoCalendarOutline className="h-12 w-12 text-[#3c7660]" />
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
                        <Button className="bg-[#3c7660] hover:bg-[#2d5a47] text-white">
                          <IoAdd className="mr-2 h-4 w-4" />
                          Create Your First Adventure
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {filteredAdventures.map(renderAdventureCard)}
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
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedDate) {
                    handleSchedule(selectedDate);
                    setShowScheduleModal(false);
                    setSelectedDate(undefined);
                  }
                }}
                disabled={!selectedDate}
                className="bg-[#3c7660] hover:bg-[#2a5444] text-white"
              >
                Schedule
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
