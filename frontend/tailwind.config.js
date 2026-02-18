/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-black': '#0a0a0a',
        'carbon': {
          dark: '#121212',
          medium: '#1a1a1a',
          light: '#2a2a2a',
        },
        'metal': {
          dark: '#3a3a3a',
          light: '#4a4a4a',
        },
        'accent': {
          red: '#ff3333',
          blue: '#00a8ff',
          green: '#00ff88',
          purple: '#9945ff',
          cyan: '#00ffff',
        },
        'text': {
          primary: '#ffffff',
          secondary: '#b0b0b0',
          dim: '#808080',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient': 'gradient 4s ease-in-out infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { opacity: 0.2 },
          '50%': { opacity: 0.3 },
        },
      },
    },
  },
  plugins: [],
}