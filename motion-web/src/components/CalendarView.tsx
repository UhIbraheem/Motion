'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  IoChevronBack,
  IoChevronForward,
  IoToday,
  IoCalendarOutline,
  IoTimeOutline,
  IoLocationOutline,
  IoAdd,
  IoEllipsisHorizontal
} from 'react-icons/io5';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  location?: string;
  type: 'adventure' | 'scheduled' | 'suggestion';
  status: 'planned' | 'completed' | 'cancelled';
  color: string;
}

interface CalendarViewProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  onAddEvent?: (date: Date) => void;
}

export default function CalendarView({ 
  events, 
  onEventClick, 
  onDateClick, 
  onAddEvent 
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of the month and calculate calendar grid
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday
  const daysInMonth = lastDayOfMonth.getDate();

  // Generate calendar days
  const calendarDays: (Date | null)[] = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(year, month, day));
  }

  // Add empty cells to complete the last week if needed
  while (calendarDays.length % 7 !== 0) {
    calendarDays.push(null);
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(new Date(year, month + (direction === 'next' ? 1 : -1), 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  const isToday = (date: Date | null): boolean => {
    if (!date) return false;
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date | null): boolean => {
    if (!date) return false;
    return date.getMonth() === month && date.getFullYear() === year;
  };

  const getEventTypeColor = (type: string, status: string) => {
    if (status === 'completed') return 'bg-gray-400';
    if (status === 'cancelled') return 'bg-red-200';
    
    switch (type) {
      case 'adventure': return 'bg-[#3c7660]';
      case 'scheduled': return 'bg-blue-500';
      case 'suggestion': return 'bg-[#f2cc6c]';
      default: return 'bg-gray-400';
    }
  };

  const renderMonthView = () => (
    <div className="grid grid-cols-7 gap-1">
      {/* Week day headers */}
      {weekDays.map(day => (
        <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 border-b">
          {day}
        </div>
      ))}
      
      {/* Calendar days */}
      {calendarDays.map((date, index) => {
        const dayEvents = date ? getEventsForDate(date) : [];
        const isCurrentDay = isToday(date);
        const isCurrentMonthDay = isCurrentMonth(date);
        
        return (
          <div
            key={index}
            className={`min-h-24 p-1 border border-gray-100 cursor-pointer transition-colors ${
              isCurrentDay 
                ? 'bg-[#3c7660]/10 border-[#3c7660]' 
                : 'hover:bg-gray-50'
            } ${!isCurrentMonthDay ? 'opacity-30' : ''}`}
            onClick={() => {
              if (date && onDateClick) onDateClick(date);
            }}
          >
            {date && (
              <>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm ${
                    isCurrentDay 
                      ? 'font-bold text-[#3c7660]' 
                      : isCurrentMonthDay 
                        ? 'text-gray-900' 
                        : 'text-gray-400'
                  }`}>
                    {date.getDate()}
                  </span>
                  {isCurrentMonthDay && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-5 h-5 p-0 opacity-0 group-hover:opacity-100 hover:bg-[#3c7660] hover:text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onAddEvent) onAddEvent(date);
                      }}
                    >
                      <IoAdd className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                
                {/* Events for this day */}
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map(event => (
                    <div
                      key={event.id}
                      className={`text-xs p-1 rounded text-white truncate cursor-pointer ${getEventTypeColor(event.type, event.status)}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onEventClick) onEventClick(event);
                      }}
                    >
                      {event.startTime} {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-gray-500 pl-1">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderWeekView = () => {
    // Get the week containing the current date
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });

    return (
      <div className="grid grid-cols-8 gap-1">
        {/* Time column header */}
        <div className="p-2 text-center text-sm font-medium text-gray-500 border-b">
          Time
        </div>
        
        {/* Week day headers */}
        {weekDays.map(day => (
          <div key={day.toDateString()} className="p-2 text-center border-b">
            <div className="text-sm font-medium text-gray-900">
              {weekDays[0].toLocaleDateString('en-US', { weekday: 'short' })}
            </div>
            <div className={`text-lg ${
              isToday(day) ? 'font-bold text-[#3c7660]' : 'text-gray-700'
            }`}>
              {day.getDate()}
            </div>
          </div>
        ))}
        
        {/* Time slots */}
        {Array.from({ length: 12 }, (_, hour) => {
          const timeSlot = hour + 8; // Start from 8 AM
          const timeString = `${timeSlot > 12 ? timeSlot - 12 : timeSlot}:00 ${timeSlot >= 12 ? 'PM' : 'AM'}`;
          
          return (
            <React.Fragment key={timeSlot}>
              {/* Time label */}
              <div className="p-2 text-sm text-gray-500 border-r">
                {timeString}
              </div>
              
              {/* Day columns */}
              {weekDays.map(day => {
                const dayEvents = getEventsForDate(day);
                const hourEvents = dayEvents.filter(event => {
                  const eventHour = parseInt(event.startTime.split(':')[0]);
                  const eventAmPm = event.startTime.includes('PM') ? 12 : 0;
                  return (eventHour + eventAmPm) === timeSlot;
                });
                
                return (
                  <div
                    key={`${day.toDateString()}-${timeSlot}`}
                    className="min-h-12 p-1 border border-gray-100 cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                      if (onDateClick) onDateClick(day);
                    }}
                  >
                    {hourEvents.map(event => (
                      <div
                        key={event.id}
                        className={`text-xs p-1 rounded text-white truncate mb-1 ${getEventTypeColor(event.type, event.status)}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onEventClick) onEventClick(event);
                        }}
                      >
                        {event.title}
                      </div>
                    ))}
                  </div>
                );
              })}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate).sort((a, b) => 
      a.startTime.localeCompare(b.startTime)
    );

    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            {currentDate.toLocaleDateString('en-US', { 
              weekday: 'long',
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
        </div>
        
        {dayEvents.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <IoCalendarOutline className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No adventures planned for this day</p>
            <Button
              className="mt-4 bg-[#3c7660] hover:bg-[#2d5a48] text-white"
              onClick={() => onAddEvent && onAddEvent(currentDate)}
            >
              <IoAdd className="w-4 h-4 mr-2" />
              Plan an Adventure
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {dayEvents.map(event => (
              <Card
                key={event.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  event.status === 'completed' ? 'opacity-60' : ''
                }`}
                onClick={() => onEventClick && onEventClick(event)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={`w-3 h-3 rounded-full ${getEventTypeColor(event.type, event.status)}`} />
                        <h4 className="font-semibold text-gray-900">{event.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {event.type}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center">
                          <IoTimeOutline className="w-4 h-4 mr-1" />
                          {event.startTime} - {event.endTime}
                        </div>
                        {event.location && (
                          <div className="flex items-center">
                            <IoLocationOutline className="w-4 h-4 mr-1" />
                            {event.location}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Button variant="ghost" size="sm">
                      <IoEllipsisHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          {/* Navigation */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
              >
                <IoChevronBack className="w-4 h-4" />
              </Button>
              
              <h2 className="text-xl font-bold min-w-48 text-center">
                {viewMode === 'day' 
                  ? currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                  : `${monthNames[month]} ${year}`
                }
              </h2>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
              >
                <IoChevronForward className="w-4 h-4" />
              </Button>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="flex items-center space-x-2"
            >
              <IoToday className="w-4 h-4" />
              <span>Today</span>
            </Button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            {(['month', 'week', 'day'] as const).map(mode => (
              <Button
                key={mode}
                variant={viewMode === mode ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode(mode)}
                className={`${
                  viewMode === mode 
                    ? "bg-[#3c7660] text-white shadow-sm hover:bg-[#2d5a48]" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'day' && renderDayView()}
      </CardContent>
    </Card>
  );
}
