"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function PreferencesPage() {
  const [emailOptIn, setEmailOptIn] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f2d5] via-[#f5f0c8] to-[#f1eeb8]">
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <h1 className="text-3xl font-bold text-[#3c7660] mb-6">Preferences</h1>
        <div className="space-y-6 bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-white/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#3c7660]">Email updates</h2>
              <p className="text-sm text-[#4d987b]">Get product updates and tips</p>
            </div>
            <Button variant="outline" onClick={() => setEmailOptIn(!emailOptIn)}>
              {emailOptIn ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#3c7660]">Dark mode</h2>
              <p className="text-sm text-[#4d987b]">Match system theme</p>
            </div>
            <Button variant="outline" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? 'On' : 'Off'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
