/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        orange: '#E85D04',
        'orange-hover': '#C44D03',
        charcoal: '#1A1A2E',
        forest: '#1E473A',
        'forest-light': '#2A5E4E',
        'gray-light': '#F5F5F5',
        'gray-mid': '#E0E0E0',
      },
      boxShadow: {
        card: '0 2px 15px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 30px rgba(0,0,0,0.12)',
        featured: '0 20px 60px rgba(232,93,4,0.2)',
      },
    },
  },
  plugins: [],
}
