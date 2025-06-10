export default function About() {
  return (
    <section id="about" className="py-20 bg-[var(--section-alt)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-sage dark:text-brand-gold mb-6 transition-colors duration-500">
              Your mindful adventure companion
            </h2>
            <div className="space-y-6 text-lg text-brand-teal">
              <p>
                Motion harmonizes cutting-edge AI with the natural rhythm of local discovery. 
                We create personalized adventure flows that honor your preferences, energy, and the moment you&apos;re in.
              </p>
              <p>
                Whether you&apos;re seeking a peaceful coffee sanctuary for deep work, an energizing evening with friends, 
                or a mindful family experience, Motion flows with your intentions and the community&apos;s wisdom 
                to suggest meaningful connections every time.
              </p>
              <p>
                From dietary preferences to energy levels, sacred times to budget consciousness – 
                Motion holds space for every aspect of your authentic self while crafting your perfect adventure.
              </p>
            </div>
            
            <div className="mt-8 grid grid-cols-2 gap-6">
              <div className="text-center p-4 bg-[var(--card-bg)] rounded-xl border border-brand-light shadow-sm">
                <div className="text-3xl font-bold text-brand-gold">AI</div>
                <div className="text-sm text-brand-sage font-medium">Mindful Intelligence</div>
              </div>
              <div className="text-center p-4 bg-white/50 rounded-xl border border-brand-light">
                <div className="text-3xl font-bold text-brand-teal">Flow</div>
                <div className="text-sm text-brand-sage font-medium">Real-time Harmony</div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            {/* App mockup with your brand colors */}
            <div className="bg-gradient-to-br from-brand-light to-brand-gold rounded-3xl p-8 shadow-2xl">
              <div className="bg-[var(--card-bg)] rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-semibold text-brand-sage">Motion Flow Preview</div>
                  <div className="w-3 h-3 bg-brand-gold rounded-full"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-brand-cream rounded w-3/4"></div>
                  <div className="h-4 bg-brand-cream rounded w-1/2"></div>
                  <div className="h-32 bg-gradient-to-r from-brand-light to-brand-gold/50 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🌊</span>
                  </div>
                  <div className="h-4 bg-brand-cream rounded w-2/3"></div>
                </div>
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-brand-teal rounded-full flex items-center justify-center text-white text-2xl shadow-lg">
              🎯
            </div>
            <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-brand-gold rounded-full flex items-center justify-center text-brand-sage text-xl shadow-lg">
              ✨
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}