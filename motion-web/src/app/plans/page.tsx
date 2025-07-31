import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MapPin, Star, BookmarkCheck } from "lucide-react";

export default function PlansPage() {
  // Mock saved adventures
  const mockSavedAdventures = [
    {
      id: "1",
      title: "Weekend Brewery Hop",
      location: "Beer District",
      scheduled_for: "2025-08-10",
      status: "scheduled",
      duration_hours: 5,
      rating: 4.6
    },
    {
      id: "2", 
      title: "Morning Yoga in the Park",
      location: "Riverside Park",
      scheduled_for: "2025-08-05",
      status: "completed",
      duration_hours: 1.5,
      rating: 4.9
    }
  ];

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2a5444] mb-2">My Adventure Plans</h1>
          <p className="text-[#3c7660]">Track your saved, scheduled, and completed adventures</p>
        </div>

        {/* Tabs for different plan states */}
        <Tabs defaultValue="scheduled" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="scheduled" className="data-[state=active]:bg-[#f2cc6c] data-[state=active]:text-white">
              Scheduled
            </TabsTrigger>
            <TabsTrigger value="saved" className="data-[state=active]:bg-[#f2cc6c] data-[state=active]:text-white">
              Saved
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-[#f2cc6c] data-[state=active]:text-white">
              Completed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scheduled" className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockSavedAdventures.filter(a => a.status === 'scheduled').map((adventure) => (
                <Card key={adventure.id} className="bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg text-[#2a5444]">
                        {adventure.title}
                      </CardTitle>
                      <Badge className="bg-[#4d987b] text-white">
                        Scheduled
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-[#3c7660]">
                        <MapPin className="w-4 h-4" />
                        {adventure.location}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#3c7660]">
                        <Calendar className="w-4 h-4" />
                        {new Date(adventure.scheduled_for).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#3c7660]">
                        <Clock className="w-4 h-4" />
                        {adventure.duration_hours}h
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="saved" className="space-y-4">
            <div className="text-center p-8">
              <BookmarkCheck className="w-16 h-16 text-[#3c7660] mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-[#2a5444] mb-2">No Saved Adventures Yet</h3>
              <p className="text-[#3c7660]">Save adventures from the Discover page to see them here</p>
            </div>
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockSavedAdventures.filter(a => a.status === 'completed').map((adventure) => (
                <Card key={adventure.id} className="bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg text-[#2a5444]">
                        {adventure.title}
                      </CardTitle>
                      <Badge className="bg-[#3c7660] text-white">
                        Completed
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-[#3c7660]">
                        <MapPin className="w-4 h-4" />
                        {adventure.location}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#3c7660]">
                        <Calendar className="w-4 h-4" />
                        Completed {new Date(adventure.scheduled_for).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-[#f2cc6c] text-[#f2cc6c]" />
                        <span className="text-[#3c7660] font-medium">{adventure.rating}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
