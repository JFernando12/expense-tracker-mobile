/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          100: '#0A1C2E', // App background (deep navy)
          200: '#112B45', // Secondary background
          300: '#03354C', // Header/footer or elevated surfaces
        },
        secondary: {
          100: '#1F2C3A', // Transaction item background (expense)
          200: '#0D2C23', // Transaction item background (income)
          300: '#2C3E50', // Neutral/utility backgrounds (icons or containers)
        },
        accent: {
          100: '#1EEB7A', // Mint green (income highlight)
          200: '#18C06A', // Darker mint (icon backgrounds)
          300: '#A7F3D0', // Soft green (badges or backgrounds)
        },
        black: {
          DEFAULT: '#000000',
          100: '#8C8E98', // Muted subtext/icons
          200: '#666876', // Body text
          300: '#1A1B23', // Strong containers or shadows
        },
        neutral: {
          100: '#F4F4F5', // Light backgrounds
          200: '#D4D4D8', // Borders, inactive states
        },
        danger: {
          DEFAULT: '#F75555', // Expense text / warnings
          100: '#B91C1C', // Expense icon bg
        },
        success: {
          DEFAULT: '#10B981', // Net cash flow highlight
        },
      },
    },
  },
  plugins: [],
};
