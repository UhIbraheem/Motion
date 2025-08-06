"use client";

import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { 
  IoTime,
  IoLocation,
  IoResize,
  IoPeople,
  IoRestaurant,
  IoWalk,
  IoCar,
  IoBicycle,
  IoTrendingUp,
  IoCheckmarkCircle
} from "react-icons/io5";
import { AdventureFilters as AdventureFiltersType } from "../services/aiService";
import { experienceTypes } from "../data/experienceTypes";
import TimingSection from "./TimingSection";

interface AdventureFiltersProps {
  greeting: string;
  filters: AdventureFiltersType;
  setFilters: React.Dispatch<React.SetStateAction<AdventureFiltersType>>;
  isGenerating: boolean;
  onGenerateAdventure: () => void;
  onStartTimeChange: (time: string) => void;
  onDurationChange: (duration: string) => void;
}

const AdventureFilters: React.FC<AdventureFiltersProps> = ({
  greeting,
  filters,
  setFilters,
  isGenerating,
  onGenerateAdventure,
  onStartTimeChange,
  onDurationChange,
}) => {
  const [isDietaryExpanded, setIsDietaryExpanded] = useState(false);
  const maxExperienceSelection = 4;

  // Dietary options (exactly matching mobile)
  const dietaryRestrictions = ['Nut Allergy', 'Gluten-Free', 'Dairy-Free', 'Soy-Free', 'Shellfish Allergy'];
  const foodPreferences = ['Vegetarian', 'Vegan', 'Halal', 'Kosher', 'Local Cuisine', 'Healthy Options'];

  // Helper functions (exactly matching mobile)
  const toggleArraySelection = (array: string[], item: string, setter: (value: string[]) => void, maxLimit?: number) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item));
    } else {
      if (maxLimit && array.length >= maxLimit) {
        alert(`You can only select up to ${maxLimit} options.`);
        return;
      }
      setter([...array, item]);
    }
  };

  const getTransportSuggestion = (radius: number): { icon: any; text: string } => {
    if (radius <= 2) return { icon: IoWalk, text: 'Walking distance' };
    if (radius <= 5) return { icon: IoBicycle, text: 'Bike/scooter friendly' };
    if (radius <= 15) return { icon: IoCar, text: 'Uber/driving recommended' };
    return { icon: IoCar, text: 'Road trip territory' };
  };

  const milesToKm = (miles: number): number => {
    return Math.round(miles * 1.60934 * 10) / 10;
  };

  const formatBudget = (budget: string): string => {
    switch (budget) {
      case 'budget': return 'Budget ($)';
      case 'moderate': return 'Moderate ($$)';
      case 'premium': return 'Premium ($$$)';
      default: return budget;
    }
  };

  // Handle timing section callbacks
  const handleFlexibleToggle = () => {
    setFilters(prev => ({ ...prev, flexibleTiming: !prev.flexibleTiming }));
  };

  const handleCustomEndTimeToggle = () => {
    setFilters(prev => ({ ...prev, customEndTime: !prev.customEndTime }));
  };

  const handleEndTimeChange = (endTime: string) => {
    setFilters(prev => ({ ...prev, endTime }));
  };

  return (
    <div className="flex-1 p-4 max-w-4xl mx-auto">
      {/* Header (exactly matching mobile) */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Create Plan</h1>
        <p className="text-gray-600">
          {greeting}! Tell us what you're in the mood for
        </p>
      </div>

      <Card className="border-0 shadow-lg">
        <CardContent className="p-6 space-y-6">
          {/* Location Input (exactly matching mobile) */}
          <div className="space-y-2">
            <Label className="text-lg font-semibold text-[#3c7660]">
              Location *
            </Label>
            <Input
              placeholder="Enter city, neighborhood, or address"
              value={filters.location || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters(prev => ({ ...prev, location: e.target.value }))}
              className="h-12 text-base border-[#f2cc6c] focus:border-[#3c7660] focus:ring-[#3c7660]"
            />
          </div>

          {/* Adventure Timing (exactly matching mobile) */}
          <div className="space-y-2">
            <Label className="text-[#3c7660] text-base font-semibold flex items-center gap-2">
              <IoTime className="w-4 h-4" />
              Adventure Timing
            </Label>
            
            <TimingSection
              startTime={filters.startTime || '10:00'}
              endTime={filters.endTime || '16:00'}
              duration={filters.duration || 'half-day'}
              flexibleTiming={filters.flexibleTiming || false}
              customEndTime={filters.customEndTime || false}
              onStartTimeChange={onStartTimeChange}
              onDurationChange={onDurationChange}
              onFlexibleToggle={handleFlexibleToggle}
              onCustomEndTimeToggle={handleCustomEndTimeToggle}
              onEndTimeChange={handleEndTimeChange}
            />
          </div>

          {/* Experience Types (exactly matching mobile) */}
          <div className="space-y-3">
            <Label className="text-lg font-semibold text-[#3c7660] flex items-center gap-2">
              <IoTrendingUp className="w-4 h-4" />
              What type of experience? (Choose up to {maxExperienceSelection})
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {experienceTypes.map((type) => {
                const isSelected = filters.experienceTypes?.includes(type.id) || false;
                return (
                  <Button
                    key={type.id}
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => toggleArraySelection(
                      filters.experienceTypes || [],
                      type.id,
                      (newTypes) => setFilters(prev => ({ ...prev, experienceTypes: newTypes })),
                      maxExperienceSelection
                    )}
                    className={`h-auto p-4 flex-col items-start text-left ${
                      isSelected 
                        ? "bg-[#3c7660] hover:bg-[#2a5444] text-white border-[#f2cc6c]" 
                        : "border-[#f2cc6c] hover:border-[#f2cc6c] hover:bg-[#f2cc6c]/10"
                    }`}
                  >
                    <div className="font-semibold text-sm">{type.name}</div>
                    <div className="text-xs opacity-80 mt-1">{type.description}</div>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Budget Selection (exactly matching mobile) */}
          <div className="space-y-3">
            <Label className="text-lg font-semibold text-[#3c7660]">Budget</Label>
            <div className="grid grid-cols-3 gap-3">
              {(['budget', 'moderate', 'premium'] as const).map((budgetOption) => {
                const isSelected = filters.budget === budgetOption;
                return (
                  <Button
                    key={budgetOption}
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => setFilters(prev => ({ ...prev, budget: budgetOption }))}
                    className={`h-12 ${
                      isSelected 
                        ? "bg-[#3c7660] hover:bg-[#2a5444] text-white border-[#f2cc6c]" 
                        : "border-[#f2cc6c] hover:border-[#f2cc6c] hover:bg-[#f2cc6c]/10"
                    }`}
                  >
                    {formatBudget(budgetOption)}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Group Size and Transport (exactly matching mobile) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-lg font-semibold text-[#3c7660] flex items-center gap-2">
                <IoPeople className="w-4 h-4" />
                Group Size
              </Label>
              <Select
                value={filters.groupSize?.toString() || '1'}
                onValueChange={(value) => setFilters(prev => ({ ...prev, groupSize: parseInt(value) }))}
              >
                <SelectTrigger className="h-12 border-[#f2cc6c] focus:border-[#3c7660]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Solo (1 person)</SelectItem>
                  <SelectItem value="2">Couple (2 people)</SelectItem>
                  <SelectItem value="3">Small group (3-4 people)</SelectItem>
                  <SelectItem value="6">Large group (5+ people)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-lg font-semibold text-[#3c7660]">Transportation</Label>
              <Select
                value={filters.transportMethod || 'flexible'}
                onValueChange={(value) => setFilters(prev => ({ ...prev, transportMethod: value as any }))}
              >
                <SelectTrigger className="h-12 border-[#f2cc6c] focus:border-[#3c7660]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="walking">Walking only</SelectItem>
                  <SelectItem value="bike">Bike/Scooter</SelectItem>
                  <SelectItem value="rideshare">Uber/Lyft/Car</SelectItem>
                  <SelectItem value="flexible">Flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Radius Slider (exactly matching mobile) */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold text-[#3c7660] flex items-center gap-2">
              <IoResize className="w-4 h-4" />
              Max Distance
            </Label>
            <Card className="bg-[#3c7660]/5 border-[#3c7660]/20">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[#3c7660] font-semibold text-lg">
                    {filters.radius || 5} miles
                  </span>
                  <span className="text-[#3c7660] text-sm">
                    ({milesToKm(filters.radius || 5)} km)
                  </span>
                </div>
                
                <Slider
                  value={[filters.radius || 5]}
                  onValueChange={(value: number[]) => setFilters(prev => ({ ...prev, radius: value[0] }))}
                  max={30}
                  min={1}
                  step={1}
                  className="mb-4"
                />
                
                <div className="flex items-center gap-2 text-[#3c7660]">
                  {React.createElement(getTransportSuggestion(filters.radius || 5).icon, { className: "w-4 h-4" })}
                  <span className="text-sm">{getTransportSuggestion(filters.radius || 5).text}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Dietary Restrictions and Food Preferences (exactly matching mobile) */}
          <div className="space-y-4">
            <Button
              variant="outline"
              onClick={() => setIsDietaryExpanded(!isDietaryExpanded)}
              className="w-full h-12 border-[#f2cc6c] text-[#3c7660] hover:bg-[#f2cc6c]/10 hover:text-[#3c7660]"
            >
              <IoRestaurant className="w-5 h-5 mr-2" />
              Dietary Restrictions & Food Preferences
              {isDietaryExpanded ? ' ▼' : ' ▶'}
            </Button>

            {isDietaryExpanded && (
              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-[#3c7660]">Dietary Restrictions</Label>
                    <div className="flex flex-wrap gap-2">
                      {dietaryRestrictions.map((restriction) => {
                        const isSelected = filters.dietaryRestrictions?.includes(restriction) || false;
                        return (
                          <Badge
                            key={restriction}
                            variant={isSelected ? "default" : "outline"}
                            className={`cursor-pointer p-2 ${
                              isSelected 
                                ? "bg-red-500 hover:bg-red-600 text-white" 
                                : "border-red-300 text-red-700 hover:bg-red-50"
                            }`}
                            onClick={() => toggleArraySelection(
                              filters.dietaryRestrictions || [],
                              restriction,
                              (newRestrictions) => setFilters(prev => ({ ...prev, dietaryRestrictions: newRestrictions }))
                            )}
                          >
                            {restriction}
                            {isSelected && <IoCheckmarkCircle className="w-3 h-3 ml-1" />}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-[#3c7660]">Food Preferences</Label>
                    <div className="flex flex-wrap gap-2">
                      {foodPreferences.map((preference) => {
                        const isSelected = filters.foodPreferences?.includes(preference) || false;
                        return (
                          <Badge
                            key={preference}
                            variant={isSelected ? "default" : "outline"}
                            className={`cursor-pointer p-2 ${
                              isSelected 
                                ? "bg-[#3c7660] hover:bg-[#2a5444] text-white" 
                                : "border-[#3c7660] text-[#3c7660] hover:bg-[#3c7660]/10"
                            }`}
                            onClick={() => toggleArraySelection(
                              filters.foodPreferences || [],
                              preference,
                              (newPreferences) => setFilters(prev => ({ ...prev, foodPreferences: newPreferences }))
                            )}
                          >
                            {preference}
                            {isSelected && <IoCheckmarkCircle className="w-3 h-3 ml-1" />}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Generate Button (exactly matching mobile) */}
          <div className="pt-6">
            <Button
              onClick={onGenerateAdventure}
              disabled={isGenerating || !filters.location?.trim()}
              className="w-full h-14 text-lg font-semibold bg-[#3c7660] hover:bg-[#2a5444] text-white disabled:opacity-50"
            >
              {isGenerating ? (
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Generating Your Adventure...
                </div>
              ) : (
                'Generate My Adventure'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdventureFilters;
