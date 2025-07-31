
import React, { useState, useEffect } from "react";
import { Adventure } from "@/entities/Adventure";
import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Archive, CheckCircle, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import SavedAdventures from "../components/plans/SavedAdventures";
import ScheduledAdventures from "../components/plans/ScheduledAdventures";
import CompletedAdventures from "../components/plans/CompletedAdventures";
import AdventureCalendar from "../components/plans/AdventureCalendar";

export default function PlansPage() {
  const [adventures, setAdventures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("saved");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);
      
      const adventureData = await Adventure.filter({ created_by: userData.email }, "-created_date");
      setAdventures(adventureData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const handleScheduleAdventure = async (adventureId, scheduledDate) => {
    try {
      await Adventure.update(adventureId, {
        is_scheduled: true,
        scheduled_date: scheduledDate
      });
      loadData();
    } catch (error) {
      console.error("Error scheduling adventure:", error);
    }
  };

  const handleCompleteAdventure = async (adventureId, rating, notes) => {
    try {
      await Adventure.update(adventureId, {
        is_completed: true,
        rating,
        completion_notes: notes
      });
      loadData();
    } catch (error) {
      console.error("Error completing adventure:", error);
    }
  };

  const handleShareAdventure = async (adventureId) => {
    try {
      await Adventure.update(adventureId, {
        is_shared: true
      });
      loadData();
    } catch (error) {
      console.error("Error sharing adventure:", error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--sage-dark)' }}>
            Please sign in to view your plans
          </h2>
          <Button onClick={() => User.login()}>Sign In</Button>
        </div>
      </div>
    );
  }

  const savedAdventures = adventures.filter(a => !a.is_scheduled && !a.is_completed);
  const scheduledAdventures = adventures.filter(a => a.is_scheduled && !a.is_completed);
  const completedAdventures = adventures.filter(a => a.is_completed);

  return (
    <div className="min-h-screen p-6 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--sage-dark)' }}>
              Your Adventure Plans
            </h1>
            <p className="text-lg opacity-80" style={{ color: 'var(--sage)' }}>
              Manage your saved adventures and track your experiences
            </p>
          </div>
          <Link to={createPageUrl("Create")}>
            <Button className="shadow-lg" style={{ backgroundColor: 'var(--sage)', color: 'white' }}>
              <Plus className="w-4 h-4 mr-2" />
              Create New Adventure
            </Button>
          </Link>
        </div>

        {/* Adventure Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gold/30">
            <div className="flex items-center gap-3 mb-2">
              <Archive className="w-5 h-5" style={{ color: 'var(--sage)' }} />
              <span className="font-semibold" style={{ color: 'var(--sage-dark)' }}>Saved</span>
            </div>
            <div className="text-3xl font-bold" style={{ color: 'var(--sage-dark)' }}>
              {savedAdventures.length}
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gold/30">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5" style={{ color: 'var(--gold)' }} />
              <span className="font-semibold" style={{ color: 'var(--sage-dark)' }}>Scheduled</span>
            </div>
            <div className="text-3xl font-bold" style={{ color: 'var(--sage-dark)' }}>
              {scheduledAdventures.length}
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gold/30">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5" style={{ color: 'var(--teal)' }} />
              <span className="font-semibold" style={{ color: 'var(--sage-dark)' }}>Completed</span>
            </div>
            <div className="text-3xl font-bold" style={{ color: 'var(--sage-dark)' }}>
              {completedAdventures.length}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full lg:w-96 grid-cols-4 rounded-xl bg-white/80 backdrop-blur-sm p-1 shadow-sm border border-gold/30">
            <TabsTrigger value="saved" className="rounded-lg">Saved</TabsTrigger>
            <TabsTrigger value="scheduled" className="rounded-lg">Scheduled</TabsTrigger>
            <TabsTrigger value="completed" className="rounded-lg">Completed</TabsTrigger>
            <TabsTrigger value="calendar" className="rounded-lg">Calendar</TabsTrigger>
          </TabsList>

          <TabsContent value="saved" className="mt-8">
            <SavedAdventures
              adventures={savedAdventures}
              loading={loading}
              onSchedule={handleScheduleAdventure}
              onShare={handleShareAdventure}
            />
          </TabsContent>

          <TabsContent value="scheduled" className="mt-8">
            <ScheduledAdventures
              adventures={scheduledAdventures}
              loading={loading}
              onComplete={handleCompleteAdventure}
            />
          </TabsContent>

          <TabsContent value="completed" className="mt-8">
            <CompletedAdventures
              adventures={completedAdventures}
              loading={loading}
              onShare={handleShareAdventure}
            />
          </TabsContent>

          <TabsContent value="calendar" className="mt-8">
            <AdventureCalendar adventures={scheduledAdventures} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
