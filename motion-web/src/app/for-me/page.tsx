"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  IoSearch,
  IoLocationOutline,
  IoBookmarkOutline,
  IoBookmark,
  IoAddCircleOutline,
  IoTrashOutline,
  IoRestaurantOutline,
  IoStar,
  IoCash,
  IoTimeOutline,
  IoCallOutline,
  IoGlobeOutline,
  IoChevronForward,
  IoClose,
  IoHeartOutline
} from 'react-icons/io5';

interface Album {
  id: string;
  name: string;
  description?: string;
  is_public: boolean;
  cover_photo_url?: string;
  created_at: string;
  place_count?: number;
}

interface SavedPlace {
  id: string;
  google_place_id: string;
  business_name: string;
  address?: string;
  lat?: number;
  lng?: number;
  photo_url?: string;
  rating?: number;
  price_level?: number;
  phone?: string;
  website?: string;
  business_hours?: any;
  types?: string[];
  google_data?: any;
  notes?: string;
  saved_at: string;
}

interface PlaceResult {
  id: string;
  name: string;
  displayName?: string;
  formattedAddress?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  rating?: number;
  priceLevel?: string;
  photos?: Array<{ name: string }>;
  types?: string[];
  businessStatus?: string;
  openingHours?: any;
  nationalPhoneNumber?: string;
  websiteUri?: string;
}

