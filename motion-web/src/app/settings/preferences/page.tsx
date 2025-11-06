"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import PreferencesService, { type UserPreferences } from '@/services/PreferencesService';
import {
  DollarSign,
  MapPin,
  Clock,
  Users,
  Bell,
  Mail,
  Moon,
  RefreshCw,
  Save,
  Sparkles
} from 'lucide-react';
import { BUDGET_TIERS } from '@/config/budgetConfig';

export default function PreferencesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({});

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const prefs = await PreferencesService.getUserPreferences(user.id);
      setPreferences(prefs);
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast.error('Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const success = await PreferencesService.updateUserPreferences(user.id, preferences);

      if (success) {
        toast.success('Preferences saved successfully!');
      } else {
        toast.error('Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!user) return;

    if (!confirm('Reset all preferences to defaults?')) return;

    setSaving(true);
    try {
      const success = await PreferencesService.resetPreferences(user.id);

      if (success) {
        await loadPreferences();
        toast.success('Preferences reset to defaults');
      } else {
        toast.error('Failed to reset preferences');
      }
    } catch (error) {
      console.error('Error resetting preferences:', error);
      toast.error('Failed to reset preferences');
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-[#f8f2d5]/20">
        <Navigation />
        <div className="container mx-auto px-4 py-24 max-w-4xl">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3c7660]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-[#f8f2d5]/20">
      <Navigation />

      <div className="container mx-auto px-4 py-24 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-[#3c7660] to-[#4d987b] bg-clip-text text-transparent">
            Preferences
          </h1>
          <p className="text-gray-600 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#f2cc6c]" />
            Customize your default adventure settings
          </p>
        </div>

        <div className="space-y-6">
          {/* Adventure Creation Defaults */}
          <Card className="border-gray-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-[#3c7660] flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Adventure Creation Defaults
              </CardTitle>
              <CardDescription>
                These settings will pre-fill when you create new adventures
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Default Budget */}
              <div className="space-y-2">
                <Label htmlFor="default-budget" className="flex items-center gap-2 text-gray-900">
                  <DollarSign className="w-4 h-4 text-[#3c7660]" />
                  Default Budget
                </Label>
                <Select
                  value={preferences.defaultBudget || 'moderate'}
                  onValueChange={(value) => updatePreference('defaultBudget', value as any)}
                >
                  <SelectTrigger id="default-budget">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BUDGET_TIERS.map(tier => (
                      <SelectItem key={tier.id} value={tier.id}>
                        {tier.symbol} {tier.label} - {tier.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">Your preferred spending level for adventures</p>
              </div>

              {/* Default Radius */}
              <div className="space-y-2">
                <Label htmlFor="default-radius" className="flex items-center gap-2 text-gray-900">
                  <MapPin className="w-4 h-4 text-[#3c7660]" />
                  Default Search Radius (miles)
                </Label>
                <Input
                  id="default-radius"
                  type="number"
                  min="1"
                  max="50"
                  value={preferences.defaultRadius || 10}
                  onChange={(e) => updatePreference('defaultRadius', parseInt(e.target.value))}
                  className="max-w-xs"
                />
                <p className="text-xs text-gray-500">How far from your location to search for experiences</p>
              </div>

              {/* Default Duration */}
              <div className="space-y-2">
                <Label htmlFor="default-duration" className="flex items-center gap-2 text-gray-900">
                  <Clock className="w-4 h-4 text-[#3c7660]" />
                  Default Duration
                </Label>
                <Select
                  value={preferences.defaultDuration || 'half-day'}
                  onValueChange={(value) => updatePreference('defaultDuration', value as any)}
                >
                  <SelectTrigger id="default-duration" className="max-w-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short (≈2 hours)</SelectItem>
                    <SelectItem value="half-day">Half Day (4-6 hours)</SelectItem>
                    <SelectItem value="full-day">Full Day (6+ hours)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">Your preferred adventure length</p>
              </div>

              {/* Default Group Size */}
              <div className="space-y-2">
                <Label htmlFor="default-group-size" className="flex items-center gap-2 text-gray-900">
                  <Users className="w-4 h-4 text-[#3c7660]" />
                  Default Group Size
                </Label>
                <Input
                  id="default-group-size"
                  type="number"
                  min="1"
                  max="20"
                  value={preferences.defaultGroupSize || 2}
                  onChange={(e) => updatePreference('defaultGroupSize', parseInt(e.target.value))}
                  className="max-w-xs"
                />
                <p className="text-xs text-gray-500">Number of people typically in your group</p>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="border-gray-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-[#3c7660] flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Manage how Motion keeps you updated
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Updates */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-opt-in" className="flex items-center gap-2 text-gray-900">
                    <Mail className="w-4 h-4 text-[#3c7660]" />
                    Email Updates
                  </Label>
                  <p className="text-xs text-gray-500">Get product updates and adventure tips</p>
                </div>
                <Switch
                  id="email-opt-in"
                  checked={preferences.emailOptIn ?? true}
                  onCheckedChange={(checked) => updatePreference('emailOptIn', checked)}
                />
              </div>

              <Separator />

              {/* Scheduled Reminders */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="scheduled-reminders" className="text-gray-900">
                    Scheduled Adventure Reminders
                  </Label>
                  <p className="text-xs text-gray-500">Get notified before scheduled adventures</p>
                </div>
                <Switch
                  id="scheduled-reminders"
                  checked={preferences.scheduledReminders ?? true}
                  onCheckedChange={(checked) => updatePreference('scheduledReminders', checked)}
                />
              </div>

              {/* Reminder Hours Before */}
              {preferences.scheduledReminders && (
                <div className="space-y-2 ml-6">
                  <Label htmlFor="reminder-hours" className="text-sm text-gray-700">
                    Remind me (hours before)
                  </Label>
                  <Select
                    value={String(preferences.reminderHoursBefore || 24)}
                    onValueChange={(value) => updatePreference('reminderHoursBefore', parseInt(value))}
                  >
                    <SelectTrigger id="reminder-hours" className="max-w-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hour before</SelectItem>
                      <SelectItem value="3">3 hours before</SelectItem>
                      <SelectItem value="24">1 day before</SelectItem>
                      <SelectItem value="48">2 days before</SelectItem>
                      <SelectItem value="168">1 week before</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* UI Preferences */}
          <Card className="border-gray-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-[#3c7660] flex items-center gap-2">
                <Moon className="w-5 h-5" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize how Motion looks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode" className="text-gray-900">
                    Dark Mode
                  </Label>
                  <p className="text-xs text-gray-500">Use dark theme (coming soon)</p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={preferences.darkMode ?? false}
                  onCheckedChange={(checked) => updatePreference('darkMode', checked)}
                  disabled
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-4 pt-4">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={saving}
              className="border-gray-300"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset to Defaults
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-[#3c7660] to-[#4d987b] text-white hover:shadow-lg"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
