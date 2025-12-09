/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/renderer/index.html",
    "./src/renderer/src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Soft Medical Teal Palette
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          500: '#14b8a6', // Primary Action
          600: '#0d9488',
          900: '#134e4a',
        },
        // Neutral Slate for text (Professional & Clean)
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          400: '#94a3b8',
          800: '#1e293b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)', // High-end app feel
      }
    },
  },
  plugins: [],
}