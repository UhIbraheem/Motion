'use client';

import { useEffect, useState } from 'react';

export default function Hero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient - inverted for dark mode */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-cream via-brand-light to-brand-cream dark:bg-gradient-to-br dark:from-brand-sage dark:via-brand-teal dark:to-brand-sage transition-all duration-700"></div>
      
      {/* Animated background elements - adjusted for dark mode */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-gold/20 dark:bg-brand-light/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand-teal/20 dark:bg-brand-gold/40 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/4 w-60 h-60 bg-brand-sage/10 dark:bg-brand-cream/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
      </div>

      <div className={`relative z-10 text-center px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${
        mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-brand-gold/20 dark:bg-brand-cream/20 text-brand-sage dark:text-brand-sage text-sm font-medium mb-8 border border-brand-gold/30 dark:border-brand-cream/30">
            🌊 Go with the Flow
          </div>

          {/* Main heading - titles in gold for dark mode */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6">
            <span className="text-brand-sage dark:text-brand-gold transition-colors duration-500">
              Discover Life in
            </span>
            <br />
            <span className="text-brand-sage dark:text-brand-gold font-extrabold transition-colors duration-500">
              Motion
            </span>
          </h1>

          {/* Subtitle - normal text in off-white for dark mode */}
          <p className="text-xl sm:text-2xl text-brand-teal dark:text-brand-cream/90 mb-12 max-w-3xl mx-auto leading-relaxed transition-colors duration-500">
            Your personal AI guide for curated local adventures. Whether you&apos;re seeking serenity or excitement, 
            Motion flows with your energy and crafts experiences around your vibe.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="group relative px-8 py-4 bg-brand-gold text-brand-sage rounded-full font-semibold hover:bg-brand-light transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
              Get Early Access
              <span className="absolute inset-0 rounded-full bg-brand-light/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </button>
            <button className="px-8 py-4 border-2 border-brand-sage dark:border-brand-cream text-brand-sage dark:text-brand-cream rounded-full font-semibold hover:bg-brand-sage hover:text-brand-cream dark:hover:bg-brand-cream dark:hover:text-brand-sage transition-all duration-300">
              Watch Demo
            </button>
          </div>

          {/* Stats or social proof */}
          <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-sm text-brand-teal dark:text-brand-cream/80">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-brand-gold dark:bg-brand-light rounded-full"></span>
              Beta launching soon
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-brand-teal dark:bg-brand-gold rounded-full"></span>
              AI-powered recommendations
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-brand-sage dark:bg-brand-cream rounded-full"></span>
              Personalized experiences
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="animate-bounce">
          <svg className="w-6 h-6 text-brand-teal dark:text-brand-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  );
}