'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import {
  IoClose,
  IoChevronBack,
  IoChevronForward,
  IoStar,
  IoTime,
  IoLocation,
  IoCash,
  IoHeart,
  IoHeartOutline,
  IoShare,
  IoBookmark,
  IoBookmarkOutline
} from 'react-icons/io5';

interface AdventureStep {
  id: string;
  step_number: number;
  title: string;
  description: string;
  location?: string;
  estimated_duration_minutes?: number;
  estimated_cost?: string;
  business_info?: {
    name: string;
    photos: string[];
    description: string;
    hours: string;
    avg_price: string;
    ai_description: string;
  };
}

interface Adventure {
  id: string;
  custom_title: string;
  description: string;
  location: string;
  duration_hours: number;
  estimated_cost: string;
  rating: number;
  adventure_photos: Array<{ photo_url: string; is_cover_photo: boolean }>;
  profiles: {
    first_name: string;
    last_name: string;
    profile_picture_url?: string;
  };
  saves_count: number;
  likes_count: number;
  adventure_steps: AdventureStep[];
  user_review?: string;
}

interface AdventureDetailModalProps {
  adventure: Adventure | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AdventureDetailModal({ adventure, isOpen, onClose }: AdventureDetailModalProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [selectedStep, setSelectedStep] = useState<AdventureStep | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  if (!adventure) return null;

  const photos = adventure.adventure_photos?.length > 0 
    ? adventure.adventure_photos 
    : [{ photo_url: '/api/placeholder/400/300', is_cover_photo: true }];

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const getBudgetDisplay = (cost: string) => {
    const map: Record<string, string> = {
      '$': 'Budget-friendly',
      '$$': 'Moderate',
      '$$$': 'Premium'
    };
    return map[cost] || cost;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => {
      const filled = index < Math.floor(rating);
      return (
        <IoStar 
          key={index} 
          className={`w-4 h-4 ${filled ? 'text-yellow-400' : 'text-gray-300'}`} 
        />
      );
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <h2>Adventure Details</h2>
        </DialogHeader>

        {/* Header with Photos */}
        <div className="relative h-80 bg-gray-100">
          <Image
            src={photos[currentPhotoIndex]?.photo_url || '/api/placeholder/400/300'}
            alt={adventure.custom_title}
            fill
            className="object-cover"
          />
          
          {/* Photo Navigation */}
          {photos.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full p-2"
                onClick={prevPhoto}
              >
                <IoChevronBack className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full p-2"
                onClick={nextPhoto}
              >
                <IoChevronForward className="w-5 h-5" />
              </Button>
              
              {/* Photo Indicators */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {photos.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white rounded-full p-2"
            onClick={onClose}
          >
            <IoClose className="w-5 h-5" />
          </Button>

          {/* Action Buttons */}
          <div className="absolute top-4 left-4 flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="bg-black/20 hover:bg-black/40 text-white rounded-full p-2"
              onClick={() => setIsSaved(!isSaved)}
            >
              {isSaved ? (
                <IoBookmark className="w-5 h-5 text-[#3c7660]" />
              ) : (
                <IoBookmarkOutline className="w-5 h-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="bg-black/20 hover:bg-black/40 text-white rounded-full p-2"
              onClick={() => setIsLiked(!isLiked)}
            >
              {isLiked ? (
                <IoHeart className="w-5 h-5 text-red-500" />
              ) : (
                <IoHeartOutline className="w-5 h-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="bg-black/20 hover:bg-black/40 text-white rounded-full p-2"
            >
              <IoShare className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Adventure Info */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{adventure.custom_title}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center">
                    <IoLocation className="w-4 h-4 mr-1" />
                    {adventure.location}
                  </div>
                  <div className="flex items-center">
                    <IoTime className="w-4 h-4 mr-1" />
                    {adventure.duration_hours}h
                  </div>
                  <div className="flex items-center">
                    <IoCash className="w-4 h-4 mr-1" />
                    {getBudgetDisplay(adventure.estimated_cost)}
                  </div>
                </div>
                
                {/* Rating */}
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex items-center">
                    {renderStars(adventure.rating)}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{adventure.rating}</span>
                  <span className="text-sm text-gray-500">
                    ({adventure.likes_count} likes, {adventure.saves_count} saves)
                  </span>
                </div>
              </div>

              {/* Creator Info */}
              <div className="flex items-center space-x-3 ml-6">
                <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                  {adventure.profiles.profile_picture_url ? (
                    <Image
                      src={adventure.profiles.profile_picture_url}
                      alt={`${adventure.profiles.first_name} ${adventure.profiles.last_name}`}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 font-medium">
                      {adventure.profiles.first_name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {adventure.profiles.first_name} {adventure.profiles.last_name}
                  </p>
                  <p className="text-sm text-gray-500">Adventure Creator</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-700 leading-relaxed mb-6">{adventure.description}</p>

            {/* User Review */}
            {adventure.user_review && (
              <Card className="bg-gray-50 mb-6">
                <CardContent className="p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Creator's Review</h3>
                  <p className="text-gray-700 italic">"{adventure.user_review}"</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Adventure Steps */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Adventure Steps</h2>
            
            {/* Steps Timeline */}
            <div className="relative">
              {adventure.adventure_steps?.map((step, index) => (
                <div key={step.id} className="flex items-start mb-6 last:mb-0">
                  {/* Step Number */}
                  <div className="flex flex-col items-center mr-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold cursor-pointer transition-colors ${
                        selectedStep?.id === step.id
                          ? 'bg-[#3c7660] text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-[#3c7660] hover:text-white'
                      }`}
                      onClick={() => setSelectedStep(selectedStep?.id === step.id ? null : step)}
                    >
                      {step.step_number}
                    </div>
                    {index < adventure.adventure_steps.length - 1 && (
                      <div className="w-0.5 h-16 bg-gray-200 mt-2" />
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1">
                    <Card 
                      className={`cursor-pointer transition-all ${
                        selectedStep?.id === step.id ? 'ring-2 ring-[#3c7660] shadow-lg' : 'hover:shadow-md'
                      }`}
                      onClick={() => setSelectedStep(selectedStep?.id === step.id ? null : step)}
                    >
                      <CardContent className="p-4">
                        <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                        <p className="text-gray-700 text-sm mb-3">{step.description}</p>
                        
                        {step.location && (
                          <div className="flex items-center text-sm text-gray-600 mb-2">
                            <IoLocation className="w-4 h-4 mr-1" />
                            {step.location}
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          {step.estimated_duration_minutes && (
                            <div className="flex items-center">
                              <IoTime className="w-4 h-4 mr-1" />
                              {step.estimated_duration_minutes}min
                            </div>
                          )}
                          {step.estimated_cost && (
                            <div className="flex items-center">
                              <IoCash className="w-4 h-4 mr-1" />
                              {getBudgetDisplay(step.estimated_cost)}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Step Details */}
          {selectedStep && selectedStep.business_info && (
            <Card className="mb-6 border-[#3c7660]">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Place Details</h3>
                
                {/* Business Photos */}
                {selectedStep.business_info.photos && selectedStep.business_info.photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {selectedStep.business_info.photos.slice(0, 3).map((photo, index) => (
                      <div key={index} className="aspect-video relative rounded-lg overflow-hidden">
                        <Image
                          src={photo}
                          alt={selectedStep.business_info!.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-3">
                  <h4 className="font-bold text-gray-900">{selectedStep.business_info.name}</h4>
                  <p className="text-gray-700">{selectedStep.business_info.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-900">Hours:</span>
                      <p className="text-gray-600">{selectedStep.business_info.hours}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Average Price:</span>
                      <p className="text-gray-600">{selectedStep.business_info.avg_price}</p>
                    </div>
                  </div>

                  {selectedStep.business_info.ai_description && (
                    <div>
                      <span className="font-medium text-gray-900">Why visit here:</span>
                      <p className="text-gray-600 mt-1">{selectedStep.business_info.ai_description}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t p-4 flex items-center justify-between bg-gray-50">
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="bg-white">
              {getBudgetDisplay(adventure.estimated_cost)}
            </Badge>
            <Badge variant="outline" className="bg-white">
              {adventure.duration_hours}h duration
            </Badge>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              Share Adventure
            </Button>
            <Button className="bg-[#3c7660] hover:bg-[#2d5a48] text-white">
              Save & Plan Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
