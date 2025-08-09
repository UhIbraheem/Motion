'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import {
  IoSettings,
  IoNotifications,
  IoMoon,
  IoSunny,
  IoLanguage,
  IoLocation,
  IoCard,
  IoShield,
  IoHelp,
  IoLogOut,
  IoClose,
  IoPerson,
  IoPlanet
} from 'react-icons/io5';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <IoSettings className="w-6 h-6 text-[#3c7660]" />
            Settings
          </DialogTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onClose}
            className="rounded-full"
          >
            <IoClose className="w-5 h-5" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          {/* Account Section */}
          {user && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <IoPerson className="w-5 h-5 text-[#3c7660]" />
                  Account
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{user.email}</p>
                    <p className="text-sm text-gray-500">Signed in</p>
                  </div>
                  <Badge variant="secondary">Free Plan</Badge>
                </div>
                <Separator />
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={handleLogout}
                  className="w-full"
                >
                  <IoLogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <IoPlanet className="w-5 h-5 text-[#3c7660]" />
                Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <IoNotifications className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-gray-500">Get notified about new adventures</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <IoLocation className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Location Services</p>
                    <p className="text-sm text-gray-500">Better recommendations near you</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <IoMoon className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Dark Mode</p>
                    <p className="text-sm text-gray-500">Switch to dark theme</p>
                  </div>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <IoShield className="w-5 h-5 text-[#3c7660]" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="ghost" className="w-full justify-start">
                <IoCard className="w-4 h-4 mr-2" />
                Payment Methods
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <IoShield className="w-4 h-4 mr-2" />
                Privacy Settings
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <IoHelp className="w-4 h-4 mr-2" />
                Help & Support
              </Button>
            </CardContent>
          </Card>

          {/* App Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-sm text-gray-500">
                <p>Motion v1.0.0</p>
                <p>© 2025 Motion. All rights reserved.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
