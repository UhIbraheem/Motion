'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  IoSparkles,
  IoTime,
  IoCash,
  IoCompass,
  IoHeart,
  IoSunny,
  IoMoon,
  IoRestaurant,
  IoCamera,
  IoWalk,
  IoBicycle,
  IoCar,
  IoTrain,
  IoCheckmark,
  IoAdd
} from 'react-icons/io5';

interface AIFilter {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'experience' | 'budget' | 'time' | 'mood' | 'transportation';
  aiPrompt: string;
  isActive: boolean;
}

interface AIFiltersProps {
  onFiltersChange: (activeFilters: AIFilter[]) => void;
  className?: string;
}

export default function AIFilters({ onFiltersChange, className = '' }: AIFiltersProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [customFilter, setCustomFilter] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const aiFilters: AIFilter[] = [
    // Experience Type Filters
    {
      id: 'romantic',
      name: 'Romantic',
      description: 'Perfect for couples and intimate moments',
      icon: <IoHeart className="w-4 h-4" />,
      category: 'experience',
      aiPrompt: 'Find romantic and intimate experiences perfect for couples, including sunset spots, cozy cafes, and scenic viewpoints',
      isActive: false
    },
    {
      id: 'foodie',
      name: 'Foodie Adventure',
      description: 'Discover amazing local flavors and cuisine',
      icon: <IoRestaurant className="w-4 h-4" />,
      category: 'experience',
      aiPrompt: 'Focus on culinary experiences, local restaurants, food markets, and unique dining spots',
      isActive: false
    },
    {
      id: 'photography',
      name: 'Instagram Worthy',
      description: 'Beautiful spots perfect for photos',
      icon: <IoCamera className="w-4 h-4" />,
      category: 'experience',
      aiPrompt: 'Find visually stunning locations, street art, architecture, and scenic spots perfect for photography',
      isActive: false
    },
    {
      id: 'nature',
      name: 'Nature Escape',
      description: 'Outdoor adventures and natural beauty',
      icon: <IoCompass className="w-4 h-4" />,
      category: 'experience',
      aiPrompt: 'Prioritize outdoor activities, hiking trails, parks, beaches, and natural landmarks',
      isActive: false
    },

    // Time-based Filters
    {
      id: 'morning',
      name: 'Morning Person',
      description: 'Early bird adventures and sunrise spots',
      icon: <IoSunny className="w-4 h-4" />,
      category: 'time',
      aiPrompt: 'Focus on morning activities, breakfast spots, sunrise viewpoints, and early-opening attractions',
      isActive: false
    },
    {
      id: 'evening',
      name: 'Night Owl',
      description: 'Evening entertainment and nightlife',
      icon: <IoMoon className="w-4 h-4" />,
      category: 'time',
      aiPrompt: 'Emphasize evening activities, bars, nightlife, sunset spots, and late-night dining',
      isActive: false
    },

    // Budget Filters
    {
      id: 'budget',
      name: 'Budget Friendly',
      description: 'Great experiences without breaking the bank',
      icon: <IoCash className="w-4 h-4" />,
      category: 'budget',
      aiPrompt: 'Prioritize free or low-cost activities, public spaces, and affordable local gems',
      isActive: false
    },

    // Transportation Filters
    {
      id: 'walking',
      name: 'Walking Distance',
      description: 'Everything within a pleasant walk',
      icon: <IoWalk className="w-4 h-4" />,
      category: 'transportation',
      aiPrompt: 'Focus on walkable areas and activities within walking distance of each other',
      isActive: false
    },
    {
      id: 'biking',
      name: 'Bike Friendly',
      description: 'Perfect for cycling adventures',
      icon: <IoBicycle className="w-4 h-4" />,
      category: 'transportation',
      aiPrompt: 'Include bike-friendly routes, bike rental spots, and cycling-accessible locations',
      isActive: false
    },
    {
      id: 'driving',
      name: 'Road Trip Ready',
      description: 'Scenic drives and car-accessible spots',
      icon: <IoCar className="w-4 h-4" />,
      category: 'transportation',
      aiPrompt: 'Focus on drive-accessible locations, scenic routes, and parking-friendly destinations',
      isActive: false
    },
    {
      id: 'transit',
      name: 'Public Transit',
      description: 'Accessible by bus, train, or metro',
      icon: <IoTrain className="w-4 h-4" />,
      category: 'transportation',
      aiPrompt: 'Prioritize locations accessible by public transportation with good transit connections',
      isActive: false
    }
  ];

  const toggleFilter = (filterId: string) => {
    const newActiveFilters = activeFilters.includes(filterId)
      ? activeFilters.filter(id => id !== filterId)
      : [...activeFilters, filterId];
    
    setActiveFilters(newActiveFilters);
    
    const activeFilterObjects = aiFilters.filter(filter => 
      newActiveFilters.includes(filter.id)
    ).map(filter => ({ ...filter, isActive: true }));
    
    onFiltersChange(activeFilterObjects);
  };

  const addCustomFilter = () => {
    if (customFilter.trim()) {
      const customFilterObj: AIFilter = {
        id: `custom-${Date.now()}`,
        name: customFilter,
        description: 'Custom AI filter',
        icon: <IoSparkles className="w-4 h-4" />,
        category: 'experience',
        aiPrompt: `Find experiences related to: ${customFilter}`,
        isActive: true
      };
      
      const newActiveFilters = [...activeFilters, customFilterObj.id];
      setActiveFilters(newActiveFilters);
      
      const activeFilterObjects = [...aiFilters.filter(filter => 
        activeFilters.includes(filter.id)
      ), customFilterObj].map(filter => ({ ...filter, isActive: true }));
      
      onFiltersChange(activeFilterObjects);
      setCustomFilter('');
      setShowCustomInput(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'experience':
        return 'border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700';
      case 'budget':
        return 'border-green-200 bg-green-50 hover:bg-green-100 text-green-700';
      case 'time':
        return 'border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700';
      case 'transportation':
        return 'border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-700';
      default:
        return 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700';
    }
  };

  const categories = [
    { key: 'experience', label: 'Experience Type', icon: <IoCompass className="w-4 h-4" /> },
    { key: 'time', label: 'Best Time', icon: <IoTime className="w-4 h-4" /> },
    { key: 'budget', label: 'Budget', icon: <IoCash className="w-4 h-4" /> },
    { key: 'transportation', label: 'Getting Around', icon: <IoCar className="w-4 h-4" /> }
  ];

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <IoSparkles className="w-5 h-5 text-[#3c7660]" />
          <h3 className="text-lg font-semibold text-gray-900">AI-Powered Filters</h3>
        </div>
        <Badge className="bg-[#3c7660]/10 text-[#3c7660]">
          {activeFilters.length} active
        </Badge>
      </div>

      <div className="space-y-6">
        {categories.map(category => {
          const categoryFilters = aiFilters.filter(filter => filter.category === category.key);
          
          return (
            <div key={category.key}>
              <div className="flex items-center space-x-2 mb-3">
                {category.icon}
                <h4 className="font-medium text-gray-800">{category.label}</h4>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {categoryFilters.map(filter => (
                  <Button
                    key={filter.id}
                    variant="outline"
                    size="sm"
                    className={`
                      transition-all duration-200 border-2
                      ${activeFilters.includes(filter.id)
                        ? 'bg-[#3c7660] border-[#3c7660] text-white hover:bg-[#2a5444] hover:border-[#2a5444]'
                        : getCategoryColor(filter.category)
                      }
                    `}
                    onClick={() => toggleFilter(filter.id)}
                  >
                    <div className="flex items-center space-x-2">
                      {filter.icon}
                      <span>{filter.name}</span>
                      {activeFilters.includes(filter.id) && (
                        <IoCheckmark className="w-3 h-3" />
                      )}
                    </div>
                  </Button>
                ))}
              </div>
              
              {categoryFilters.length > 0 && (
                <div className="mt-2">
                  {categoryFilters
                    .filter(filter => activeFilters.includes(filter.id))
                    .map(filter => (
                      <div key={filter.id} className="text-xs text-gray-600 mb-1">
                        <span className="font-medium">{filter.name}:</span> {filter.description}
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          );
        })}

        {/* Custom Filter Input */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <IoSparkles className="w-4 h-4" />
            <h4 className="font-medium text-gray-800">Custom Request</h4>
          </div>
          
          {!showCustomInput ? (
            <Button
              variant="outline"
              size="sm"
              className="border-dashed border-2 border-gray-300 hover:border-[#3c7660] hover:bg-[#3c7660]/5 text-gray-600 hover:text-[#3c7660]"
              onClick={() => setShowCustomInput(true)}
            >
              <IoAdd className="w-4 h-4 mr-2" />
              Add custom AI filter
            </Button>
          ) : (
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="e.g., 'dog-friendly places' or 'live music venues'"
                value={customFilter}
                onChange={(e) => setCustomFilter(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#3c7660] focus:border-[#3c7660] text-sm"
                onKeyPress={(e) => e.key === 'Enter' && addCustomFilter()}
                autoFocus
              />
              <Button
                size="sm"
                onClick={addCustomFilter}
                disabled={!customFilter.trim()}
                className="bg-[#3c7660] hover:bg-[#2a5444] text-white"
              >
                Add
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowCustomInput(false);
                  setCustomFilter('');
                }}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* Active Filters Summary */}
        {activeFilters.length > 0 && (
          <Card className="bg-[#3c7660]/5 border-[#3c7660]/20">
            <CardContent className="p-4">
              <h4 className="font-medium text-[#3c7660] mb-2 flex items-center">
                <IoSparkles className="w-4 h-4 mr-2" />
                AI will prioritize:
              </h4>
              <div className="space-y-1 text-sm text-gray-700">
                {aiFilters
                  .filter(filter => activeFilters.includes(filter.id))
                  .map(filter => (
                    <div key={filter.id} className="flex items-start">
                      <span className="w-1 h-1 bg-[#3c7660] rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      <span>{filter.aiPrompt}</span>
                    </div>
                  ))
                }
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
