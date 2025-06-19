/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}", 
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Motion brand colors
        brand: {
          sage: '#3c7660',
          gold: '#f2cc6c',
          cream: '#f8f2d5',
          light: '#f6dc9b',
          teal: '#4d987b',
          // Dark mode variants
          'sage-dark': '#2a5245',
          'teal-dark': '#3a7361',
        }
      }
    },
  },
  plugins: [],
}