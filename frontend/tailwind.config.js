/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}", 
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Base UI colors
        background: {
          light: '#FFFFFF',  // Pure white for light mode base
          dark: '#121212',   // Standard dark gray for dark mode
          subtle: '#F8F8F8', // Subtle off-white for secondary areas
        },
        // Motion brand colors as accents
        brand: {
          sage: '#3c7660',
          gold: '#f2cc6c',
          cream: '#f8f2d5',
          light: '#f6dc9b',
          teal: '#4d987b',
          // Dark mode variants
          'sage-dark': '#2a5245',
          'teal-dark': '#3a7361',
        },
        // Text colors
        text: {
          primary: '#333333',    // Main text color (dark gray)
          secondary: '#666666',  // Secondary text
          light: '#FFFFFF',      // Light text for dark backgrounds
        }
      }
    },
  },
  plugins: [],
}