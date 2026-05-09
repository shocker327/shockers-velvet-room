/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        velvet: {
          dark: '#0a0010',
          mid: '#1a0030',
          light: '#2a0050',
          gold: '#d4af37',
        },
      },
      fontFamily: {
        heading: ['"Cormorant Garamond"', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
