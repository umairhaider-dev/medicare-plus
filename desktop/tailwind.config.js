/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#020814',
          900: '#060b18',
          800: '#0a1628',
          700: '#0d1b38',
          600: '#112244',
          500: '#163060',
        },
        glass: {
          DEFAULT: 'rgba(13,27,62,0.6)',
          light: 'rgba(20,42,84,0.4)',
          dark: 'rgba(6,11,24,0.8)',
        },
        sky: {
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
        },
        gold: {
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
        glass: '20px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-up': 'fadeUp 0.4s ease-out',
        'scan': 'scan 2s linear infinite',
        'number-tick': 'numberTick 0.5s ease-out',
        'shimmer': 'shimmer 2s infinite',
        'rotate-slow': 'rotateSlow 20s linear infinite',
      },
      keyframes: {
        glow: {
          from: { boxShadow: '0 0 5px rgba(14,165,233,0.2), 0 0 10px rgba(14,165,233,0.1)' },
          to: { boxShadow: '0 0 20px rgba(14,165,233,0.5), 0 0 40px rgba(14,165,233,0.2)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        slideIn: {
          from: { transform: 'translateX(-20px)', opacity: 0 },
          to: { transform: 'translateX(0)', opacity: 1 },
        },
        fadeUp: {
          from: { transform: 'translateY(16px)', opacity: 0 },
          to: { transform: 'translateY(0)', opacity: 1 },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        rotateSlow: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
      },
      boxShadow: {
        glass: '0 4px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        'glass-lg': '0 8px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)',
        glow: '0 0 20px rgba(14,165,233,0.3), 0 0 40px rgba(14,165,233,0.1)',
        'glow-gold': '0 0 20px rgba(245,158,11,0.3), 0 0 40px rgba(245,158,11,0.1)',
        'glow-green': '0 0 20px rgba(16,185,129,0.3), 0 0 40px rgba(16,185,129,0.1)',
        'glow-red': '0 0 20px rgba(239,68,68,0.3), 0 0 40px rgba(239,68,68,0.1)',
        'inner-glow': 'inset 0 0 20px rgba(14,165,233,0.1)',
      },
    },
  },
  plugins: [],
}
