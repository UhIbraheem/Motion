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

export default function ProfilePage() {
  const { user } = useAuth();

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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2a5444] mb-2">Profile</h1>
          <p className="text-[#3c7660]">Manage your account and adventure preferences</p>
        </div>

        {/* Profile Overview */}
        <Card className="border-0 shadow-sm bg-gradient-to-r from-[#3c7660]/5 to-[#f2cc6c]/5">
          <CardContent className="p-6">
            <div className="flex items-center space-x-6">
              <Avatar className="w-24 h-24">
                <AvatarFallback className="bg-[#3c7660] text-white text-2xl">
                  {(user.fullName || user.name || user.email).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">{user.fullName || user.name || user.email}</h2>
                  <Badge className={`${
                    user.subscriptionTier === "free" ? "bg-gray-500" :
                    user.subscriptionTier === "explorer" ? "bg-[#3c7660]" :
                    "bg-[#f2cc6c] text-black"
                  } text-white`}>
                    {user.subscriptionTier.charAt(0).toUpperCase() + user.subscriptionTier.slice(1)}
                  </Badge>
                </div>
                <p className="text-gray-600 mb-1">{user.email}</p>
                <p className="text-sm text-gray-500 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {user.subscriptionStatus === 'active' ? 'Active subscription' : 'Free account'}
                </p>
              </div>
              
              <Button variant="outline" className="border-[#3c7660] text-[#3c7660] hover:bg-[#3c7660] hover:text-white">
                <Settings className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-[#3c7660]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-6 h-6 text-[#3c7660]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{user.generationsUsed}</h3>
              <p className="text-gray-600">Generations Used</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-[#f2cc6c]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-[#f2cc6c]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{user.generationsLimit}</h3>
              <p className="text-gray-600">Generation Limit</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-[#3c7660]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Crown className="w-6 h-6 text-[#3c7660]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{user.editsUsed}</h3>
              <p className="text-gray-600">Edits Used</p>
            </CardContent>
          </Card>
        </div>

        {/* Account Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-[#3c7660]">
                <User className="w-5 h-5 mr-2" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Full Name</label>
                <Input value={user.fullName || user.name || ''} className="border-gray-300" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
                <Input value={user.email} className="border-gray-300" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Subscription Status</label>
                <Input value={user.subscriptionStatus} className="border-gray-300" readOnly />
              </div>
              <Button className="w-full bg-[#3c7660] hover:bg-[#2a5444] text-white">
                Save Changes
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-[#3c7660]">
                <Crown className="w-5 h-5 mr-2" />
                Membership & Billing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">Current Plan</span>
                  <Badge className={`${
                    user.subscriptionTier === "free" ? "bg-gray-500" :
                    user.subscriptionTier === "explorer" ? "bg-[#3c7660]" :
                    "bg-[#f2cc6c] text-black"
                  } text-white`}>
                    {user.subscriptionTier.charAt(0).toUpperCase() + user.subscriptionTier.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  {user.subscriptionTier === "free" && "Basic features with limited AI generations"}
                  {user.subscriptionTier === "explorer" && "Enhanced features with more AI generations"}
                  {user.subscriptionTier === "pro" && "Premium features with unlimited AI generations"}
                </p>
              </div>
              
              <div className="space-y-2">
                <Button variant="outline" className="w-full border-[#3c7660] text-[#3c7660] hover:bg-[#3c7660] hover:text-white">
                  Upgrade Plan
                </Button>
                <Button variant="outline" className="w-full">
                  Billing History
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
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
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{adventure.title}</h4>
                    <p className="text-sm text-gray-600">{adventure.location} • {adventure.date}</p>
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
  );
}
