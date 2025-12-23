/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#bb3435', // Red/Burgundy
          light: '#d44a4b',
          dark: '#9a2a2b',
        },
        background: {
          DEFAULT: '#fefcfb', // Off-White/Cream
        },
        text: {
          DEFAULT: '#120e0f', // Very Dark/Black
          light: '#2a2526',
          muted: '#4a4546',
        },
        cta: {
          DEFAULT: '#bb3435', // Red/Burgundy
          light: '#d44a4b',
          dark: '#9a2a2b',
        },
      },
      // Animation definitions go here inside 'extend'
      animation: {
        fadeIn: 'fadeIn 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}