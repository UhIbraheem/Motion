import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MapPin, Clock, DollarSign, Calendar as CalendarIcon, Share2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function SavedAdventures({ adventures, loading, onSchedule, onShare }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(6).fill(0).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (adventures.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
             style={{ backgroundColor: 'var(--sage-light)' }}>
          <CalendarIcon className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--sage-dark)' }}>
          No saved adventures yet
        </h3>
        <p className="opacity-70 mb-4" style={{ color: 'var(--sage)' }}>
          Create your first adventure to get started
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {adventures.map((adventure) => (
        <Card key={adventure.id} className="hover:shadow-lg transition-all duration-300 border-0 bg-white/80">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold leading-tight" style={{ color: 'var(--sage-dark)' }}>
              {adventure.title}
            </CardTitle>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="secondary" className="text-xs px-2 py-1">
                <MapPin className="w-3 h-3 mr-1" />
                {adventure.location}
              </Badge>
              <Badge variant="secondary" className="text-xs px-2 py-1">
                <Clock className="w-3 h-3 mr-1" />
                {adventure.duration_hours}h
              </Badge>
              <Badge variant="secondary" className="text-xs px-2 py-1">
                <DollarSign className="w-3 h-3 mr-1" />
                {adventure.budget_level}
              </Badge>
            </div>
          </CardHeader>

          <CardContent>
            <p className="text-sm mb-4 line-clamp-3" style={{ color: 'var(--sage)' }}>
              {adventure.description}
            </p>

            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Schedule
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    onSelect={(date) => {
                      if (date) onSchedule(adventure.id, date.toISOString().split('T')[0]);
                    }}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onShare(adventure.id)}
                className="flex-1"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}