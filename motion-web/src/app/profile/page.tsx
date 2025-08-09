"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  IoPersonOutline,
  IoSettingsOutline,
  IoStar,
  IoLocationOutline,
  IoCalendarOutline,
  IoStarOutline,
  IoLockClosedOutline,
  IoCardOutline,
  IoShieldOutline,
  IoLogOutOutline,
  IoReceiptOutline,
  IoNotificationsOutline,
  IoEyeOutline,
  IoEyeOffOutline,
  IoLockClosed,
  IoPerson
} from "react-icons/io5";

export default function ProfilePage() {
  const { user, signOut, loading, linkGoogle } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    displayName: user?.name || user?.fullName || ''
  });

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8f2d5] via-[#f5f0c8] to-[#f1eeb8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3c7660] mx-auto mb-4"></div>
          <p className="text-[#3c7660]">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, show sign-in prompt
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8f2d5] via-[#f5f0c8] to-[#f1eeb8]">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#3c7660] mb-4">Your Profile</h1>
            <p className="text-[#4d987b] text-lg">Manage your account and preferences</p>
          </div>

          {/* Sign In Prompt */}
          <div className="max-w-md mx-auto">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border border-white/50">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-[#3c7660]/10 rounded-full mb-4">
                    <IoLockClosed className="w-8 h-8 text-[#3c7660]" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#3c7660] mb-2">Sign In Required</h2>
                  <p className="text-[#4d987b]">Sign in to access your profile and account settings</p>
                </div>

                <div className="space-y-4">
                  <Link href="/auth/signin">
                    <Button className="w-full bg-[#3c7660] hover:bg-[#2d5a48] text-white py-3 text-lg">
                      Sign In to View Profile
                    </Button>
                  </Link>
                  
                  <p className="text-sm text-[#4d987b]">
                    Don't have an account?{" "}
                    <Link href="/auth/signup" className="text-[#3c7660] hover:underline font-medium">
                      Sign up for free
                    </Link>
                  </p>
                </div>

                {/* Features Preview */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <p className="text-sm font-medium text-[#3c7660] mb-4">What you can do with a profile:</p>
                  <div className="space-y-2 text-sm text-[#4d987b]">
                    <div className="flex items-center justify-center space-x-2">
                      <IoPerson className="w-4 h-4 text-[#f2cc6c]" />
                      <span>Personalize your experience</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <IoSettingsOutline className="w-4 h-4 text-[#f2cc6c]" />
                      <span>Manage account settings</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <IoStar className="w-4 h-4 text-[#f2cc6c]" />
                      <span>Track subscription and usage</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

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

  const handleCancel = () => {
    setFormData({
      fullName: user?.fullName || '',
      email: user?.email || '',
      displayName: user?.name || user?.fullName || ''
    });
    setIsEditing(false);
  };

  const getSubscriptionBadgeColor = (tier: string) => {
    switch (tier) {
      case 'pro': return 'bg-[#f2cc6c] text-[#3c7660]';
      case 'explorer': return 'bg-[#4d987b] text-white';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Authenticated user - show full profile interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f2d5] via-[#f5f0c8] to-[#f1eeb8]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#3c7660] mb-2">Profile</h1>
            <p className="text-[#4d987b]">Manage your account and preferences</p>
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => setShowSignOutConfirm(true)}
            className="border-[#f2cc6c] text-[#3c7660] hover:bg-[#f2cc6c]/10"
          >
            <IoLogOutOutline className="w-5 h-5 mr-2" />
            Sign Out
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Card */}
          <div className="md:col-span-2">
            <Card className="bg-white/90 backdrop-blur-sm border border-white/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#3c7660]">Personal Information</CardTitle>
                  {!isEditing ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsEditing(true)}
                      className="border-[#f2cc6c] text-[#3c7660] hover:bg-[#f2cc6c]/10"
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleCancel}
                        className="border-gray-300"
                      >
                        Cancel
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={handleSave}
                        className="bg-[#3c7660] hover:bg-[#2d5a48] text-white"
                      >
                        Save
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center space-x-4">
                  <Avatar className="w-20 h-20 border-4 border-[#f2cc6c]">
                    <AvatarImage src={(user as any)?.profilePictureUrl || ""} />
                    <AvatarFallback className="bg-[#3c7660] text-white text-xl">
                      {user.fullName?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold text-[#3c7660]">{user.fullName || user.name}</h3>
                    <p className="text-[#4d987b]">{user.email}</p>
                    <Badge className={`mt-2 ${getSubscriptionBadgeColor(user.subscriptionTier)}`}>
                      <IoStar className="w-3 h-3 mr-1" />
                      {user.subscriptionTier.charAt(0).toUpperCase() + user.subscriptionTier.slice(1)} Member
                    </Badge>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#3c7660] mb-2">Full Name</label>
                    {isEditing ? (
                      <Input
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        className="border-[#f2cc6c] focus:border-[#3c7660]"
                      />
                    ) : (
                      <p className="text-[#4d987b] py-2">{user.fullName || 'Not set'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#3c7660] mb-2">Email</label>
                    <p className="text-[#4d987b] py-2">{user.email}</p>
                    <p className="text-xs text-[#4d987b] mt-1">Contact support to change your email address</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#3c7660] mb-2">Display Name</label>
                    {isEditing ? (
                      <Input
                        value={formData.displayName}
                        onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                        className="border-[#f2cc6c] focus:border-[#3c7660]"
                      />
                    ) : (
                      <p className="text-[#4d987b] py-2">{user.name || user.fullName || 'Not set'}</p>
                    )}
                  </div>

                  {/* Connect Google */}
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      className="border-[#f2cc6c] text-[#3c7660] hover:bg-[#f2cc6c]/10"
                      onClick={async () => {
                        await linkGoogle();
                      }}
                    >
                      Connect Google
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Subscription & Usage Card */}
          <div className="space-y-6">
            <Card className="bg-white/90 backdrop-blur-sm border border-white/50">
              <CardHeader>
                <CardTitle className="text-[#3c7660] flex items-center">
                  <IoStar className="w-5 h-5 mr-2" />
                  Subscription
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <Badge className={`${getSubscriptionBadgeColor(user.subscriptionTier)} px-4 py-2 text-lg`}>
                    {user.subscriptionTier.charAt(0).toUpperCase() + user.subscriptionTier.slice(1)} Plan
                  </Badge>
                </div>

                {/* Usage Stats */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#4d987b]">Generations Used</span>
                      <span className="text-[#3c7660] font-medium">
                        {user.generationsUsed} / {user.subscriptionTier === 'free' ? user.generationsLimit : '∞'}
                      </span>
                    </div>
                    {user.subscriptionTier === 'free' && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-[#3c7660] h-2 rounded-full" 
                          style={{ width: `${(user.generationsUsed / user.generationsLimit) * 100}%` }}
                        ></div>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#4d987b]">Edits Used</span>
                      <span className="text-[#3c7660] font-medium">
                        {user.editsUsed} / {user.subscriptionTier === 'free' ? user.editsLimit : '∞'}
                      </span>
                    </div>
                    {user.subscriptionTier === 'free' && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-[#f2cc6c] h-2 rounded-full" 
                          style={{ width: `${(user.editsUsed / user.editsLimit) * 100}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>

                {user.subscriptionTier === 'free' && (
                  <Button className="w-full bg-[#f2cc6c] hover:bg-[#e6b85c] text-[#3c7660] font-medium">
                    <IoStar className="w-4 h-4 mr-2" />
                    Upgrade Plan
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/90 backdrop-blur-sm border border-white/50">
              <CardHeader>
                <CardTitle className="text-[#3c7660]">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/curate">
                  <Button variant="outline" className="w-full justify-start border-[#f2cc6c] text-[#3c7660] hover:bg-[#f2cc6c]/10">
                    <IoPersonOutline className="w-4 h-4 mr-2" />
                    Create Adventure
                  </Button>
                </Link>
                <Link href="/plans">
                  <Button variant="outline" className="w-full justify-start border-[#f2cc6c] text-[#3c7660] hover:bg-[#f2cc6c]/10">
                    <IoCalendarOutline className="w-4 h-4 mr-2" />
                    View Plans
                  </Button>
                </Link>
                <Link href="/settings/privacy">
                  <Button variant="outline" className="w-full justify-start border-[#f2cc6c] text-[#3c7660] hover:bg-[#f2cc6c]/10">
                    <IoSettingsOutline className="w-4 h-4 mr-2" />
                    Privacy & Security
                  </Button>
                </Link>
                <Link href="/auth/forgot-password">
                  <Button variant="outline" className="w-full justify-start border-[#f2cc6c] text-[#3c7660] hover:bg-[#f2cc6c]/10">
                    <IoLockClosedOutline className="w-4 h-4 mr-2" />
                    Reset Password
                  </Button>
                </Link>
                <Link href="/settings/preferences">
                  <Button variant="outline" className="w-full justify-start border-[#f2cc6c] text-[#3c7660] hover:bg-[#f2cc6c]/10">
                    <IoNotificationsOutline className="w-4 h-4 mr-2" />
                    Preferences
                  </Button>
                </Link>
                <Link href="/settings/help">
                  <Button variant="outline" className="w-full justify-start border-[#f2cc6c] text-[#3c7660] hover:bg-[#f2cc6c]/10">
                    Help & Support
                  </Button>
                </Link>
                <div className="flex items-center justify-between text-sm text-[#4d987b] pt-2">
                  <Link href="/legal/privacy" className="hover:text-[#3c7660]">Privacy</Link>
                  <Link href="/legal/terms" className="hover:text-[#3c7660]">Terms</Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sign Out Confirmation Modal */}
        {showSignOutConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <Card className="bg-white/95 backdrop-blur-sm border border-white/50 max-w-md mx-4">
              <CardContent className="p-6 text-center">
                <div className="mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-3">
                    <IoLogOutOutline className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#3c7660] mb-2">Sign Out?</h3>
                  <p className="text-[#4d987b]">Are you sure you want to sign out of your account?</p>
                </div>
                <div className="flex space-x-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowSignOutConfirm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSignOut}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
