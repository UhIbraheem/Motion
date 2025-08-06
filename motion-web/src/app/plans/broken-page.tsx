"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  IoCalendarOutline,
  IoCalendar,
  IoTimeOutline, 
  IoLocationOutline, 
  IoStarOutline,
  IoStar,
  IoBookmarkOutline,
  IoCheckmark,
  IoAdd,
  IoArrowForward,
  IoEllipsisVertical,
  IoCompass
} from "react-icons/io5";

export default function PlansPage() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  // Mock adventure data
  const mockPlans = [
    {
      id: "1",
      title: "Hidden Waterfall Hike",
      location: "Forest Ridge Trail",
      scheduled_for: "2025-08-06",
      status: "scheduled",
      duration_hours: 3,
      rating: 4.9,
      time: "9:00 AM",
      type: "Nature"
    },
    {
      id: "2", 
      title: "Downtown Food Tour",
      location: "Historic District",
      scheduled_for: "2025-08-08",
      status: "scheduled",
      duration_hours: 4,
      rating: 4.7,
      time: "11:00 AM",  
      type: "Food"
    },
    {
      id: "3",
      title: "Sunrise Photography",
      location: "Skyline Overlook",
      scheduled_for: "2025-08-10",
      status: "scheduled",
      duration_hours: 2,
      rating: 4.8,
      time: "6:00 AM",
      type: "Photography"
    },
    {
      id: "4",
      title: "Art Gallery Walk",
      location: "Arts Quarter",
      scheduled_for: "2025-08-02",
      status: "completed",
      duration_hours: 2,
      rating: 4.6,
      time: "2:00 PM",
      type: "Culture"
    },
    {
      id: "5",
      title: "Coastal Tide Pools",
      location: "Rocky Point Beach", 
      scheduled_for: "2025-07-30",
      status: "completed",
      duration_hours: 3,
      rating: 4.9,
      time: "10:00 AM",
      type: "Nature"
    }
  ];

  // Generate calendar days for August 2025
  const generateCalendarDays = () => {
    const year = 2025;
    const month = 7; // August (0-indexed)
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getPlansForDate = (day: number) => {
    const dateStr = `2025-08-${day.toString().padStart(2, '0')}`;
    return mockPlans.filter(plan => plan.scheduled_for === dateStr);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => {
      const starIndex = index + 1;
      return starIndex <= Math.floor(rating) ? 
        <IoStar key={index} className="w-4 h-4 text-yellow-400" /> : 
        <IoStarOutline key={index} className="w-4 h-4 text-gray-300" />;
    });
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      case "saved": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case "Nature": return "bg-green-100 text-green-800";
      case "Culture": return "bg-purple-100 text-purple-800";
      case "Food": return "bg-orange-100 text-orange-800";
      case "Photography": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const calendarDays = generateCalendarDays();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Main Content - Adventure Plans with Images */}
      <div className="flex-1 p-8 pr-4">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#2a5444]">My Adventures</h1>
              <p className="text-[#3c7660] mt-1">Your planned and completed journeys</p>
            </div>
            <Button className="bg-[#3c7660] hover:bg-[#2a5444] text-white">
              <IoAdd className="w-4 h-4 mr-2" />
              Plan Adventure
            </Button>
          </div>

          {/* Tab Navigation */}
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="saved">Saved</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              {mockPlans.filter(plan => plan.status === "scheduled").map((plan) => (
                <Card key={plan.id} className="overflow-hidden hover:shadow-lg transition-shadow border-0 shadow-md">
                  <div className="flex">
                    {/* Image Placeholder */}
                    <div className="w-48 h-32 bg-gradient-to-br from-[#3c7660] to-[#2a5444] flex items-center justify-center">
                      <div className="text-center text-white">
                        <IoCompass className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-xs font-medium">{plan.type}</p>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900">{plan.title}</h3>
                            <Badge className={getTypeColor(plan.type)}>{plan.type}</Badge>
                          </div>
                          
                          <div className="flex items-center text-gray-600 mb-3 space-x-4">
                            <div className="flex items-center">
                              <IoLocationOutline className="w-4 h-4 mr-1" />
                              <span className="text-sm">{plan.location}</span>
                            </div>
                            <div className="flex items-center">
                              <IoTimeOutline className="w-4 h-4 mr-1" />
                              <span className="text-sm">{plan.duration_hours}h journey</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center">
                                {renderStars(plan.rating)}
                                <span className="ml-2 text-sm text-gray-600">{plan.rating}</span>
                              </div>
                              <span className="text-sm font-medium text-[#3c7660]">
                                {new Date(plan.scheduled_for).toLocaleDateString()} at {plan.time}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm">
                                <IoBookmarkOutline className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <IoEllipsisVertical className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {mockPlans.filter(plan => plan.status === "completed").map((plan) => (
                <Card key={plan.id} className="overflow-hidden hover:shadow-lg transition-shadow border-0 shadow-md">
                  <div className="flex">
                    {/* Image Placeholder */}
                    <div className="w-48 h-32 bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                      <div className="text-center text-white">
                        <IoCheckmark className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-xs font-medium">Completed</p>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900">{plan.title}</h3>
                            <Badge className={getTypeColor(plan.type)}>{plan.type}</Badge>
                            <Badge className="bg-green-100 text-green-800">Completed</Badge>
                          </div>
                          
                          <div className="flex items-center text-gray-600 mb-3 space-x-4">
                            <div className="flex items-center">
                              <IoLocationOutline className="w-4 h-4 mr-1" />
                              <span className="text-sm">{plan.location}</span>
                            </div>
                            <div className="flex items-center">
                              <IoTimeOutline className="w-4 h-4 mr-1" />
                              <span className="text-sm">{plan.duration_hours}h journey</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center">
                                {renderStars(plan.rating)}
                                <span className="ml-2 text-sm text-gray-600">{plan.rating}</span>
                              </div>
                              <span className="text-sm text-gray-500">
                                Completed on {new Date(plan.scheduled_for).toLocaleDateString()}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm">
                                Share
                              </Button>
                              <Button variant="outline" size="sm">
                                <IoEllipsisVertical className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="saved" className="space-y-4">
              <div className="text-center py-12 text-gray-500">
                <IoBookmarkOutline className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No saved adventures yet</p>
                <p className="text-sm">Start exploring to save adventures for later</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right Sidebar - Stats & Mini Calendar */}
      <div className="w-80 bg-white p-6 border-l border-gray-200 shadow-sm overflow-y-auto">
        <div className="space-y-6">
            {/* Upcoming Plans */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#2a5444]">Upcoming Plans</h2>
                <Button variant="ghost" className="text-[#3c7660] hover:text-[#2a5444]">
                  View All
                </Button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {mockPlans.filter(plan => plan.status === 'scheduled').map(plan => (
                  <Card key={plan.id} className="bg-white rounded-2xl border-0 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                    {/* Plan Image */}
                    <div className="h-48 bg-gradient-to-br from-[#3c7660]/20 to-[#f2cc6c]/20 flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#3c7660]/10 to-[#f2cc6c]/10"></div>
                      <IoCompass className="w-16 h-16 text-[#3c7660]/60 relative z-10" />
                      <div className="absolute top-4 right-4 z-20">
                        <Badge className={getTypeColor(plan.type)} variant="secondary">
                          {plan.type}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardContent className="p-6">
                      <h3 className="font-bold text-gray-900 text-lg mb-2">{plan.title}</h3>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <IoLocationOutline className="w-4 h-4 mr-2" />
                          {plan.location}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <IoCalendar className="w-4 h-4 mr-2" />
                          {new Date(plan.scheduled_for).toLocaleDateString('en-US', { 
                            weekday: 'short',
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <IoTimeOutline className="w-4 h-4 mr-2" />
                          {plan.time}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {renderStars(plan.rating)}
                          <span className="text-sm text-gray-600 ml-2">{plan.rating}</span>
                        </div>
                        <Button size="sm" className="bg-[#3c7660] hover:bg-[#2a5444] text-white">
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Completed Adventures */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#2a5444]">Recent Completions</h2>
                <Button variant="ghost" className="text-[#3c7660] hover:text-[#2a5444]">
                  View All
                </Button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {mockPlans.filter(plan => plan.status === 'completed').map(plan => (
                  <Card key={plan.id} className="bg-white rounded-2xl border-0 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                    {/* Completed Plan Image */}
                    <div className="h-48 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-green-100/50"></div>
                      <IoCheckmark className="w-16 h-16 text-green-600/60 relative z-10" />
                      <div className="absolute top-4 right-4 z-20">
                        <Badge className="bg-green-100 text-green-800" variant="secondary">
                          <IoCheckmark className="w-3 h-3 mr-1" />
                          Completed
                        </Badge>
                      </div>
                    </div>
                    
                    <CardContent className="p-6">
                      <h3 className="font-bold text-gray-900 text-lg mb-2">{plan.title}</h3>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <IoLocationOutline className="w-4 h-4 mr-2" />
                          {plan.location}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <IoCalendar className="w-4 h-4 mr-2" />
                          Completed {new Date(plan.scheduled_for).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {renderStars(plan.rating)}
                          <span className="text-sm text-gray-600 ml-2">{plan.rating}</span>
                        </div>
                        <Button size="sm" variant="outline" className="border-[#3c7660] text-[#3c7660] hover:bg-[#3c7660] hover:text-white">
                          Photos
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Saved for Later */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#2a5444]">Saved for Later</h2>
              </div>
              
              <div className="text-center py-16 bg-white rounded-2xl">
                <IoBookmarkOutline className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No saved adventures yet</h3>
                <p className="text-gray-500 mb-6">Discover amazing adventures and save them for later!</p>
                <Link href="/discover">
                  <Button className="bg-[#3c7660] hover:bg-[#2a5444] text-white">
                    <IoAdd className="w-4 h-4 mr-2" />
                    Discover Adventures
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Stats & Mini Calendar */}
      <div className="w-80 bg-white p-6 border-l border-gray-200 shadow-sm overflow-y-auto">
        <div className="space-y-6">
          {/* Quick Stats */}
          <div>
            <h3 className="text-lg font-semibold text-[#2a5444] mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#3c7660]/5 to-[#f2cc6c]/5 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#3c7660]/20 rounded-lg flex items-center justify-center">
                    <IoCalendar className="w-5 h-5 text-[#3c7660]" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#3c7660]">{mockPlans.filter(p => p.status === 'scheduled').length}</div>
                    <div className="text-sm text-gray-600">Upcoming</div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100/50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <IoCheckmark className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{mockPlans.filter(p => p.status === 'completed').length}</div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#f2cc6c]/10 to-[#f2cc6c]/5 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#f2cc6c]/20 rounded-lg flex items-center justify-center">
                    <IoStar className="w-5 h-5 text-[#f2cc6c]" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#f2cc6c]">4.8</div>
                    <div className="text-sm text-gray-600">Avg Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mini Calendar */}
          <div>
            <h3 className="text-lg font-semibold text-[#2a5444] mb-3 flex items-center">
              <IoCalendarOutline className="w-5 h-5 mr-2" />
              August 2025
            </h3>
            
            {/* Mini Calendar Grid */}
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(day => (
                  <div key={day} className="text-center text-xs font-medium text-gray-500 p-1">
                    {day.slice(0, 1)}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  if (!day) {
                    return <div key={`empty-${index}`} className="p-1"></div>;
                  }
                  
                  const plansForDay = getPlansForDate(day);
                  const isToday = day === 4;
                  const hasPlans = plansForDay.length > 0;
                  
                  return (
                    <div 
                      key={`day-${index}-${day}`} 
                      className={`p-1 text-center text-xs rounded-lg cursor-pointer transition-all hover:bg-gray-100 ${
                        isToday ? 'bg-[#3c7660] text-white' : 
                        hasPlans ? 'bg-[#f2cc6c]/30 text-[#3c7660] font-semibold' : 
                        'text-gray-700'
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* This Week */}
          <div>
            <h3 className="text-lg font-semibold text-[#2a5444] mb-3">This Week</h3>
            <div className="space-y-2">
              {mockPlans.filter(plan => {
                const planDate = new Date(plan.scheduled_for);
                const today = new Date('2025-08-04');
                const weekFromToday = new Date(today);
                weekFromToday.setDate(today.getDate() + 7);
                return planDate >= today && planDate <= weekFromToday && plan.status === 'scheduled';
              }).map(plan => (
                <div key={plan.id} className="bg-gradient-to-r from-[#3c7660]/5 to-[#f2cc6c]/5 rounded-xl p-3 border border-gray-100">
                  <div className="text-sm font-semibold text-gray-900 truncate">{plan.title}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {new Date(plan.scheduled_for).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })} at {plan.time}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="text-lg font-semibold text-[#2a5444] mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/curate">
                <Button className="w-full bg-gradient-to-r from-[#3c7660] to-[#2a5444] hover:from-[#2a5444] hover:to-[#1e3c30] text-white rounded-xl text-sm">
                  <IoAdd className="w-4 h-4 mr-2" />
                  Create Adventure
                </Button>
              </Link>
              <Link href="/discover">
                <Button variant="outline" className="w-full border-[#3c7660] text-[#3c7660] hover:bg-[#3c7660] hover:text-white rounded-xl text-sm">
                  <IoCompass className="w-4 h-4 mr-2" />
                  Discover More
                </Button>
              </Link>
            </div>
          </div>

          {/* Adventure Stats */}
          <div>
            <h3 className="text-lg font-semibold text-[#2a5444] mb-3">Your Stats</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Adventures</span>
                <span className="text-sm font-semibold text-[#3c7660]">{mockPlans.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">This Month</span>
                <span className="text-sm font-semibold text-[#3c7660]">
                  {mockPlans.filter(p => p.scheduled_for.startsWith('2025-08')).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Rating</span>
                <span className="text-sm font-semibold text-[#3c7660]">4.8 ⭐</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Favorite Type</span>
                <span className="text-sm font-semibold text-[#3c7660]">Nature</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
