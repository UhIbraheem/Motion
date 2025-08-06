"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePathname } from 'next/navigation';
import { 
  IoMenu,
  IoPersonOutline,
  IoSettingsOutline,
  IoShieldOutline,
  IoHelpOutline,
  IoLogOutOutline,
  IoLogInOutline,
  IoAddOutline,
  IoCalendarOutline,
  IoSearch,
  IoFilter,
  IoRestaurant,
  IoCamera,
  IoWalk,
  IoWine,
  IoLeaf,
  IoChevronUp,
  IoAdd
} from 'react-icons/io5';

const categories = [
  { name: "Foodie", icon: IoRestaurant, color: "text-orange-600" },
  { name: "Nature", icon: IoLeaf, color: "text-green-600" },
  { name: "Culture", icon: IoCamera, color: "text-purple-600" },
  { name: "Romance", icon: IoWine, color: "text-pink-600" },
  { name: "Adventure", icon: IoWalk, color: "text-blue-600" },
  { name: "Nightlife", icon: IoWine, color: "text-indigo-600" },
  { name: "Shopping", icon: IoCamera, color: "text-yellow-600" },
  { name: "Wellness", icon: IoLeaf, color: "text-teal-600" },
];

export default function Navigation() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAllFilters, setShowAllFilters] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { 
      name: 'Discover', 
      href: '/',
      active: pathname === '/'
    },
    { 
      name: 'Create', 
      href: '/create',
      active: pathname === '/create'
    },
    { 
      name: 'Plans', 
      href: '/plans',
      active: pathname === '/plans'
    }
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100' 
        : 'bg-white shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Airbnb Style */}
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="relative w-8 h-8">
              <Image
                src="/logo-swirl.svg"
                alt="Motion"
                width={32}
                height={32}
                className="w-full h-full"
              />
            </div>
            <span className="text-xl font-bold text-[#3c7660] hidden sm:block">Motion</span>
          </Link>

          {/* Center Navigation - Airbnb Style */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    item.active
                      ? 'text-[#3c7660] bg-[#3c7660]/5 font-semibold'
                      : 'text-gray-700 hover:text-[#3c7660] hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                </Link>
            ))}
          </div>

          {/* Right Side Menu - Airbnb Style */}
          <div className="flex items-center space-x-4">
            {/* User Menu - Airbnb Style */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 px-3 py-2 rounded-full border border-gray-300 hover:shadow-md transition-all duration-200 bg-white"
                >
                  <IoMenu className="w-4 h-4 text-gray-600" />
                  {user ? (
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={user.profilePictureUrl || (user as any).user_metadata?.avatar_url || (user as any).user_metadata?.picture} />
                      <AvatarFallback className="bg-[#3c7660] text-white text-xs font-medium">
                        {(user.name || user.fullName || user.email)?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                      <IoPersonOutline className="w-4 h-4 text-white" />
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-56 mt-2 bg-white border border-gray-200 shadow-xl rounded-xl p-2"
              >
                {user ? (
                  <>
                    <DropdownMenuLabel className="px-3 py-2 text-sm">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {user.name || user.fullName || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="my-2" />
                    <DropdownMenuGroup>
                      <Link href="/profile">
                        <DropdownMenuItem className="cursor-pointer px-3 py-2 hover:bg-gray-50 rounded-lg mx-1">
                          <IoPersonOutline className="w-5 h-5 mr-3 text-gray-600" />
                          <span className="font-medium">Profile</span>
                        </DropdownMenuItem>
                      </Link>
                      <Link href="/plans">
                        <DropdownMenuItem className="cursor-pointer px-3 py-2 hover:bg-gray-50 rounded-lg mx-1">
                          <IoCalendarOutline className="w-5 h-5 mr-3 text-gray-600" />
                          <span className="font-medium">My Plans</span>
                        </DropdownMenuItem>
                      </Link>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator className="my-2" />
                    <DropdownMenuGroup>
                      <DropdownMenuItem className="cursor-pointer px-3 py-2 hover:bg-gray-50 rounded-lg mx-1">
                        <IoSettingsOutline className="w-5 h-5 mr-3 text-gray-600" />
                        <span className="font-medium">Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer px-3 py-2 hover:bg-gray-50 rounded-lg mx-1">
                        <IoShieldOutline className="w-5 h-5 mr-3 text-gray-600" />
                        <span className="font-medium">Privacy</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer px-3 py-2 hover:bg-gray-50 rounded-lg mx-1">
                        <IoHelpOutline className="w-5 h-5 mr-3 text-gray-600" />
                        <span className="font-medium">Help & Support</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator className="my-2" />
                    <DropdownMenuItem 
                      onClick={handleSignOut}
                      className="cursor-pointer px-3 py-2 hover:bg-red-50 rounded-lg mx-1 text-red-600"
                    >
                      <IoLogOutOutline className="w-5 h-5 mr-3" />
                      <span className="font-medium">Sign Out</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuGroup>
                      <Link href="/auth/signin">
                        <DropdownMenuItem className="cursor-pointer px-3 py-2 hover:bg-gray-50 rounded-lg mx-1">
                          <IoLogInOutline className="w-5 h-5 mr-3 text-gray-600" />
                          <span className="font-medium">Sign In</span>
                        </DropdownMenuItem>
                      </Link>
                      <Link href="/auth/signup">
                        <DropdownMenuItem className="cursor-pointer px-3 py-2 hover:bg-gray-50 rounded-lg mx-1 font-semibold">
                          <IoPersonOutline className="w-5 h-5 mr-3 text-gray-600" />
                          <span className="font-semibold">Sign Up</span>
                        </DropdownMenuItem>
                      </Link>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator className="my-2" />
                    <DropdownMenuGroup>
                      <DropdownMenuItem className="cursor-pointer px-3 py-2 hover:bg-gray-50 rounded-lg mx-1">
                        <IoHelpOutline className="w-5 h-5 mr-3 text-gray-600" />
                        <span className="font-medium">Help & Support</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Search Bar and Filters - Collapsible on scroll */}
        <div className={`border-t border-gray-100 transition-all duration-300 ${
          isScrolled ? 'py-2' : 'py-4'
        }`}>
          {/* Search Bar - Always visible */}
          <div className="mb-3">
            <div className="relative max-w-md mx-auto">
              <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search adventures..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full rounded-full border-gray-300 focus:border-[#3c7660] focus:ring-[#3c7660]"
              />
            </div>
          </div>

          {/* Categories Filter - Collapsible */}
          {!isScrolled && (
            <div className="relative">
              <div className="flex items-center justify-center">
                <div className="flex items-center space-x-4 overflow-x-auto scrollbar-hide pb-2">
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {categories.slice(0, showAllFilters ? categories.length : 6).map((category) => (
                      <Button
                        key={category.name}
                        variant={selectedCategory === category.name ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(
                          selectedCategory === category.name ? null : category.name
                        )}
                        className={`flex items-center space-x-2 whitespace-nowrap transition-all duration-200 ${
                          selectedCategory === category.name 
                            ? 'bg-[#3c7660] text-white border-[#3c7660] hover:bg-[#2d5a48]' 
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                        }`}
                      >
                        <category.icon className={`w-4 h-4 ${
                          selectedCategory === category.name ? 'text-white' : category.color
                        }`} />
                        <span className="font-medium">{category.name}</span>
                      </Button>
                    ))}
                    
                    {categories.length > 6 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAllFilters(!showAllFilters)}
                        className="flex items-center space-x-2 whitespace-nowrap bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      >
                        <IoFilter className="w-4 h-4 text-gray-600" />
                        <span className="font-medium">
                          {showAllFilters ? 'Show Less' : 'More Filters'}
                        </span>
                        <IoChevronUp className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
                          showAllFilters ? 'rotate-180' : ''
                        }`} />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-100 py-2">
          <div className="flex justify-around">
            {navItems.map((item) => {              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-200 ${
                    item.active
                      ? 'text-[#3c7660] bg-[#3c7660]/5'
                      : 'text-gray-600 hover:text-[#3c7660]'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
