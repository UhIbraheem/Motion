"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  IoAddOutline
} from 'react-icons/io5';

export default function AirbnbNavigation() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

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
      active: pathname === '/plans',
      requiresAuth: true
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
        ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100' 
        : 'bg-white'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative w-8 h-8">
              <Image
                src="/logo-swirl.svg"
                alt="Motion"
                width={32}
                height={32}
                className="w-full h-full"
              />
            </div>
            <span className="text-xl font-bold text-[#3c7660]">Motion</span>
          </Link>

          {/* Center Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              // Hide auth-required items if user not logged in
              if (item.requiresAuth && !user) return null;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    item.active
                      ? 'text-[#3c7660] bg-[#3c7660]/5'
                      : 'text-gray-700 hover:text-[#3c7660] hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Right Side Menu */}
          <div className="flex items-center space-x-4">
            {/* Create Button (visible only when logged in) */}
            {user && (
              <Link href="/create" className="hidden sm:block">
                <Button 
                  size="sm" 
                  className="bg-[#3c7660] hover:bg-[#2d5a48] text-white rounded-full px-4 py-2 text-sm font-medium shadow-sm"
                >
                  <IoAddOutline className="w-4 h-4 mr-1" />
                  Create
                </Button>
              </Link>
            )}

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 px-3 py-2 rounded-full border border-gray-200 hover:shadow-md transition-shadow duration-200"
                >
                  <IoMenu className="w-4 h-4 text-gray-600" />
                  {user ? (
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={(user as any).user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-[#3c7660] text-white text-xs">
                        {(user as any).user_metadata?.full_name?.charAt(0) || 
                         user.email?.charAt(0).toUpperCase()}
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
                className="w-56 mt-2 bg-white border border-gray-200 shadow-lg rounded-xl"
              >
                {user ? (
                  <>
                    <DropdownMenuLabel className="px-3 py-2">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium text-gray-900">
                          {(user as any).user_metadata?.full_name || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <Link href="/profile">
                        <DropdownMenuItem className="cursor-pointer px-3 py-2 hover:bg-gray-50">
                          <IoPersonOutline className="w-4 h-4 mr-3" />
                          Profile
                        </DropdownMenuItem>
                      </Link>
                      <Link href="/plans">
                        <DropdownMenuItem className="cursor-pointer px-3 py-2 hover:bg-gray-50">
                          <IoAddOutline className="w-4 h-4 mr-3" />
                          My Plans
                        </DropdownMenuItem>
                      </Link>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem className="cursor-pointer px-3 py-2 hover:bg-gray-50">
                        <IoSettingsOutline className="w-4 h-4 mr-3" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer px-3 py-2 hover:bg-gray-50">
                        <IoShieldOutline className="w-4 h-4 mr-3" />
                        Privacy
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer px-3 py-2 hover:bg-gray-50">
                        <IoHelpOutline className="w-4 h-4 mr-3" />
                        Help & Support
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleSignOut}
                      className="cursor-pointer px-3 py-2 hover:bg-gray-50 text-red-600"
                    >
                      <IoLogOutOutline className="w-4 h-4 mr-3" />
                      Sign Out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuGroup>
                      <Link href="/auth/signin">
                        <DropdownMenuItem className="cursor-pointer px-3 py-2 hover:bg-gray-50">
                          <IoLogInOutline className="w-4 h-4 mr-3" />
                          Sign In
                        </DropdownMenuItem>
                      </Link>
                      <Link href="/auth/signup">
                        <DropdownMenuItem className="cursor-pointer px-3 py-2 hover:bg-gray-50 font-medium">
                          <IoPersonOutline className="w-4 h-4 mr-3" />
                          Sign Up
                        </DropdownMenuItem>
                      </Link>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem className="cursor-pointer px-3 py-2 hover:bg-gray-50">
                        <IoHelpOutline className="w-4 h-4 mr-3" />
                        Help & Support
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-100 py-2">
          <div className="flex justify-around">
            {navItems.map((item) => {
              if (item.requiresAuth && !user) return null;
              
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
