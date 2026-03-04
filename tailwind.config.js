/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
        hindi: ['"Hind"', 'sans-serif'],
      },
      colors: {
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14a085',
          600: '#0D6E6E',
          700: '#0a5555',
          800: '#083f3f',
          900: '#062b2b',
          950: '#041d1d',
        },
        warm: '#F8FAFA',
        gold: {
          400: '#f6c90e',
          500: '#E8A838',
          600: '#d4922e',
        },
        dark: {
          DEFAULT: '#060d14',
          50: '#0c1a28',
          100: '#0f1f2e',
        },
      },
      boxShadow: {
        soft: '0 10px 35px -20px rgba(13,110,110,0.55)',
        glass: '0 8px 32px rgba(0,0,0,0.2)',
        'glass-hover': '0 20px 60px rgba(0,0,0,0.35), 0 0 0 1px rgba(13,110,110,0.3)',
        teal: '0 8px 30px rgba(13,110,110,0.5)',
        green: '0 6px 24px rgba(37,211,102,0.5)',
      },
      animation: {
        'pulse-ring': 'pulseRing 2.5s infinite',
        'float-y': 'floatY 5s ease-in-out infinite',
        'float-y-fast': 'floatY 3s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.7s ease both',
        'fade-in': 'fadeIn 0.5s ease both',
        'spin-slow': 'spin 0.7s linear infinite',
        'live-pulse': 'livePulse 1.5s infinite',
        'marquee-f': 'marqueeF 35s linear infinite',
        'marquee-r': 'marqueeR 40s linear infinite',
        'check-pop': 'checkPop 0.4s ease',
        'shake': 'shake 0.5s ease',
        'slide-in-right': 'slideInRight 0.3s ease both',
        'slide-out-right': 'slideOutRight 0.3s ease both',
        'aurora-1': 'ab1 14s ease-in-out infinite',
        'aurora-2': 'ab2 18s ease-in-out infinite',
        'aurora-3': 'ab3 12s ease-in-out infinite',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.36,0.07,0.19,0.97) both',
      },
      keyframes: {
        pulseRing: {
          '0%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(13,110,110,0.6)' },
          '70%': { transform: 'scale(1)', boxShadow: '0 0 0 14px rgba(13,110,110,0)' },
          '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(13,110,110,0)' },
        },
        floatY: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(36px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        livePulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        marqueeF: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        marqueeR: {
          from: { transform: 'translateX(-50%)' },
          to: { transform: 'translateX(0)' },
        },
        checkPop: {
          '0%': { transform: 'scale(0)' },
          '60%': { transform: 'scale(1.3)' },
          '100%': { transform: 'scale(1)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
        },
        slideInRight: {
          from: { transform: 'translateX(100%)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        slideOutRight: {
          from: { transform: 'translateX(0)', opacity: '1' },
          to: { transform: 'translateX(100%)', opacity: '0' },
        },
        ab1: {
          '0%, 100%': { transform: 'translate(-10%,-10%) scale(1.1) rotate(0deg)' },
          '50%': { transform: 'translate(5%,8%) scale(0.9) rotate(20deg)' },
        },
        ab2: {
          '0%, 100%': { transform: 'translate(10%,5%) scale(0.95)' },
          '50%': { transform: 'translate(-8%,-5%) scale(1.15)' },
        },
        ab3: {
          '0%, 100%': { transform: 'translate(0,10%) scale(1)' },
          '50%': { transform: 'translate(5%,-10%) scale(1.1)' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
