
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Clock, DollarSign, Sparkles, X } from "lucide-react";

const EXPERIENCE_TYPES = [
  { value: "explorer", label: "Explorer", icon: "🗺️" },
  { value: "hidden-gem", label: "Hidden Gem", icon: "💎" },
  { value: "nature", label: "Nature", icon: "🌲" },
  { value: "foodie", label: "Foodie", icon: "🍽️" },
  { value: "culture", label: "Culture", icon: "🎭" },
  { value: "adventure", label: "Adventure", icon: "🎢" },
  { value: "wellness", label: "Wellness", icon: "🧘" },
  { value: "shopping", label: "Shopping", icon: "🛍️" }
];

const DIETARY_OPTIONS = [
  "Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", 
  "Nut-Free", "Keto", "Halal", "Kosher"
];

export default function AdventureForm({ 
  preferences, 
  setPreferences, 
  onGenerate, 
  generating, 
  canGenerate 
}) {
  const updatePreference = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const toggleDietary = (option) => {
    setPreferences(prev => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions.includes(option)
        ? prev.dietaryRestrictions.filter(item => item !== option)
        : [...prev.dietaryRestrictions, option]
    }));
  };

  const removeDietary = (option) => {
    setPreferences(prev => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions.filter(item => item !== option)
    }));
  };

  return (
    <Card className="border border-gold/30 shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center gap-3 text-xl" style={{ color: 'var(--sage-dark)' }}>
          <Sparkles className="w-6 h-6" style={{ color: 'var(--gold)' }} />
          Adventure Preferences
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Location */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 font-medium" style={{ color: 'var(--sage-dark)' }}>
            <MapPin className="w-4 h-4" />
            Location
          </Label>
          <Input
            placeholder="Enter your city or area"
            value={preferences.location}
            onChange={(e) => updatePreference('location', e.target.value)}
            className="rounded-xl border-sage/20 focus:border-sage"
          />
        </div>

        {/* Search Radius */}
        <div className="space-y-3">
          <Label className="font-medium" style={{ color: 'var(--sage-dark)' }}>
            Search Radius: {preferences.radius} miles
          </Label>
          <Slider
            value={[preferences.radius]}
            onValueChange={([value]) => updatePreference('radius', value)}
            max={100}
            min={5}
            step={5}
            className="w-full"
          />
        </div>

        {/* Experience Type */}
        <div className="space-y-3">
          <Label className="font-medium" style={{ color: 'var(--sage-dark)' }}>
            Experience Type
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {EXPERIENCE_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => updatePreference('experienceType', type.value)}
                className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                  preferences.experienceType === type.value
                    ? 'border-sage bg-sage/10' 
                    : 'border-gray-200 hover:border-sage/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{type.icon}</span>
                  <span className="font-medium text-sm" style={{ color: 'var(--sage-dark)' }}>
                    {type.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Duration & Time */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 font-medium" style={{ color: 'var(--sage-dark)' }}>
              <Clock className="w-4 h-4" />
              Duration (hours)
            </Label>
            <Select 
              value={preferences.duration.toString()} 
              onValueChange={(value) => updatePreference('duration', parseInt(value))}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 hours</SelectItem>
                <SelectItem value="4">4 hours</SelectItem>
                <SelectItem value="6">6 hours</SelectItem>
                <SelectItem value="8">8 hours</SelectItem>
                <SelectItem value="10">Full day (10h)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="font-medium" style={{ color: 'var(--sage-dark)' }}>
              Start Time
            </Label>
            <Input
              type="time"
              value={preferences.startTime}
              onChange={(e) => updatePreference('startTime', e.target.value)}
              className="rounded-xl border-sage/20"
            />
          </div>
        </div>

        {/* Budget & Group Size */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 font-medium" style={{ color: 'var(--sage-dark)' }}>
              <DollarSign className="w-4 h-4" />
              Budget Level
            </Label>
            <Select 
              value={preferences.budget} 
              onValueChange={(value) => updatePreference('budget', value)}
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

          <div className="space-y-2">
            <Label className="flex items-center gap-2 font-medium" style={{ color: 'var(--sage-dark)' }}>
              <Users className="w-4 h-4" />
              Group Size
            </Label>
            <Select 
              value={preferences.groupSize.toString()} 
              onValueChange={(value) => updatePreference('groupSize', parseInt(value))}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1,2,3,4,5,6,7,8,9,10].map(num => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? 'person' : 'people'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Dietary Restrictions */}
        <div className="space-y-3">
          <Label className="font-medium" style={{ color: 'var(--sage-dark)' }}>
            Dietary Restrictions
          </Label>
          <div className="flex flex-wrap gap-2 mb-3">
            {DIETARY_OPTIONS.map((option) => (
              <button
                key={option}
                onClick={() => toggleDietary(option)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  preferences.dietaryRestrictions.includes(option)
                    ? 'bg-sage text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-sage/20'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          {preferences.dietaryRestrictions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {preferences.dietaryRestrictions.map((restriction) => (
                <Badge key={restriction} className="bg-sage/20 text-sage-dark">
                  {restriction}
                  <button
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

        {/* Special Requests */}
        <div className="space-y-2">
          <Label className="font-medium" style={{ color: 'var(--sage-dark)' }}>
            Special Requests (Optional)
          </Label>
          <Textarea
            placeholder="Any specific preferences, accessibility needs, or special occasions?"
            value={preferences.specialRequests}
            onChange={(e) => updatePreference('specialRequests', e.target.value)}
            className="rounded-xl border-sage/20 resize-none h-20"
          />
        </div>

        {/* Generate Button */}
        <Button
          onClick={onGenerate}
          disabled={generating || !canGenerate || !preferences.location}
          className="w-full h-12 rounded-xl font-semibold shadow-lg text-white"
          style={{ backgroundColor: 'var(--sage)' }}
        >
          {generating ? (
            <>
              <Sparkles className="w-5 h-5 mr-2 animate-spin" />
              Creating Your Adventure...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Perfect Adventure
            </>
          )}
        </Button>

        {!canGenerate && (
          <p className="text-xs text-red-600 text-center">
            You've reached your monthly adventure limit. Upgrade to Motion+ for unlimited adventures!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
