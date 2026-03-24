/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0b0f14',
        surface: '#111821',
        'surface-alt': '#1a1f27',
        accent: '#00ff41',
        'accent-dark': '#00cc33',
        'accent-light': '#33ff66',
        border: '#1f2937',
        nvidia: {
          green: '#76B900',
          accent: '#00ff9c',
          bg: '#1a1a1a',
          panel: '#2b2b2b',
          'panel-light': '#353535',
          text: '#e6e6e6',
          muted: '#999999',
          border: '#3a3a3a',
          danger: '#ff4d4d',
          warning: '#ffaa00',
          success: '#76B900',
        },
        text: {
          primary: '#ffffff',
          secondary: '#a1a5b0',
          tertiary: '#6b7280',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(118, 185, 0, 0.3)',
        'glow-lg': '0 0 40px rgba(118, 185, 0, 0.2)',
        'inner-glow': 'inset 0 0 20px rgba(118, 185, 0, 0.1)',
      },
      animation: {
        'fan-spin': 'fan-spin 2s linear infinite',
        'fan-spin-reverse': 'fan-spin-reverse 2s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
        'chevron-nudge': 'chevron-nudge 1.5s ease-in-out infinite',
        'ring-expand': 'ring-expand 2.5s ease-out infinite',
        'text-flicker': 'text-flicker 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'fan-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'fan-spin-reverse': {
          '0%': { transform: 'rotate(360deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 8px rgba(118, 185, 0, 0.4)' },
          '50%': { opacity: '0.7', boxShadow: '0 0 20px rgba(118, 185, 0, 0.8)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'bounce-gentle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'chevron-nudge': {
          '0%, 100%': { transform: 'translateX(0)', opacity: '0.5' },
          '50%': { transform: 'translateX(4px)', opacity: '1' },
        },
        'ring-expand': {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
        'text-flicker': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}
