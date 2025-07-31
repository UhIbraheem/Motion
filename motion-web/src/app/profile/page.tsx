import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Settings, Crown, MapPin, Calendar, Star } from "lucide-react";

export default function ProfilePage() {
  // Mock user data
  const mockUser = {
    name: "Alex Chen",
    email: "alex@example.com",
    location: "San Francisco, CA",
    subscription: "Free",
    joinedDate: "January 2025",
    stats: {
      totalAdventures: 12,
      completedAdventures: 8,
      savedAdventures: 4
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2a5444] mb-2">Profile</h1>
          <p className="text-[#3c7660]">Manage your account and adventure preferences</p>
        </div>

        {/* Profile Overview */}
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-[#2a5444] flex items-center gap-2">
              <User className="w-6 h-6" />
              Profile Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 mb-6">
              <Avatar className="w-20 h-20">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback className="bg-[#3c7660] text-white text-2xl">
                  {mockUser.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-[#2a5444] mb-1">{mockUser.name}</h3>
                <p className="text-[#3c7660] mb-2">{mockUser.email}</p>
                <div className="flex items-center gap-2 text-sm text-[#3c7660]">
                  <MapPin className="w-4 h-4" />
                  {mockUser.location}
                </div>
              </div>
              <div className="text-right">
                <Badge className={`mb-2 ${mockUser.subscription === 'Premium' ? 'bg-[#f2cc6c]' : 'bg-[#3c7660]'} text-white`}>
                  {mockUser.subscription === 'Premium' && <Crown className="w-3 h-3 mr-1" />}
                  {mockUser.subscription} Plan
                </Badge>
                <p className="text-sm text-[#3c7660]">Joined {mockUser.joinedDate}</p>
              </div>
            </div>

            <Button variant="outline" className="border-[#3c7660] text-[#3c7660] hover:bg-[#3c7660] hover:text-white">
              Edit Profile
            </Button>
          </CardContent>
        </Card>

        {/* Adventure Stats */}
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-[#2a5444]">Adventure Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-[#f2cc6c] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-2xl font-bold text-[#2a5444] mb-1">
                  {mockUser.stats.totalAdventures}
                </h4>
                <p className="text-[#3c7660] text-sm">Total Adventures</p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-[#3c7660] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-2xl font-bold text-[#2a5444] mb-1">
                  {mockUser.stats.completedAdventures}
                </h4>
                <p className="text-[#3c7660] text-sm">Completed</p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-[#4d987b] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-2xl font-bold text-[#2a5444] mb-1">
                  {mockUser.stats.savedAdventures}
                </h4>
                <p className="text-[#3c7660] text-sm">Saved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-[#2a5444] flex items-center gap-2">
              <Settings className="w-6 h-6" />
              Account Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#2a5444] mb-2">
                  Full Name
                </label>
                <Input 
                  defaultValue={mockUser.name}
                  className="border-[#3c7660]/30 focus:border-[#f2cc6c]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2a5444] mb-2">
                  Email
                </label>
                <Input 
                  defaultValue={mockUser.email}
                  className="border-[#3c7660]/30 focus:border-[#f2cc6c]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2a5444] mb-2">
                Location
              </label>
              <Input 
                defaultValue={mockUser.location}
                className="border-[#3c7660]/30 focus:border-[#f2cc6c]"
              />
            </div>
            <Button className="bg-[#f2cc6c] hover:bg-[#e6b84a] text-white">
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Subscription */}
        {mockUser.subscription === 'Free' && (
          <Card className="bg-gradient-to-r from-[#f2cc6c]/10 to-[#3c7660]/10 border-[#f2cc6c]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-[#2a5444] mb-1">
                    Upgrade to Motion+ Premium
                  </h3>
                  <p className="text-[#3c7660]">
                    Unlock unlimited adventures and premium features
                  </p>
                </div>
                <Button className="bg-[#f2cc6c] hover:bg-[#e6b84a] text-white">
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
