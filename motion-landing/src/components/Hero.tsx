// motion-landing/src/components/Hero.tsx - Bigger Logo Version
import MotionLogo from './MotionLogo';

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-cream via-brand-light to-brand-gold/30 dark:from-gray-900 dark:via-gray-800 dark:to-brand-sage-dark relative overflow-hidden">
      {/* Background decoration - removed grid.svg reference */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-gold/10 to-transparent animate-pulse"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          {/* Big Logo - Using 'hero' size for maximum impact */}
          <div className="flex justify-center mb-12">
            <div className="transform hover:scale-105 transition-transform duration-500">
              <MotionLogo size="hero" variant="icon" theme="light" />
            </div>
          </div>

          {/* Main headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-brand-sage dark:text-brand-cream leading-tight">
            Discover Life in{' '}
            <span className="text-brand-gold dark:text-brand-gold relative">
              Motion
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-brand-teal/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0,8 Q50,0 100,8" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl sm:text-2xl text-brand-teal dark:text-brand-cream/80 max-w-3xl mx-auto leading-relaxed">
            Your personal AI guide for curated local adventures. 
            Whether you&apos;re seeking serenity or excitement, 
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