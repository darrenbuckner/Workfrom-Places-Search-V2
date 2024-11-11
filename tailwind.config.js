/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        wave: {
          '0%': { transform: 'rotate(0deg)' },
          '20%': { transform: 'rotate(14deg)' },
          '40%': { transform: 'rotate(-8deg)' },
          '60%': { transform: 'rotate(14deg)' },
          '80%': { transform: 'rotate(-4deg)' },
          '100%': { transform: 'rotate(10deg)' }
        },
        fadeIn: {
          'from': {
            opacity: '0',
            transform: 'translateY(-10px)'
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        'loading-shimmer': {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' }
        }
      },
      animation: {
        wave: 'wave 1.5s ease-in-out',
        fadeIn: 'fadeIn 0.5s ease-out forwards',
        'loading-shimmer': 'loading-shimmer 3s ease-in-out infinite'
      }
    }
  },
  plugins: [],
}