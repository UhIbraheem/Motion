
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MapPin, Clock, DollarSign, Calendar as CalendarIcon, Bookmark, Share2, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";

export default function GeneratedAdventures({ adventures, onSave, preferences }) {
  const [expandedAdventure, setExpandedAdventure] = useState(0);
  const [schedulingAdventure, setSchedulingAdventure] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  const handleSaveAdventure = async (adventure, isScheduled = false) => {
    await onSave(adventure, isScheduled, selectedDate);
    setSchedulingAdventure(null);
    setSelectedDate(null);
  };

  const getBudgetColor = (budget) => {
    switch (budget) {
      case '$': return 'var(--teal)';
      case '$$': return 'var(--sage)';
      case '$$$': return 'var(--gold)';
      default: return 'var(--sage)';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--sage-dark)' }}>
          Your Perfect Adventures
        </h3>
        <p className="opacity-80" style={{ color: 'var(--sage)' }}>
          AI-crafted experiences tailored just for you
        </p>
      </div>

      {adventures.map((adventure, index) => (
        <Card key={index} className="border border-gold/30 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between mb-3">
              <CardTitle className="text-xl font-bold leading-tight" style={{ color: 'var(--sage-dark)' }}>
                {adventure.title}
              </CardTitle>
              <Badge className="text-xs px-3 py-1"
                     style={{ backgroundColor: 'var(--sage-light)', color: 'white' }}>
                {adventure.experience_type || preferences.experienceType}
              </Badge>
            </div>
            
            <div className="flex flex-wrap gap-3 mb-4">
              <Badge variant="secondary" className="text-xs px-3 py-1 bg-white/60 border border-sage/20">
                <MapPin className="w-3 h-3 mr-1" />
                {preferences.location}
              </Badge>
              <Badge variant="secondary" className="text-xs px-3 py-1 bg-white/60 border border-sage/20">
                <Clock className="w-3 h-3 mr-1" />
                {adventure.duration_hours || preferences.duration}h
              </Badge>
              <Badge variant="secondary" 
                     className="text-xs px-3 py-1 bg-white/60 border border-sage/20"
                     style={{ color: getBudgetColor(preferences.budget) }}>
                <DollarSign className="w-3 h-3 mr-1" />
                ~${adventure.estimated_cost || '50-100'}
              </Badge>
            </div>

            <p className="text-sm mb-4 opacity-80" style={{ color: 'var(--sage)' }}>
              {adventure.description}
            </p>

            <Button
              variant="outline"
              onClick={() => setExpandedAdventure(expandedAdventure === index ? -1 : index)}
              className="w-full justify-between rounded-xl border-sage/20"
            >
              {expandedAdventure === index ? 'Hide Details' : 'View Full Itinerary'}
              {expandedAdventure === index ? 
                <ChevronUp className="w-4 h-4" /> : 
                <ChevronDown className="w-4 h-4" />
              }
            </Button>
          </CardHeader>

          {expandedAdventure === index && (
            <CardContent className="pt-0">
              <div className="space-y-4 mb-6">
                <h4 className="font-semibold" style={{ color: 'var(--sage-dark)' }}>
                  Your Adventure Timeline
                </h4>
                <div className="space-y-4">
                  {adventure.steps?.map((step, stepIndex) => (
                    <div key={stepIndex} className="flex gap-4 p-4 rounded-xl bg-cream/50 border border-sage/10">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm"
                           style={{ backgroundColor: 'var(--sage)', color: 'white' }}>
                        {step.step_number || stepIndex + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-semibold" style={{ color: 'var(--sage-dark)' }}>
                            {step.time || `${preferences.startTime} + ${stepIndex * 60}min`}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {step.duration_minutes || 60} min
                          </Badge>
                          {step.estimated_cost && (
                            <Badge variant="outline" className="text-xs" style={{ color: getBudgetColor(preferences.budget) }}>
                              ${step.estimated_cost}
                            </Badge>
                          )}
                        </div>
                        <h5 className="font-semibold mb-1" style={{ color: 'var(--sage-dark)' }}>
                          {step.location}
                        </h5>
                        <p className="text-sm mb-2" style={{ color: 'var(--sage)' }}>
                          {step.activity || step.description}
                        </p>
                        {step.address && (
                          <p className="text-xs opacity-70" style={{ color: 'var(--sage)' }}>
                            📍 {step.address}
                          </p>
                        )}
                        {step.booking_info && (
                          <p className="text-xs mt-2 p-2 bg-yellow-50 rounded border-l-2 border-yellow-400">
                            💡 {step.booking_info}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          )}

          <CardContent className="pt-0">
            <div className="flex gap-3">
              <Button
                onClick={() => handleSaveAdventure(adventure)}
                className="flex-1 rounded-xl shadow-md"
                style={{ backgroundColor: 'var(--sage)', color: 'white' }}
              >
                <Bookmark className="w-4 h-4 mr-2" />
                Save Adventure
              </Button>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl border-sage/30"
                  >
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Schedule
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      if (date) {
                        handleSaveAdventure(adventure, true);
                      }
                    }}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>

              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl"
                style={{ color: 'var(--sage)' }}
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
