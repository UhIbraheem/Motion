/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Your brand colors
        brand: {
          gold: '#f2cc6c',
          sage: '#3c7660',
          cream: '#f8f2d5', 
          light: '#f6dc9b',
          teal: '#4d987b',
          // Dark mode variants
          'sage-dark': '#2a5245',
          'teal-dark': '#3a7361',
        },
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        'card-bg': 'var(--card-bg)',
        'section-light': 'var(--section-light)',
        'section-alt': 'var(--section-alt)',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}