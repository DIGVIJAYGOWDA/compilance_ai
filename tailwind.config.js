/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#1A56DB',
          dark: '#1040B0',
          light: '#EBF5FF',
        },
        navy: {
          DEFAULT: '#0D1B2A',
          light: '#162032',
        },
        success: '#16A34A',
        warning: '#F59E0B',
        danger: '#DC2626',
        neutral: '#6B7280',
        bg: '#F8FAFC',
        card: '#FFFFFF',
        border: '#E5E7EB',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan-line': 'scanLine 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'count-up': 'countUp 1s ease-out',
      },
      keyframes: {
        scanLine: {
          '0%, 100%': { top: '0%' },
          '50%': { top: '100%' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.06)',
        'card-hover': '0 8px 24px 0 rgba(0,0,0,0.12)',
        glow: '0 0 20px rgba(26,86,219,0.3)',
      },
    },
  },
  plugins: [],
};
