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
          DEFAULT: '#FFB7A5', // Coral/Peach
          light: '#FFC9BB',
          dark: '#FF9D85',
        },
        background: {
          DEFAULT: '#FFF3E8', // Warm Off-White/Cream
        },
        text: {
          DEFAULT: '#333333', // Dark Gray
          light: '#555555',
          muted: '#777777',
        },
        cta: {
          DEFAULT: '#FF6F61', // Coral/Red-Orange
          light: '#FF8A7F',
          dark: '#E85A4D',
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