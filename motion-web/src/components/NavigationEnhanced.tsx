"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { 
  IoHome, 
  IoCompass, 
  IoAdd, 
  IoCalendar, 
  IoPerson,
  IoLogOut,
  IoSettings,
  IoStatsChart,
  IoChevronBack,
  IoChevronForward,
  IoCard,
  IoShield
} from "react-icons/io5";

const navigation = [
  { name: "Discover", href: "/", icon: IoCompass, description: "Community adventures" },
  { name: "Create", href: "/create", icon: IoAdd, description: "AI adventure generator" },
  { name: "Plans", href: "/plans", icon: IoCalendar, description: "Your adventure library" },
  { name: "Profile", href: "/profile", icon: IoPerson, description: "Account & settings" },
];

const getMembershipColor = (tier: string) => {
  switch (tier) {
    case "free": return "bg-gray-500 text-white";
    case "explorer": return "bg-[#3c7660] text-white";
    case "pro": return "bg-[#f2cc6c] text-black";
    default: return "bg-gray-500 text-white";
  }
};

const getMembershipIcon = (tier: string) => {
  switch (tier) {
    case "free": return IoCompass;
    case "explorer": return IoShield;
    case "pro": return IoStatsChart;
    default: return IoCompass;
  }
};

export function Navigation() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle hydration
  React.useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Set CSS variable for main content margin
  React.useEffect(() => {
    document.documentElement.style.setProperty(
      '--sidebar-width', 
      isCollapsed ? '4rem' : '16rem'
    );
  }, [isCollapsed]);

  // Hide navigation on auth pages
  if (pathname?.startsWith('/auth')) {
    return null;
  }

  // Don't render navigation until hydrated to prevent mismatch
  if (!isHydrated) {
    return null;
  }

  const sidebarWidth = isCollapsed ? 'w-16' : 'w-64';

  return (
    <div className={`fixed left-0 top-0 h-screen ${sidebarWidth} bg-white border-r border-gray-200 transition-all duration-300 z-50 flex flex-col shadow-lg`}>
      {/* Header with Logo */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="relative w-10 h-10 rounded-full bg-[#3c7660]/20 backdrop-blur-sm flex items-center justify-center">
              <Image
                src="/logo-swirl.png"
                alt="Motion Logo"
                width={24}
                height={24}
                className="object-contain"
              />
            </div>
            <h1 className="text-xl font-bold text-[#3c7660]">Motion</h1>
          </div>
        )}
        
        {isCollapsed && (
          <div className="flex justify-center w-full">
            <div className="relative w-10 h-10 rounded-full bg-[#3c7660]/20 backdrop-blur-sm flex items-center justify-center">
              <Image
                src="/logo-swirl.png"
                alt="Motion Logo"
                width={24}
                height={24}
                className="object-contain"
              />
            </div>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 h-8 w-8"
        >
          {isCollapsed ? <IoChevronForward className="h-4 w-4" /> : <IoChevronBack className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center ${isCollapsed ? 'justify-center px-2 py-3' : 'space-x-3 px-3 py-3'} rounded-lg transition-all duration-200 group relative ${
                isActive
                  ? "bg-[#3c7660] text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100 hover:shadow-sm"
              }`}
              title={isCollapsed ? item.name : undefined}
            >
              <div className={`flex items-center justify-center ${isCollapsed ? 'w-6 h-6' : ''}`}>
                <Icon className={`h-5 w-5 flex-shrink-0 ${
                  isActive 
                    ? 'text-white' 
                    : isCollapsed 
                      ? 'text-gray-600 group-hover:text-gray-900' 
                      : ''
                }`} />
              </div>
              {!isCollapsed && <span className="font-medium">{item.name}</span>}
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="border-t border-gray-200 p-4">
        {user ? (
          <div className="space-y-3">
            {/* User Info */}
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
              {isCollapsed ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-10 w-10 p-0 rounded-full hover:bg-gray-100">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-[#3c7660] text-white">
                          {user.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 ml-2" align="start">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user.name}</p>
                      <Badge className={`text-xs ${getMembershipColor(user.subscriptionTier)} mt-1`}>
                        {user.subscriptionTier.charAt(0).toUpperCase() + user.subscriptionTier.slice(1)}
                      </Badge>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center space-x-2">
                        <IoPerson className="h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center space-x-2">
                        <IoSettings className="h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/billing" className="flex items-center space-x-2">
                        <IoCard className="h-4 w-4" />
                        <span>Billing</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="text-red-600 focus:text-red-600">
                      <IoLogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-[#3c7660] text-white">
                      {user.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                    <div className="flex items-center space-x-2">
                      <Badge className={`text-xs ${getMembershipColor(user.subscriptionTier)}`}>
                        {user.subscriptionTier.charAt(0).toUpperCase() + user.subscriptionTier.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User Actions - Only show when not collapsed */}
            {!isCollapsed && (
              <div className="space-y-1">
                <Link
                  href="/profile"
                  className="flex items-center space-x-2 px-2 py-1 text-sm text-gray-600 hover:text-gray-900 rounded"
                >
                  <IoPerson className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
                
                <Link
                  href="/settings"
                  className="flex items-center space-x-2 px-2 py-1 text-sm text-gray-600 hover:text-gray-900 rounded"
                >
                  <IoSettings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>
                
                <Link
                  href="/billing"
                  className="flex items-center space-x-2 px-2 py-1 text-sm text-gray-600 hover:text-gray-900 rounded"
                >
                  <IoCard className="h-4 w-4" />
                  <span>Billing</span>
                </Link>
                
                <button
                  onClick={signOut}
                  className="flex items-center space-x-2 px-2 py-1 text-sm text-red-600 hover:text-red-700 rounded w-full text-left"
                >
                  <IoLogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}

            {/* Collapsed User Menu */}
            {isCollapsed && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full p-0 h-auto">
                    <IoSettings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <IoPerson className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center">
                      <IoSettings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/billing" className="flex items-center">
                      <IoCard className="mr-2 h-4 w-4" />
                      Billing
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={signOut}
                    className="text-red-600 focus:text-red-600"
                  >
                    <IoLogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        ) : (
          // Guest State
          <div className={`space-y-2 ${isCollapsed ? 'text-center' : ''}`}>
            <div className={`flex items-center space-x-3 ${isCollapsed ? 'justify-center' : ''}`}>
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-gray-400 text-white">
                  G
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div>
                  <p className="text-sm font-medium text-gray-900">Guest</p>
                  <p className="text-xs text-gray-500">Not signed in</p>
                </div>
              )}
            </div>
            
            {!isCollapsed && (
              <div className="space-y-1">
                <Link
                  href="/auth/signin"
                  className="flex items-center justify-center px-3 py-2 text-sm bg-[#3c7660] text-white rounded-lg hover:bg-[#2a5444] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="flex items-center justify-center px-3 py-2 text-sm border border-[#3c7660] text-[#3c7660] rounded-lg hover:bg-[#3c7660] hover:text-white transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
