
import React, { useState, useEffect } from "react";
import { Adventure } from "@/entities/Adventure";
import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MapPin, Clock, DollarSign, Star, Bookmark, Share2, TrendingUp } from "lucide-react";
import { format } from "date-fns";

import AdventureCard from "../components/discover/AdventureCard";
import AdventureFilters from "../components/discover/AdventureFilters";
import TrendingSection from "../components/discover/TrendingSection";

export default function DiscoverPage() {
  const [adventures, setAdventures] = useState([]);
  const [filteredAdventures, setFilteredAdventures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    budget: "all",
    duration: "all",
    location: "all",
    experienceType: "all"
  });
  const [activeTab, setActiveTab] = useState("all");
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterAdventures();
  }, [adventures, searchQuery, filters, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);
      
      const adventureData = await Adventure.filter({ is_shared: true }, "-created_date", 50);
      setAdventures(adventureData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const filterAdventures = () => {
    let filtered = [...adventures];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(adventure => 
        adventure.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        adventure.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        adventure.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Budget filter
    if (filters.budget !== "all") {
      filtered = filtered.filter(adventure => adventure.budget_level === filters.budget);
    }

    // Duration filter
    if (filters.duration !== "all") {
      filtered = filtered.filter(adventure => {
        const duration = adventure.duration_hours;
        switch (filters.duration) {
          case "short": return duration <= 2;
          case "medium": return duration > 2 && duration <= 6;
          case "long": return duration > 6;
          default: return true;
        }
      });
    }

    // Experience type filter
    if (filters.experienceType !== "all") {
      filtered = filtered.filter(adventure => 
        adventure.experience_type?.toLowerCase().includes(filters.experienceType.toLowerCase())
      );
    }

    // Tab filter
    if (activeTab === "trending") {
      // Simple trending logic - adventures created in last 7 days
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(adventure => 
        new Date(adventure.created_date) > weekAgo
      );
    }

    setFilteredAdventures(filtered);
  };

  const handleSaveAdventure = async (adventure) => {
    try {
      await Adventure.create({
        ...adventure,
        created_by: user.email,
        is_shared: false,
        id: undefined
      });
    } catch (error) {
      console.error("Error saving adventure:", error);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--sage-dark)' }}>
                Discover Adventures
              </h1>
              <p className="text-lg opacity-80" style={{ color: 'var(--sage)' }}>
                Explore incredible experiences shared by the community
              </p>
            </div>
            <TrendingSection adventures={adventures} />
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-40" 
                      style={{ color: 'var(--sage)' }} />
              <Input
                placeholder="Search adventures, locations, or activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-12 rounded-xl border border-gold/30 shadow-sm bg-white/80 backdrop-blur-sm"
              />
            </div>
            <AdventureFilters filters={filters} setFilters={setFilters} />
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full lg:w-96 grid-cols-3 rounded-xl bg-white/80 backdrop-blur-sm p-1 shadow-sm border border-gold/30">
              <TabsTrigger value="all" className="rounded-lg">All Adventures</TabsTrigger>
              <TabsTrigger value="trending" className="rounded-lg">
                <TrendingUp className="w-4 h-4 mr-2" />
                Trending
              </TabsTrigger>
              <TabsTrigger value="nearby" className="rounded-lg">Near Me</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                  Array(6).fill(0).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="h-20 bg-gray-200 rounded"></div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  filteredAdventures.map((adventure) => (
                    <AdventureCard
                      key={adventure.id}
                      adventure={adventure}
                      onSave={() => handleSaveAdventure(adventure)}
                      user={user}
                    />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="trending" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAdventures.map((adventure) => (
                  <AdventureCard
                    key={adventure.id}
                    adventure={adventure}
                    onSave={() => handleSaveAdventure(adventure)}
                    user={user}
                    showTrendingBadge={true}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="nearby" className="mt-8">
              <div className="text-center py-12">
                <MapPin className="w-16 h-16 mx-auto mb-4 opacity-40" style={{ color: 'var(--sage)' }} />
                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--sage-dark)' }}>
                  Location Features Coming Soon
                </h3>
                <p className="opacity-70" style={{ color: 'var(--sage)' }}>
                  We're working on location-based discovery features
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {!loading && filteredAdventures.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 mx-auto mb-4 opacity-40" style={{ color: 'var(--sage)' }} />
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--sage-dark)' }}>
              No adventures found
            </h3>
            <p className="opacity-70" style={{ color: 'var(--sage)' }}>
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
