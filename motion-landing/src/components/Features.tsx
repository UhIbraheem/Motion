export default function Features() {
  const features = [
    {
      icon: '🤖',
      title: 'AI-Powered Flow',
      description: 'Our intelligent AI learns your rhythm and suggests personalized adventures that align with your energy and preferences.'
    },
    {
      icon: '📍',
      title: 'Real-Time Discovery',
      description: 'Access live information about venues, events, and activities happening in your area right now.'
    },
    {
      icon: '🎯',
      title: 'Smart Filtering',
      description: 'Filter by dietary needs, ambiance, prayer times, budget, and vibe to find experiences that truly resonate.'
    },
    {
      icon: '🌊',
      title: 'Community Flow',
      description: 'Learn from fellow explorers and contribute to a mindful community of local adventure seekers.'
    },
    {
      icon: '📱',
      title: 'Seamless Booking',
      description: 'Reserve tables, book activities, and plan your entire journey without leaving the app.'
    },
    {
      icon: '🌙',
      title: 'Mood-Based Magic',
      description: 'Whether you\'re seeking tranquility or excitement, Motion adapts to your current energy.'
    }
  ];

  return (
    <section id="features" className="py-20 bg-[var(--section-light)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-brand-sage dark:text-brand-gold mb-4 transition-colors duration-500">
            Everything you need to flow with your city
          </h2>
          <p className="text-xl text-brand-teal max-w-3xl mx-auto">
            Motion combines mindful AI with real-time local wisdom to create the perfect adventure planning experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-[var(--card-bg)] p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-brand-light/50"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-brand-sage dark:text-brand-gold mb-3 transition-colors duration-500">
                {feature.title}
              </h3>
              <p className="text-brand-teal leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}