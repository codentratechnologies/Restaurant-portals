/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: {
            400: '#FFB800', // Warm Gold
            500: '#FFA000', // Secondary Orange
            600: '#FF6B00', // Primary Orange
          },
          navy: '#031B4E',
          green: '#6DBE00',
        },
        background: '#F5F7FA',
        card: '#FFFFFF',
        text: {
          primary: '#0F172A',
          secondary: '#64748B',
        },
        border: '#E5E7EB',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'premium': '0 10px 40px -10px rgba(0,0,0,0.08), 0 2px 10px -2px rgba(0,0,0,0.04)',
        'floating': '0 20px 40px -10px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.05)',
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '24px',
        '3xl': '32px',
      }
    },
  },
  plugins: [],
}
