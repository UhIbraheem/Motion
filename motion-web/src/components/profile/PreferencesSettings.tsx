import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Settings, X } from "lucide-react";

const DIETARY_OPTIONS = [
  "Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", 
  "Nut-Free", "Keto", "Halal", "Kosher"
];

const EXPERIENCE_TYPES = [
  "explorer", "hidden-gem", "nature", "foodie", 
  "culture", "adventure", "wellness", "shopping"
];

export default function PreferencesSettings({ user, onUpdate, saving }) {
  const [preferences, setPreferences] = useState({
    radius_preference: user.radius_preference || 25,
    budget_level: user.budget_level || "$$",
    dietary_restrictions: user.dietary_restrictions || [],
    experience_types: user.experience_types || ["explorer"]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(preferences);
  };

  const toggleDietary = (option) => {
    setPreferences(prev => ({
      ...prev,
      dietary_restrictions: prev.dietary_restrictions.includes(option)
        ? prev.dietary_restrictions.filter(item => item !== option)
        : [...prev.dietary_restrictions, option]
    }));
  };

  const removeDietary = (option) => {
    setPreferences(prev => ({
      ...prev,
      dietary_restrictions: prev.dietary_restrictions.filter(item => item !== option)
    }));
  };

  const toggleExperienceType = (type) => {
    setPreferences(prev => ({
      ...prev,
      experience_types: prev.experience_types.includes(type)
        ? prev.experience_types.filter(item => item !== type)
        : [...prev.experience_types, type]
    }));
  };

  return (
    <Card className="border-0 shadow-lg bg-white/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: 'var(--sage-dark)' }}>
          <Settings className="w-5 h-5" />
          Adventure Preferences
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label style={{ color: 'var(--sage-dark)' }}>
              Default Search Radius: {preferences.radius_preference} miles
            </Label>
            <Slider
              value={[preferences.radius_preference]}
              onValueChange={([value]) => setPreferences(prev => ({ ...prev, radius_preference: value }))}
              max={100}
              min={5}
              step={5}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label style={{ color: 'var(--sage-dark)' }}>Default Budget Level</Label>
            <Select
              value={preferences.budget_level}
              onValueChange={(value) => setPreferences(prev => ({ ...prev, budget_level: value }))}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="$">$ Budget-friendly</SelectItem>
                <SelectItem value="$$">$$ Moderate</SelectItem>
                <SelectItem value="$$$">$$$ Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label style={{ color: 'var(--sage-dark)' }}>Preferred Experience Types</Label>
            <div className="flex flex-wrap gap-2">
              {EXPERIENCE_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleExperienceType(type)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                    preferences.experience_types.includes(type)
                      ? 'bg-sage text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-sage/20'
                  }`}
                >
                  {type.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label style={{ color: 'var(--sage-dark)' }}>Dietary Restrictions</Label>
            <div className="flex flex-wrap gap-2 mb-3">
              {DIETARY_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggleDietary(option)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                    preferences.dietary_restrictions.includes(option)
                      ? 'bg-sage text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-sage/20'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            {preferences.dietary_restrictions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {preferences.dietary_restrictions.map((restriction) => (
                  <Badge key={restriction} className="bg-sage/20 text-sage-dark">
                    {restriction}
                    <button
                      type="button"
                      onClick={() => removeDietary(restriction)}
                      className="ml-2 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl"
            style={{ backgroundColor: 'var(--sage)', color: 'white' }}
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}