// motion-landing/src/components/Navbar.tsx - Fixed Dark Mode
'use client';

import { useState, useEffect } from 'react';
import MotionLogo from './MotionLogo';
import DarkModeToggle from './DarkModeToggle';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-brand-cream/90 dark:bg-brand-sage-dark/90 backdrop-blur-md shadow-lg border-b border-brand-light dark:border-brand-teal' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <MotionLogo size="sm" variant="full" theme="light" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#about" className="text-brand-sage dark:text-brand-cream hover:text-brand-teal dark:hover:text-brand-gold transition-colors font-medium">
              About
            </a>
            <a href="#features" className="text-brand-sage dark:text-brand-cream hover:text-brand-teal dark:hover:text-brand-gold transition-colors font-medium">
              Features
            </a>
            <a href="#contact" className="text-brand-sage dark:text-brand-cream hover:text-brand-teal dark:hover:text-brand-gold transition-colors font-medium">
              Contact
            </a>
            <DarkModeToggle />
            <button className="bg-brand-gold hover:bg-brand-light text-brand-sage px-6 py-2 rounded-full transition-all duration-300 font-semibold shadow-md hover:shadow-lg">
              Get Early Access
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <DarkModeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-brand-sage dark:text-brand-cream hover:text-brand-teal dark:hover:text-brand-gold transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-brand-cream dark:bg-brand-sage-dark border-t border-brand-light dark:border-brand-teal">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#about" className="block px-3 py-2 text-brand-sage dark:text-brand-cream hover:text-brand-teal dark:hover:text-brand-gold font-medium">About</a>
              <a href="#features" className="block px-3 py-2 text-brand-sage dark:text-brand-cream hover:text-brand-teal dark:hover:text-brand-gold font-medium">Features</a>
              <a href="#contact" className="block px-3 py-2 text-brand-sage dark:text-brand-cream hover:text-brand-teal dark:hover:text-brand-gold font-medium">Contact</a>
              <button className="w-full text-left px-3 py-2 bg-brand-gold hover:bg-brand-light text-brand-sage rounded-lg font-semibold transition-colors">
                Get Early Access
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}