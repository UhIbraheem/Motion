'use client';

import { useState } from 'react';

export default function CTA() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would integrate with your email service (Mailchimp, ConvertKit, etc.)
    console.log('Email submitted:', email);
    setIsSubmitted(true);
    setEmail('');
    
    // Reset after 3 seconds
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  return (
    <section id="contact" className="py-20 bg-gradient-to-r from-brand-sage to-brand-teal">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-brand-cream mb-6">
          Ready to flow with your city like never before?
        </h2>
        <p className="text-xl text-brand-cream/80 mb-12 max-w-2xl mx-auto">
          Join our mindful community to be among the first to experience Motion when we launch. 
          Get exclusive early access and help us shape the future of conscious local discovery.
        </p>

        {isSubmitted ? (
          <div className="bg-brand-cream/10 backdrop-blur-md rounded-2xl p-8 max-w-md mx-auto border border-brand-cream/20">
            <div className="text-4xl mb-4">🌊</div>
            <h3 className="text-xl font-semibold text-brand-cream mb-2">You&apos;re in the flow!</h3>
            <p className="text-brand-cream/80">We&apos;ll notify you when Motion launches.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-full text-brand-sage placeholder-brand-teal/60 focus:outline-none focus:ring-2 focus:ring-brand-gold/50 bg-brand-cream"
                required
              />
              <button
                type="submit"
                className="px-8 py-4 bg-brand-gold text-brand-sage rounded-full font-semibold hover:bg-brand-light transition-colors duration-300 whitespace-nowrap shadow-lg hover:shadow-xl"
              >
                Join the Flow
              </button>
            </div>
            <p className="text-brand-cream/70 text-sm mt-4">
              No spam, ever. Unsubscribe anytime.
            </p>
          </form>
        )}

        <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-brand-cream/80">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-brand-gold rounded-full"></span>
            Free to join
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-brand-light rounded-full"></span>
            Beta launching soon
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-brand-cream rounded-full"></span>
            Early access perks
          </div>
        </div>
      </div>
    </section>
  );
}