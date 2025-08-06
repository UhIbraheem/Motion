"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { IoTime, IoCalendar } from "react-icons/io5";

interface TimingSectionProps {
  startTime: string;
  endTime: string;
  duration: string;
  flexibleTiming: boolean;
  customEndTime: boolean;
  onStartTimeChange: (time: string) => void;
  onDurationChange: (duration: string) => void;
  onFlexibleToggle: () => void;
  onCustomEndTimeToggle: () => void;
  onEndTimeChange: (time: string) => void;
}

const TimingSection: React.FC<TimingSectionProps> = ({
  startTime,
  endTime,
  duration,
  flexibleTiming,
  customEndTime,
  onStartTimeChange,
  onDurationChange,
  onFlexibleToggle,
  onCustomEndTimeToggle,
  onEndTimeChange,
}) => {
  // Format time for display (24h to 12h)
  const formatTimeDisplay = (time: string): string => {
    const hour = parseInt(time.split(':')[0]);
    if (hour === 0) return '12:00 AM';
    if (hour < 12) return `${hour}:00 AM`;
    if (hour === 12) return '12:00 PM';
    return `${hour - 12}:00 PM`;
  };

  // Generate time options
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 6; hour <= 23; hour++) {
      const time24 = `${hour.toString().padStart(2, '0')}:00`;
      const time12 = formatTimeDisplay(time24);
      times.push({ value: time24, label: time12 });
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  return (
    <Card className="bg-gray-50 border-gray-200">
      <CardContent className="p-4 space-y-4">
        {/* Flexible Timing Toggle */}
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-[#3c7660]">Flexible timing</Label>
          <Button
            variant={flexibleTiming ? "default" : "outline"}
            size="sm"
            onClick={onFlexibleToggle}
            className={flexibleTiming 
              ? "bg-[#3c7660] hover:bg-[#2a5444] text-white" 
              : "border-[#3c7660] text-[#3c7660] hover:bg-[#3c7660]/10"
            }
          >
            {flexibleTiming ? 'Flexible' : 'Specific'}
          </Button>
        </div>

        {!flexibleTiming && (
          <>
            {/* Start Time and Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Start Time</Label>
                <Select value={startTime} onValueChange={onStartTimeChange}>
                  <SelectTrigger className="h-10 border-gray-300 focus:border-[#3c7660]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={time.value} value={time.value}>
                        {time.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Duration</Label>
                <Select value={duration} onValueChange={onDurationChange}>
                  <SelectTrigger className="h-10 border-gray-300 focus:border-[#3c7660]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quick">Quick (1-2 hours)</SelectItem>
                    <SelectItem value="half-day">Half Day (3-6 hours)</SelectItem>
                    <SelectItem value="full-day">Full Day (6+ hours)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Custom End Time */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700">Custom end time</Label>
                <Button
                  variant={customEndTime ? "default" : "outline"}
                  size="sm"
                  onClick={onCustomEndTimeToggle}
                  className={customEndTime 
                    ? "bg-[#3c7660] hover:bg-[#2a5444] text-white" 
                    : "border-[#3c7660] text-[#3c7660] hover:bg-[#3c7660]/10"
                  }
                >
                  {customEndTime ? 'Custom' : 'Auto'}
                </Button>
              </div>

              {customEndTime && (
                <Select value={endTime} onValueChange={onEndTimeChange}>
                  <SelectTrigger className="h-10 border-gray-300 focus:border-[#3c7660]">
                    <SelectValue placeholder="Select end time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={time.value} value={time.value}>
                        {time.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {!customEndTime && (
                <div className="flex items-center gap-2 p-3 bg-[#3c7660]/10 rounded-md border border-[#3c7660]/20">
                  <IoTime className="w-4 h-4 text-[#3c7660]" />
                  <span className="text-sm text-[#3c7660] font-medium">
                    Auto-calculated: {formatTimeDisplay(endTime)}
                  </span>
                </div>
              )}
            </div>
          </>
        )}

        {flexibleTiming && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-md border border-blue-200">
            <IoCalendar className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-700">
              We'll suggest the best times based on your preferences
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TimingSection;
