/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        war: {
          50: '#fdf8f0',
          100: '#f5e8cc',
          200: '#e8c97a',
          300: '#d4a843',
          400: '#b8860b',
          500: '#8b6914',
          600: '#6b4f0f',
          700: '#4a350a',
          800: '#2e1f05',
          900: '#1a1008',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        mono: ['Courier New', 'monospace'],
      },
      backgroundImage: {
        'map-texture': "url('/textures/paper.png')",
      },
    },
  },
  plugins: [],
};
