// Enhanced Adventure Card with Google Places API photo integration and expandable modal
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IoHeart, IoHeartOutline, IoBookmark, IoBookmarkOutline, IoChevronBack, IoChevronForward, IoStar, IoTime, IoLocationOutline, IoExpand } from 'react-icons/io5';
import { fetchStepPhotos } from '@/services/PlacesPhotoService';
import AdventureModal from './AdventureModal';

interface AdventurePhoto {
  url: string;
  source: 'google' | 'ai_generated' | 'user_uploaded';
  width?: number;
  height?: number;
  label?: string;
}

interface Adventure {
  id: string;
  custom_title: string;
  custom_description?: string;
  location?: string;
  duration_hours?: number;
  estimated_cost?: string;
  rating?: number;
  steps?: any[];
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
}

interface EnhancedAdventureCardProps {
  adventure: Adventure;
  user?: any;
  userLiked?: boolean;
  userSaved?: boolean;
  onLike?: (adventureId: string) => void;
  onSave?: (adventureId: string) => void;
  onClick?: (adventure: Adventure) => void;
}

export default function EnhancedAdventureCard({
  adventure,
  user,
  userLiked = false,
  userSaved = false,
  onLike,
  onSave,
  onClick
}: EnhancedAdventureCardProps) {
  const [photos, setPhotos] = useState<AdventurePhoto[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);
  const [showNavigation, setShowNavigation] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load Google Places photos for adventure steps
  useEffect(() => {
    const loadAdventurePhotos = async () => {
      if (!adventure.steps || adventure.steps.length === 0) {
        // Use existing adventure photos if no steps
        const existingPhotos: AdventurePhoto[] = adventure.adventure_photos?.map(photo => ({
          url: photo.photo_url,
          source: 'user_uploaded' as const
        })) || [];
        
        if (existingPhotos.length === 0) {
          // Add fallback photo
          existingPhotos.push({
            url: '/api/placeholder/400/300',
            source: 'ai_generated'
          });
        }
        
        setPhotos(existingPhotos);
        return;
      }

      setIsLoadingPhotos(true);
      try {
        // Get photos from Google Places API for adventure steps
        const stepInputs = adventure.steps.slice(0, 3).map(step => ({
          name: step.business_name || step.title || step.location,
          location: step.location || adventure.location
        }));

  const stepPhotos = await fetchStepPhotos(stepInputs);

        // Combine with existing adventure photos
        const existingPhotos: AdventurePhoto[] = adventure.adventure_photos?.map(photo => ({
          url: photo.photo_url,
          source: 'user_uploaded' as const
        })) || [];

        // Merge photos, prioritizing Google Places photos
        const allPhotos: AdventurePhoto[] = [
          ...stepPhotos.map((p, i) => ({
            url: p.url,
            width: p.width,
            height: p.height,
            source: (p.source === 'google' ? 'google' : 'ai_generated') as 'google' | 'ai_generated',
            label: (p.label ?? stepInputs[i]?.name) || undefined,
          })),
          ...existingPhotos
        ].slice(0, 4); // Max 4 photos
        
        if (allPhotos.length === 0) {
          allPhotos.push({
            url: '/api/placeholder/400/300',
            source: 'ai_generated'
          });
        }

        setPhotos(allPhotos);
      } catch (error) {
        console.error('Error loading adventure photos:', error);
        // Fallback to existing photos or placeholder
        const fallbackPhotos: AdventurePhoto[] = adventure.adventure_photos?.map(photo => ({
          url: photo.photo_url,
          source: 'user_uploaded' as const
        })) || [{
          url: '/api/placeholder/400/300',
          source: 'ai_generated'
        }];
        setPhotos(fallbackPhotos);
      } finally {
        setIsLoadingPhotos(false);
      }
    };

    loadAdventurePhotos();
  }, [adventure.id, adventure.steps, adventure.adventure_photos, adventure.location]);

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike?.(adventure.id);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSave?.(adventure.id);
  };

  const handleCardClick = () => {
    setIsModalOpen(true);
    onClick?.(adventure);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleShare = (adventure: any) => {
    // Handle sharing logic here
    console.log('Sharing adventure:', adventure.custom_title);
  };

  // Preload adjacent images when the current index changes
  useEffect(() => {
    if (typeof window === 'undefined' || photos.length <= 1) return;
    const nextIdx = (currentPhotoIndex + 1) % photos.length;
    const prevIdx = (currentPhotoIndex - 1 + photos.length) % photos.length;
    const nextUrl = photos[nextIdx]?.url;
    const prevUrl = photos[prevIdx]?.url;
    if (nextUrl) {
      const imgNext = new (window as any).Image();
      imgNext.src = nextUrl;
    }
    if (prevUrl) {
      const imgPrev = new (window as any).Image();
      imgPrev.src = prevUrl;
    }
  }, [currentPhotoIndex, photos]);

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

  return (
    <>
      <Card 
        className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-gray-300 transition-all duration-300 cursor-pointer transform hover:scale-[1.02]"
        onClick={handleCardClick}
      >
        <div 
          className="relative aspect-[4/3] overflow-hidden"
          onMouseEnter={() => setShowNavigation(photos.length > 1)}
          onMouseLeave={() => setShowNavigation(false)}
        >
          {/* Photo Display */}
          {photos.length > 0 && (
            <div className="relative w-full h-full">
              <Image
                src={photos[currentPhotoIndex]?.url || '/api/placeholder/400/300'}
                alt={adventure.custom_title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Preload adjacent images for instant next/prev */}
              {photos.length > 1 && (
                <div className="hidden">
                  <Image src={photos[(currentPhotoIndex + 1) % photos.length]?.url || '/api/placeholder/400/300'} alt="preload next" width={10} height={10} />
                  <Image src={photos[(currentPhotoIndex - 1 + photos.length) % photos.length]?.url || '/api/placeholder/400/300'} alt="preload prev" width={10} height={10} />
                </div>
              )}

              {/* Glass title overlay over cover image */}
              <div className="absolute top-3 left-3 right-20">
                <div className="backdrop-blur-md bg-black/25 border border-white/10 rounded-xl px-3 py-2 shadow-sm">
                  <h3 className="text-white text-sm font-semibold line-clamp-1">{adventure.custom_title}</h3>
                </div>
              </div>
              
              {/* Loading overlay */}
              {isLoadingPhotos && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                </div>
              )}

              {/* Photo counter */}
              {photos.length > 1 && (
                <div className="absolute bottom-2 left-2">
                  <div className="px-2 py-1 bg-black/60 rounded-full text-xs text-white">
                    {currentPhotoIndex + 1} of {photos.length}
                  </div>
                </div>
              )}

              {/* Step label chip when photo comes from Google Places */}
      {photos[currentPhotoIndex]?.label && (
                <div className="absolute bottom-2 left-2 translate-y-[-36px]">
                  <div className="px-2 py-1 backdrop-blur-md bg-white/25 border border-white/30 rounded-full text-[11px] text-white shadow-sm">
        {photos[currentPhotoIndex]?.label}
                  </div>
                </div>
              )}

              {/* Expand icon */}
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-8 h-8 bg-black/60 rounded-full flex items-center justify-center">
                  <IoExpand className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          )}

          {/* Photo Navigation - Only show on hover and if multiple photos */}
          {showNavigation && photos.length > 1 && (
            <div className="absolute inset-0 flex items-center justify-between p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={prevPhoto}
                className="w-8 h-8 rounded-full bg-white/90 hover:bg-white hover:scale-110 transition-all duration-200 p-0 shadow-sm"
              >
                <IoChevronBack className="w-4 h-4 text-gray-700" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={nextPhoto}
                className="w-8 h-8 rounded-full bg-white/90 hover:bg-white hover:scale-110 transition-all duration-200 p-0 shadow-sm"
              >
                <IoChevronForward className="w-4 h-4 text-gray-700" />
              </Button>
            </div>
          )}

          {/* Photo indicators */}
          {photos.length > 1 && (
            <div className="absolute bottom-2 right-12 flex gap-1">
              {photos.map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}

          {/* User Action Buttons */}
          {user && (
            <div className="absolute top-3 right-3 flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleLike}
                className="w-8 h-8 rounded-full bg-white/90 hover:bg-white hover:scale-110 transition-all duration-200 p-0 border border-gray-200/50 shadow-sm"
              >
                {userLiked ? (
                  <IoHeart className="w-4 h-4 text-red-500" />
                ) : (
                  <IoHeartOutline className="w-4 h-4 text-gray-600" />
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleSave}
                className="w-8 h-8 rounded-full bg-white/90 hover:bg-white hover:scale-110 transition-all duration-200 p-0 border border-gray-200/50 shadow-sm"
              >
                {userSaved ? (
                  <IoBookmark className="w-4 h-4 text-blue-600" />
                ) : (
                  <IoBookmarkOutline className="w-4 h-4 text-gray-600" />
                )}
              </Button>
            </div>
          )}
        </div>

        <CardContent className="p-6">
          {/* Adventure Title */}
          <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-[#3c7660] transition-colors">
            {adventure.custom_title}
          </h3>

          {/* Adventure Description */}
          {adventure.custom_description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {adventure.custom_description}
            </p>
          )}

          {/* Adventure Details */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              {adventure.duration_hours && (
                <div className="flex items-center gap-1">
                  <IoTime className="w-4 h-4" />
                  <span>{getDurationText(adventure.duration_hours)}</span>
                </div>
              )}
              {adventure.location && (
                <div className="flex items-center gap-1">
                  <IoLocationOutline className="w-4 h-4" />
                  <span>{adventure.location}</span>
                </div>
              )}
            </div>
            {getRatingStars(adventure.rating)}
          </div>

          {/* Author Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {adventure.profiles?.profile_picture_url ? (
                <Image
                  src={adventure.profiles.profile_picture_url}
                  alt="Profile"
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              ) : (
                <div className="w-6 h-6 bg-gray-200 rounded-full" />
              )}
              <span className="text-sm text-gray-600">
                {adventure.profiles?.display_name || 
                 `${adventure.profiles?.first_name || ''} ${adventure.profiles?.last_name || ''}`.trim() || 
                 'Anonymous'}
              </span>
            </div>

            {/* Adventure Stats */}
            <div className="flex items-center gap-3 text-xs text-gray-500">
              {adventure.heart_count && adventure.heart_count > 0 && (
                <span className="flex items-center gap-1">
                  <IoHeart className="w-3 h-3" />
                  {adventure.heart_count}
                </span>
              )}
              {adventure.save_count && adventure.save_count > 0 && (
                <span className="flex items-center gap-1">
                  <IoBookmark className="w-3 h-3" />
                  {adventure.save_count}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Adventure Modal */}
      <AdventureModal
        adventure={{
          ...adventure,
          photos: photos
        }}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        user={user}
        userLiked={userLiked}
        userSaved={userSaved}
        onLike={onLike}
        onSave={onSave}
        onShare={handleShare}
      />
    </>
  );
}
