/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f1f8f8',
          100: '#dceff0',
          500: '#0b6e6e',
          600: '#095c5c',
          700: '#074848'
        },
        accent: '#f59e0b'
      },
      boxShadow: {
        soft: '0 10px 35px -20px rgba(11, 110, 110, 0.55)'
      }
    }
  },
  plugins: []
}
