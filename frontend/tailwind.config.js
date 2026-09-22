/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          400: '#a78bfa',
          500: '#8b5cf6', // Cosmic Violet
          600: '#7c3aed',
          700: '#6d28d9',
        },
        neon: {
          cyan: '#06b6d4',
          violet: '#8b5cf6',
          magenta: '#ec4899',
          pink: '#f43f5e',
        },
        dark: {
          50: '#1e293b',  // slate-800
          100: '#0f172a', // slate-900
          200: '#080d1a', // extra dark cosmic space
          300: '#030611', // cosmic void
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
      }
    },
  },
  plugins: [],
}