export default function ForMePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PlaceResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [isCreatingAlbum, setIsCreatingAlbum] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [newAlbumDescription, setNewAlbumDescription] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [savedPlaceIds, setSavedPlaceIds] = useState<Set<string>>(new Set());

  // Authentication check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, authLoading, router]);

  // Load albums and saved places
  useEffect(() => {
    if (user) {
      loadAlbums();
      loadSavedPlaces();
    }
  }, [user]);

  const loadAlbums = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/albums?userId=${user.id}`);
      if (!res.ok) throw new Error('Failed to load albums');
      const data = await res.json();
      setAlbums(data);
    } catch (error) {
      console.error('Error loading albums:', error);
      toast.error('Failed to load albums');
    }
  };

  const loadSavedPlaces = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/places/saved?userId=${user.id}`);
      if (!res.ok) throw new Error('Failed to load saved places');
      const data: SavedPlace[] = await res.json();
      setSavedPlaceIds(new Set(data.map(p => p.google_place_id)));
    } catch (error) {
      console.error('Error loading saved places:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !locationQuery.trim()) {
      toast.error('Please enter both search term and location');
      return;
    }

    setIsSearching(true);
    try {
      const params = new URLSearchParams({
        query: searchQuery,
        location: locationQuery,
        radius: '5000'
      });

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/places/search?${params}`);
      if (!res.ok) throw new Error('Search failed');

      const data = await res.json();
      setSearchResults(data);

      if (data.length === 0) {
        toast.info('No places found. Try a different search.');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search places');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreateAlbum = async () => {
    if (!user || !newAlbumName.trim()) {
      toast.error('Album name is required');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/albums`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: newAlbumName,
          description: newAlbumDescription,
          isPublic: false
        })
      });

      if (!res.ok) throw new Error('Failed to create album');

      const newAlbum = await res.json();
      setAlbums(prev => [newAlbum, ...prev]);
      setNewAlbumName('');
      setNewAlbumDescription('');
      setIsCreatingAlbum(false);
      toast.success('Album created!');
    } catch (error) {
      console.error('Error creating album:', error);
      toast.error('Failed to create album');
    }
  };

  const handleDeleteAlbum = async (albumId: string) => {
    if (!user) return;
    if (!confirm('Delete this album? Saved places will remain.')) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/albums/${albumId}?userId=${user.id}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Failed to delete album');

      setAlbums(prev => prev.filter(a => a.id !== albumId));
      if (selectedAlbum === albumId) setSelectedAlbum(null);
      toast.success('Album deleted');
    } catch (error) {
      console.error('Error deleting album:', error);
      toast.error('Failed to delete album');
    }
  };

  const handleSavePlace = async (place: PlaceResult, albumId?: string) => {
    if (!user) return;

    try {
      // First save the place
      const saveRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/places/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          googlePlaceId: place.id,
          businessName: place.displayName || place.name,
          address: place.formattedAddress,
          lat: place.location?.latitude,
          lng: place.location?.longitude,
          photoUrl: place.photos?.[0]?.name ? `https://places.googleapis.com/v1/${place.photos[0].name}/media?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&maxHeightPx=400&maxWidthPx=400` : null,
          rating: place.rating,
          priceLevel: place.priceLevel ? ['FREE', 'INEXPENSIVE', 'MODERATE', 'EXPENSIVE', 'VERY_EXPENSIVE'].indexOf(place.priceLevel) : null,
          phone: place.nationalPhoneNumber,
          website: place.websiteUri,
          businessHours: place.openingHours,
          types: place.types,
          googleData: place
        })
      });

      if (!saveRes.ok) throw new Error('Failed to save place');

      const savedPlace = await saveRes.json();
      setSavedPlaceIds(prev => new Set(prev).add(place.id));

      // If album selected, add to album
      if (albumId) {
        const albumRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/albums/${albumId}/places`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            savedPlaceId: savedPlace.id
          })
        });

        if (!albumRes.ok) throw new Error('Failed to add to album');
        toast.success('Place saved to album!');
      } else {
        toast.success(savedPlace.alreadySaved ? 'Place already saved' : 'Place saved!');
      }

      setShowSaveDialog(false);
      loadAlbums(); // Refresh to update place counts
    } catch (error) {
      console.error('Error saving place:', error);
      toast.error('Failed to save place');
    }
  };

  const openSaveDialog = (place: PlaceResult) => {
    setSelectedPlace(place);
    setShowSaveDialog(true);
  };

  const getPriceLevelSymbol = (priceLevel?: string) => {
    if (!priceLevel) return '?';
    const levels: Record<string, string> = {
      'FREE': 'Free',
      'INEXPENSIVE': '$',
      'MODERATE': '$$',
      'EXPENSIVE': '$$$',
      'VERY_EXPENSIVE': '$$$$'
    };
    return levels[priceLevel] || '?';
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3c7660] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navigation />

      <main className="pt-20 pb-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">For Me</h1>
            <p className="text-gray-600">Discover and save places you want to visit</p>
          </div>

          {/* Search Bar */}
          <Card className="mb-6 shadow-lg border-gray-200">
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-12 gap-4">
                <div className="md:col-span-5">
                  <label className="text-xs font-medium text-gray-600 mb-1 block">What are you looking for?</label>
                  <div className="relative">
                    <IoRestaurantOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="Restaurants, cafes, attractions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="md:col-span-5">
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Where?</label>
                  <div className="relative">
                    <IoLocationOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="City or neighborhood"
                      value={locationQuery}
                      onChange={(e) => setLocationQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="md:col-span-2 flex items-end">
                  <Button
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="w-full bg-[#3c7660] hover:bg-[#2d5a48] text-white"
                  >
                    {isSearching ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Searching...
                      </>
                    ) : (
                      <>
                        <IoSearch className="w-5 h-5 mr-2" />
                        Search
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Grid */}
          <div className="grid md:grid-cols-12 gap-6">
            {/* Albums Sidebar */}
            <div className="md:col-span-3">
              <Card className="shadow-lg border-gray-200 sticky top-24">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <IoBookmarkOutline className="w-4 h-4" />
                      My Albums
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsCreatingAlbum(true)}
                      className="h-7 w-7 p-0"
                    >
                      <IoAddCircleOutline className="w-5 h-5 text-[#3c7660]" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                  {albums.length === 0 ? (
                    <div className="text-center py-8">
                      <IoBookmarkOutline className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No albums yet</p>
                      <p className="text-xs text-gray-400 mt-1">Create one to start saving places</p>
                    </div>
                  ) : (
                    albums.map(album => (
                      <div
                        key={album.id}
                        className={`group p-3 rounded-lg border transition-all cursor-pointer ${
                          selectedAlbum === album.id
                            ? 'bg-[#3c7660]/10 border-[#3c7660]'
                            : 'bg-white border-gray-200 hover:border-[#3c7660]/50'
                        }`}
                        onClick={() => setSelectedAlbum(selectedAlbum === album.id ? null : album.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-900 truncate">{album.name}</p>
                            {album.description && (
                              <p className="text-xs text-gray-500 truncate mt-0.5">{album.description}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">{album.place_count || 0} places</p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAlbum(album.id);
                            }}
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <IoTrashOutline className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Create Album Dialog */}
              {isCreatingAlbum && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                  <Card className="w-full max-w-md">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        New Album
                        <Button variant="ghost" size="sm" onClick={() => setIsCreatingAlbum(false)}>
                          <IoClose className="w-5 h-5" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Album Name</label>
                        <Input
                          placeholder="e.g. Weekend Brunch Spots"
                          value={newAlbumName}
                          onChange={(e) => setNewAlbumName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleCreateAlbum()}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Description (optional)</label>
                        <Input
                          placeholder="Places I want to try for brunch"
                          value={newAlbumDescription}
                          onChange={(e) => setNewAlbumDescription(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setIsCreatingAlbum(false)}>
                          Cancel
                        </Button>
                        <Button
                          onClick={handleCreateAlbum}
                          className="bg-[#3c7660] hover:bg-[#2d5a48] text-white"
                        >
                          Create Album
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* Search Results */}
            <div className="md:col-span-9">
              {searchResults.length === 0 && !isSearching ? (
                <div className="text-center py-16">
                  <IoSearch className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Discovering</h3>
                  <p className="text-gray-600 mb-1">Search for restaurants, cafes, or attractions</p>
                  <p className="text-sm text-gray-500">Save your favorites to albums for easy access</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.map(place => {
                    const isSaved = savedPlaceIds.has(place.id);
                    const photoUrl = place.photos?.[0]?.name
                      ? `https://places.googleapis.com/v1/${place.photos[0].name}/media?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&maxHeightPx=400&maxWidthPx=400`
                      : '/placeholder-place.jpg';

                    return (
                      <Card key={place.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                        <div className="relative h-48 bg-gray-200">
                          <img
                            src={photoUrl}
                            alt={place.displayName || place.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder-place.jpg';
                            }}
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openSaveDialog(place)}
                            className="absolute top-2 right-2 bg-white/90 hover:bg-white shadow-md"
                          >
                            {isSaved ? (
                              <IoBookmark className="w-5 h-5 text-[#3c7660]" />
                            ) : (
                              <IoBookmarkOutline className="w-5 h-5 text-gray-700" />
                            )}
                          </Button>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                            {place.displayName || place.name}
                          </h3>
                          <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                            <IoLocationOutline className="inline w-3 h-3 mr-1" />
                            {place.formattedAddress || 'Address unavailable'}
                          </p>
                          <div className="flex items-center gap-3 text-xs">
                            {place.rating && (
                              <span className="flex items-center gap-1 text-yellow-600">
                                <IoStar className="w-3 h-3" />
                                {place.rating.toFixed(1)}
                              </span>
                            )}
                            {place.priceLevel && (
                              <span className="flex items-center gap-1 text-gray-600">
                                <IoCash className="w-3 h-3" />
                                {getPriceLevelSymbol(place.priceLevel)}
                              </span>
                            )}
                            {place.businessStatus === 'OPERATIONAL' && (
                              <Badge variant="outline" className="text-green-600 border-green-600">Open</Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Save to Album Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Place</DialogTitle>
            <DialogDescription>
              Save "{selectedPlace?.displayName || selectedPlace?.name}" to an album
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            <Button
              variant="outline"
              onClick={() => selectedPlace && handleSavePlace(selectedPlace)}
              className="w-full justify-start"
            >
              <IoHeartOutline className="w-5 h-5 mr-2" />
              Just save (no album)
            </Button>
            <div className="border-t pt-3">
              <p className="text-sm font-medium text-gray-700 mb-2">Or save to album:</p>
              {albums.length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">
                  Create an album first to organize your saved places
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {albums.map(album => (
                    <Button
                      key={album.id}
                      variant="outline"
                      onClick={() => selectedPlace && handleSavePlace(selectedPlace, album.id)}
                      className="w-full justify-start"
                    >
                      <IoBookmarkOutline className="w-5 h-5 mr-2 text-[#3c7660]" />
                      <div className="text-left">
                        <p className="font-medium">{album.name}</p>
                        <p className="text-xs text-gray-500">{album.place_count || 0} places</p>
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
