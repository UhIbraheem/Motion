export default function Footer() {
  return (
    <footer className="bg-brand-sage text-brand-cream py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-brand-gold rounded-full flex items-center justify-center">
                <span className="text-brand-sage text-sm">🌊</span>
              </div>
              <div className="text-2xl font-bold text-brand-gold">
                Motion
              </div>
            </div>
            <p className="text-brand-cream/80 mb-6 max-w-md">
              Your mindful AI guide for discovering curated local adventures. 
              Life flows beautifully when you&apos;re in harmony with your surroundings.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-brand-cream/60 hover:text-brand-gold transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="text-brand-cream/60 hover:text-brand-gold transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                </svg>
              </a>
              <a href="#" className="text-brand-cream/60 hover:text-brand-gold transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.2 0C5.5 0 0 5.5 0 12.2s5.5 12.2 12.2 12.2 12.2-5.5 12.2-12.2S18.9 0 12.2 0zM9.9 17.1c-3.4 0-6.2-2.8-6.2-6.2s2.8-6.2 6.2-6.2c1.7 0 3.1.6 4.2 1.6l-1.7 1.7c-.7-.7-1.6-1-2.5-1-2.2 0-3.9 1.8-3.9 3.9s1.7 3.9 3.9 3.9c2.5 0 3.4-1.8 3.5-2.7h-3.5v-2.3h6.1c.1.3.1.7.1 1.1 0 3.8-2.5 6.2-6.1 6.2z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-brand-gold">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#about" className="text-brand-cream/80 hover:text-brand-gold transition-colors">About</a></li>
              <li><a href="#features" className="text-brand-cream/80 hover:text-brand-gold transition-colors">Features</a></li>
              <li><a href="#contact" className="text-brand-cream/80 hover:text-brand-gold transition-colors">Contact</a></li>
              <li><a href="#" className="text-brand-cream/80 hover:text-brand-gold transition-colors">Blog</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-brand-gold">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-brand-cream/80 hover:text-brand-gold transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-brand-cream/80 hover:text-brand-gold transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-brand-cream/80 hover:text-brand-gold transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="text-brand-cream/80 hover:text-brand-gold transition-colors">Support</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-brand-teal mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-brand-cream/60 text-sm">
            © 2024 Motion. All rights reserved.
          </p>
          <p className="text-brand-cream/60 text-sm mt-2 sm:mt-0 flex items-center">
            Made with <span className="text-brand-gold mx-1">🌊</span> for mindful explorers
          </p>
        </div>
      </div>
    </footer>
  );
}