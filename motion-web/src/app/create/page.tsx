
import React, { useState, useEffect } from "react";
import { Adventure } from "@/entities/Adventure";
import { User } from "@/entities/User";
import { InvokeLLM } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, AlertCircle, Wand2 } from "lucide-react";
import { createPageUrl } from "@/utils";

import AdventureForm from "../components/create/AdventureForm";
import GeneratedAdventures from "../components/create/GeneratedAdventures";
import LoadingAnimation from "../components/create/LoadingAnimation";

export default function CreatePage() {
  const [user, setUser] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [generatedAdventures, setGeneratedAdventures] = useState([]);
  const [error, setError] = useState("");
  const [preferences, setPreferences] = useState({
    location: "",
    radius: 25,
    experienceType: "explorer",
    duration: 4,
    budget: "$$",
    groupSize: 2,
    startTime: "10:00",
    dietaryRestrictions: [],
    specialRequests: ""
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      
      // Pre-fill form with user preferences
      setPreferences(prev => ({
        ...prev,
        location: userData.location || "",
        radius: userData.radius_preference || 25,
        budget: userData.budget_level || "$$",
        dietaryRestrictions: userData.dietary_restrictions || []
      }));
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const canGenerateAdventure = () => {
    if (!user) return false;
    if (user.subscription_tier === 'premium') return true;
    return (user.adventures_used_this_month || 0) < 3;
  };

  const generateAdventure = async () => {
    if (!canGenerateAdventure()) {
      setError("You've reached your monthly limit. Upgrade to Motion+ for unlimited adventures!");
      return;
    }

    setGenerating(true);
    setError("");
    setGeneratedAdventures([]);

    try {
      const prompt = `Generate a detailed adventure itinerary with the following preferences:
      
Location: ${preferences.location}
Experience Type: ${preferences.experienceType}
Duration: ${preferences.duration} hours
Budget Level: ${preferences.budget}
Group Size: ${preferences.groupSize} people
Start Time: ${preferences.startTime}
Dietary Restrictions: ${preferences.dietaryRestrictions.join(", ") || "None"}
Special Requests: ${preferences.specialRequests || "None"}

Create a step-by-step adventure with specific venues, times, and activities. Include:
- A compelling adventure title and description
- 4-6 detailed steps with specific locations, times, and activities
- Estimated costs for each step
- Booking information where relevant
- Real addresses and venue names when possible

Make it feel like a curated, premium experience that justifies the Motion brand.`;

      const result = await InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            adventures: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  duration_hours: { type: "number" },
                  estimated_cost: { type: "number" },
                  experience_type: { type: "string" },
                  steps: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        step_number: { type: "number" },
                        time: { type: "string" },
                        location: { type: "string" },
                        activity: { type: "string" },
                        description: { type: "string" },
                        estimated_cost: { type: "number" },
                        duration_minutes: { type: "number" },
                        booking_info: { type: "string" },
                        address: { type: "string" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (result.adventures && result.adventures.length > 0) {
        setGeneratedAdventures(result.adventures);
        
        // Update user's adventure count
        await User.updateMyUserData({
          adventures_used_this_month: (user.adventures_used_this_month || 0) + 1
        });
        
        setUser(prev => ({
          ...prev,
          adventures_used_this_month: (prev.adventures_used_this_month || 0) + 1
        }));
      } else {
        throw new Error("No adventures generated");
      }

    } catch (error) {
      console.error("Error generating adventure:", error);
      setError("Sorry, we couldn't generate your adventure right now. Please try again.");
    }
    
    setGenerating(false);
  };

  const saveAdventure = async (adventure, isScheduled = false, scheduledDate = null) => {
    try {
      const adventureData = {
        ...adventure,
        location: preferences.location,
        budget_level: preferences.budget,
        is_shared: false,
        is_scheduled: isScheduled,
        scheduled_date: scheduledDate,
        is_completed: false
      };

      await Adventure.create(adventureData);
    } catch (error) {
      console.error("Error saving adventure:", error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Card className="w-96 shadow-xl border border-gold/30 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--gold)' }} />
            <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--sage-dark)' }}>
              Please sign in to create adventures
            </h2>
            <Button onClick={() => User.login()} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                 style={{ background: 'linear-gradient(135deg, var(--sage), var(--gold))' }}>
              <Wand2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold" style={{ color: 'var(--sage-dark)' }}>
              Create Your Perfect Adventure
            </h1>
          </div>
          <p className="text-lg opacity-80 max-w-2xl mx-auto" style={{ color: 'var(--sage)' }}>
            Tell us what you're in the mood for, and we'll craft a personalized adventure just for you
          </p>
        </div>

        {/* Usage Indicator */}
        {user.subscription_tier === 'free' && (
          <Card className="mb-6 border border-gold/30 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium" style={{ color: 'var(--sage-dark)' }}>
                    Adventures Used: {user.adventures_used_this_month || 0}/3
                  </p>
                  <p className="text-sm opacity-70" style={{ color: 'var(--sage)' }}>
                    Upgrade to Motion+ for unlimited adventures
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => window.location.href = createPageUrl("Profile")}>
                  Upgrade
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Adventure Form */}
          <div>
            <AdventureForm
              preferences={preferences}
              setPreferences={setPreferences}
              onGenerate={generateAdventure}
              generating={generating}
              canGenerate={canGenerateAdventure()}
            />
          </div>

          {/* Results Area */}
          <div>
            {generating && <LoadingAnimation />}
            
            {generatedAdventures.length > 0 && (
              <GeneratedAdventures
                adventures={generatedAdventures}
                onSave={saveAdventure}
                preferences={preferences}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
