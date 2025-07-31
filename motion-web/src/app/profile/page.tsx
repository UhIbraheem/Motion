
import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Crown, CreditCard, User as UserIcon, LogOut } from "lucide-react";

import AccountSettings from "../components/profile/AccountSettings";
import PreferencesSettings from "../components/profile/PreferencesSettings";
import SubscriptionSettings from "../components/profile/SubscriptionSettings";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    setLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);
    } catch (error) {
      console.error("Error loading user:", error);
    }
    setLoading(false);
  };

  const updateUserData = async (updates) => {
    setSaving(true);
    try {
      await User.updateMyUserData(updates);
      setUser(prev => ({ ...prev, ...updates }));
    } catch (error) {
      console.error("Error updating user:", error);
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await User.logout();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" 
           style={{ background: 'linear-gradient(to bottom, var(--cream), #faf8f0)' }}>
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--sage-dark)' }}>
            Please sign in to access your profile
          </h2>
          <Button onClick={() => User.login()}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg" 
                 style={{ backgroundColor: 'var(--sage)' }}>
              <span className="text-white font-bold text-xl">
                {user.full_name?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--sage-dark)' }}>
                {user.full_name || 'User Profile'}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="text-xs px-3 py-1"
                       style={{ 
                         backgroundColor: user.subscription_tier === 'premium' ? 'var(--gold)' : 'var(--sage)', 
                         color: 'white' 
                       }}>
                  <Crown className="w-3 h-3 mr-1" />
                  {user.subscription_tier === 'premium' ? 'Motion+ Premium' : 'Free Plan'}
                </Badge>
                <span className="text-sm opacity-70" style={{ color: 'var(--sage)' }}>
                  {user.email}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Tabs */}
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full lg:w-96 grid-cols-3 rounded-xl bg-white/80 backdrop-blur-sm p-1 shadow-sm border border-gold/30">
            <TabsTrigger value="account" className="rounded-lg">
              <UserIcon className="w-4 h-4 mr-2" />
              Account
            </TabsTrigger>
            <TabsTrigger value="preferences" className="rounded-lg">
              <Settings className="w-4 h-4 mr-2" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="subscription" className="rounded-lg">
              <CreditCard className="w-4 h-4 mr-2" />
              Subscription
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="mt-8">
            <AccountSettings
              user={user}
              onUpdate={updateUserData}
              saving={saving}
            />
          </TabsContent>

          <TabsContent value="preferences" className="mt-8">
            <PreferencesSettings
              user={user}
              onUpdate={updateUserData}
              saving={saving}
            />
          </TabsContent>

          <TabsContent value="subscription" className="mt-8">
            <SubscriptionSettings
              user={user}
              onUpdate={updateUserData}
            />
          </TabsContent>
        </Tabs>

        {/* Logout Button */}
        <Card className="mt-8 border-red-200 bg-red-50/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-red-900">Sign Out</h3>
                <p className="text-sm text-red-700">Sign out of your Motion account</p>
              </div>
              <Button variant="outline" onClick={handleLogout} className="border-red-300 text-red-700 hover:bg-red-50">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
