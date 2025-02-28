/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      keyframes: {
        'fade-left': {
          '0%': {
            opacity: '0',
            transform: 'translateX(-1rem)',
          },
          '100%': {
            opacity: '0',
            transform: 'translateX(1rem)',
          },
          '50%': {
            opacity: '1',
            transform: 'translateX(0)',
          }
        }
      },
      animation: {
        'fade-left': 'fade-left 0.5s ease-out',
      }
    },
  },
  plugins: [],
}
