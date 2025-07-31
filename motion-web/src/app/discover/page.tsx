import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Compass, MapPin, Clock, DollarSign, Star } from "lucide-react";

export default function DiscoverPage() {
  // Mock adventure data
  const mockAdventures = [
    {
      id: "1",
      title: "Downtown Art Walk",
      description: "Explore local galleries and street art in the historic downtown district",
      location: "Downtown District",
      duration_hours: 3,
      estimated_cost: 25,
      budget_level: "$$",
      experience_type: "Culture",
      rating: 4.8,
    },
    {
      id: "2", 
      title: "Sunset Hiking Trail",
      description: "A peaceful hike with breathtaking sunset views over the city",
      location: "Mountain Trail Park",
      duration_hours: 2,
      estimated_cost: 0,
      budget_level: "$",
      experience_type: "Nature",
      rating: 4.9,
    },
    {
      id: "3",
      title: "Local Food Tour",
      description: "Taste authentic local cuisine at hidden gem restaurants",
      location: "Various Locations",
      duration_hours: 4,
      estimated_cost: 75,
      budget_level: "$$$",
      experience_type: "Food",
      rating: 4.7,
    }
  ];

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2a5444] mb-2">Discover Adventures</h1>
          <p className="text-[#3c7660]">Explore amazing local experiences curated by our community</p>
        </div>

        {/* Adventure Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockAdventures.map((adventure) => (
            <Card key={adventure.id} className="hover:shadow-lg transition-shadow cursor-pointer bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-[#2a5444] mb-2">
                      {adventure.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-[#3c7660] mb-2">
                      <MapPin className="w-4 h-4" />
                      {adventure.location}
                    </div>
                  </div>
                  <Badge className="bg-[#f2cc6c] text-white">
                    {adventure.experience_type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-[#3c7660] mb-4 text-sm">
                  {adventure.description}
                </p>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-[#3c7660]">
                      <Clock className="w-4 h-4" />
                      {adventure.duration_hours}h
                    </div>
                    <div className="flex items-center gap-1 text-[#3c7660]">
                      <DollarSign className="w-4 h-4" />
                      {adventure.budget_level}
                    </div>
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

        {/* Empty State for More Adventures */}
        <div className="text-center mt-12 p-8">
          <Compass className="w-16 h-16 text-[#3c7660] mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-[#2a5444] mb-2">More Adventures Coming Soon</h3>
          <p className="text-[#3c7660]">Connect with our AI backend to discover personalized adventures</p>
        </div>
      </div>
    </div>
  );
}
