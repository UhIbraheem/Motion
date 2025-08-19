import React, { useState } from 'react';
import { X, MapPin, Clock, Calendar, Star, CheckCircle2, Circle, Phone, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

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
  business_hours?: string;
  business_phone?: string;
  business_website?: string;
}

interface PlansAdventureModalProps {
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
  onSchedule: (date: string) => void;
  onMarkCompleted: () => void;
  onStepToggle: (stepId: string, completed: boolean) => void;
}

export default function PlansAdventureModal({
  adventure,
  isOpen,
  onClose,
  onSchedule,
  onMarkCompleted,
  onStepToggle
}: PlansAdventureModalProps) {
  const [scheduledDate, setScheduledDate] = useState(adventure.scheduled_for || '');
  
  if (!isOpen) return null;

  const completedSteps = adventure.steps.filter(step => step.completed).length;
  const totalSteps = adventure.steps.length;
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  const handleScheduleSubmit = () => {
    if (scheduledDate) {
      onSchedule(scheduledDate);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{adventure.title}</h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {adventure.location}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {adventure.duration}
              </div>
              {adventure.google_places_validated && (
                <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
                  <span className="text-green-600">✓</span>
                  Verified Places
                </Badge>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Progress: {completedSteps}/{totalSteps} steps completed
              </span>
              <span className="text-sm text-gray-500">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-[#3c7660] h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Scheduling Section */}
          <Card className="p-4 mb-6 bg-gray-50">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Schedule Adventure
            </h3>
            <div className="flex items-center gap-3">
              <input
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3c7660]"
              />
              <Button 
                onClick={handleScheduleSubmit}
                disabled={!scheduledDate}
                className="bg-[#3c7660] hover:bg-[#2d5a48] text-white"
              >
                {adventure.scheduled_for ? 'Reschedule' : 'Schedule'}
              </Button>
              {adventure.scheduled_for && (
                <span className="text-sm text-gray-600">
                  Currently scheduled for {new Date(adventure.scheduled_for).toLocaleString()}
                </span>
              )}
            </div>
          </Card>

          {/* Description */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700">{adventure.description}</p>
          </div>

          {/* Tags */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {adventure.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Adventure Steps Checklist */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Adventure Steps</h3>
            <div className="space-y-3">
              {adventure.steps.map((step) => (
                <Card key={step.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => onStepToggle(step.id, !step.completed)}
                      className="mt-1 flex-shrink-0"
                    >
                      {step.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-[#3c7660]" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400 hover:text-[#3c7660]" />
                      )}
                    </button>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className={`font-medium ${step.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                            {step.business_name || step.title}
                          </h4>
                          <p className={`text-sm mt-1 ${step.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                            {step.description}
                          </p>
                          
                          {/* Business Details */}
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {step.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {step.duration}
                            </div>
                            {step.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                {step.rating.toFixed(1)}
                              </div>
                            )}
                            {step.validated && (
                              <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50 px-1 py-0">
                                ✓ Verified
                              </Badge>
                            )}
                          </div>

                          {/* Additional Business Info */}
                          {(step.business_hours || step.business_phone || step.business_website) && (
                            <div className="mt-2 space-y-1">
                              {step.business_hours && (
                                <p className="text-xs text-gray-500">Hours: {step.business_hours}</p>
                              )}
                              {step.business_phone && (
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {step.business_phone}
                                </p>
                              )}
                              {step.business_website && (
                                <a 
                                  href={step.business_website} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-[#3c7660] hover:underline flex items-center gap-1"
                                >
                                  <Globe className="w-3 h-3" />
                                  Visit Website
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              onClick={onMarkCompleted}
              disabled={adventure.is_completed}
              className="bg-[#3c7660] hover:bg-[#2d5a48] text-white"
            >
              {adventure.is_completed ? 'Completed' : 'Mark as Completed'}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
