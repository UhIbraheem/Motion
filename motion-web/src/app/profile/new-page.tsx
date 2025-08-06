"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { 
  User, 
  Settings, 
  Crown, 
  MapPin, 
  Calendar, 
  Star, 
  Lock, 
  CreditCard,
  Shield,
  LogOut,
  Receipt,
  Bell,
  Eye,
  EyeOff
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    displayName: user?.name || user?.fullName || ''
  });

  const handleSignOut = async () => {
    try {
      await signOut();
      // Redirect will be handled by the auth context
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleSave = () => {
    // Here you would typically save to your backend
    console.log('Saving profile data:', formData);
    setIsEditing(false);
  };

  // If user is not signed in, show sign-in prompt
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to view profile</h2>
              <p className="text-gray-600">
                Create an account or sign in to access your profile, save adventures, and track your journey.
              </p>
            </div>
            
            <div className="space-y-3">
              <Link href="/auth/signin">
                <Button className="w-full bg-[#3c7660] hover:bg-[#2a5444] text-white">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button variant="outline" className="w-full border-[#3c7660] text-[#3c7660] hover:bg-[#3c7660] hover:text-white">
                  Create Account
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Header */}
        <div className="text-center space-y-4">
          <Avatar className="w-24 h-24 mx-auto">
            <AvatarImage src="" alt={user.fullName || user.name || "User"} />
            <AvatarFallback className="bg-[#3c7660] text-white text-2xl">
              {(user.fullName || user.name || user.email || "U").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {user.fullName || user.name || "Explorer"}
            </h1>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center text-[#3c7660]">
                  <User className="w-5 h-5 mr-2" />
                  Personal Information
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="border-[#3c7660] text-[#3c7660] hover:bg-[#3c7660] hover:text-white"
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Full Name</label>
                    <Input
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      disabled={!isEditing}
                      className="border-gray-300 focus:border-[#3c7660] focus:ring-[#3c7660]"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Display Name</label>
                    <Input
                      value={formData.displayName}
                      onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                      disabled={!isEditing}
                      className="border-gray-300 focus:border-[#3c7660] focus:ring-[#3c7660]"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
                  <Input
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    disabled={!isEditing}
                    type="email"
                    className="border-gray-300 focus:border-[#3c7660] focus:ring-[#3c7660]"
                  />
                </div>
                {isEditing && (
                  <Button 
                    onClick={handleSave}
                    className="bg-[#3c7660] hover:bg-[#2a5444] text-white"
                  >
                    Save Changes
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Billing & Subscription */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-[#3c7660]">
                  <Crown className="w-5 h-5 mr-2" />
                  Subscription & Billing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-gradient-to-r from-[#3c7660]/10 to-[#f2cc6c]/10 rounded-lg border border-[#3c7660]/20">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-900">Current Plan</span>
                    <Badge className={`${
                      user.subscriptionTier === "free" ? "bg-gray-500" :
                      user.subscriptionTier === "explorer" ? "bg-[#3c7660]" :
                      "bg-[#f2cc6c] text-black"
                    } text-white`}>
                      {user.subscriptionTier?.charAt(0).toUpperCase() + user.subscriptionTier?.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    {user.subscriptionTier === "free" && "Basic features with limited AI generations"}
                    {user.subscriptionTier === "explorer" && "Enhanced features with more AI generations"}
                    {user.subscriptionTier === "pro" && "Premium features with unlimited AI generations"}
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">AI Generations:</span>
                      <p className="font-medium">{user.generationsUsed || 0} / {user.generationsLimit || 10}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Edits:</span>
                      <p className="font-medium">{user.editsUsed || 0} / {user.editsLimit || 3}</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button className="bg-[#3c7660] hover:bg-[#2a5444] text-white">
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade Plan
                  </Button>
                  <Button variant="outline" className="border-[#3c7660] text-[#3c7660] hover:bg-[#3c7660] hover:text-white">
                    <Receipt className="w-4 h-4 mr-2" />
                    Billing History
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Account Settings */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-[#3c7660]">
                  <Settings className="w-5 h-5 mr-2" />
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button variant="outline" className="justify-start">
                    <Shield className="w-4 h-4 mr-2" />
                    Privacy Settings
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Bell className="w-4 h-4 mr-2" />
                    Notifications
                  </Button>
                  <Link href="/auth/reset-password" passHref>
                    <Button variant="outline" className="w-full justify-start">
                      <Lock className="w-4 h-4 mr-2" />
                      Change Password
                    </Button>
                  </Link>
                  <Button variant="outline" className="justify-start">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Payment Methods
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-0 shadow-sm border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center text-red-600">
                  <Shield className="w-5 h-5 mr-2" />
                  Account Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!showSignOutConfirm ? (
                  <Button 
                    onClick={() => setShowSignOutConfirm(true)}
                    variant="outline" 
                    className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                ) : (
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-red-800 mb-3">
                      Are you sure you want to sign out? You'll need to sign in again to access your account.
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleSignOut}
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Yes, Sign Out
                      </Button>
                      <Button 
                        onClick={() => setShowSignOutConfirm(false)}
                        size="sm"
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Stats & Activity */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-[#3c7660]">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Adventures Completed</span>
                    <span className="font-semibold text-[#3c7660]">12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Distance</span>
                    <span className="font-semibold text-[#3c7660]">24.3 miles</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Favorite Type</span>
                    <span className="font-semibold text-[#3c7660]">Nature</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Member Since</span>
                    <span className="font-semibold text-[#3c7660]">Jan 2025</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Adventures */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-[#3c7660]">Recent Adventures</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { title: "Hidden Waterfall Trail", location: "Portland, OR", date: "2 days ago", status: "Completed" },
                    { title: "Urban Art Walk", location: "Seattle, WA", date: "1 week ago", status: "Saved" },
                    { title: "Coastal Photography Tour", location: "San Francisco, CA", date: "2 weeks ago", status: "In Progress" },
                  ].map((adventure, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">{adventure.title}</h4>
                        <p className="text-xs text-gray-600">{adventure.location} • {adventure.date}</p>
                      </div>
                      <Badge variant="outline" className={
                        adventure.status === "Completed" ? "border-green-500 text-green-700" :
                        adventure.status === "In Progress" ? "border-blue-500 text-blue-700" :
                        "border-gray-500 text-gray-700"
                      }>
                        {adventure.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
