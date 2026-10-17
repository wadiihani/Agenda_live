/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dynamic Theme background & text variables
        background: 'var(--bg-color)',
        midnight: '#080B12',
        'iron-grey': '#252A34',
        'infinity-white': '#F5F5F5',
        'arc-blue': '#1976D2',

        // Day 1: Civil War
        'stark-red': {
          DEFAULT: '#B71C1C',
          dark: '#8E0000',
          light: '#D32F2F',
          glow: 'rgba(183, 28, 28, 0.45)',
          surface: 'rgba(183, 28, 28, 0.15)'
        },
        'steel-grey': {
          DEFAULT: '#607D8B',
          light: '#ECEFF1',
          glow: 'rgba(96, 125, 139, 0.4)'
        },

        // Day 2: Infinity War
        'infinity-purple': {
          DEFAULT: '#6A1B9A',
          dark: '#4A0072',
          light: '#9C27B0',
          glow: 'rgba(106, 27, 154, 0.45)',
          surface: 'rgba(106, 27, 154, 0.15)'
        },
        'cosmic-blue': {
          DEFAULT: '#283593',
          dark: '#1A237E',
          light: '#3949AB',
          glow: 'rgba(40, 53, 147, 0.45)'
        },
        'energy-orange': {
          DEFAULT: '#FF6F00',
          light: '#FFA000',
          glow: 'rgba(255, 111, 0, 0.5)'
        },

        // Day 3: Endgame
        'endgame-gold': {
          DEFAULT: '#D4AF37',
          dark: '#B38F24',
          light: '#F3E5AB',
          glow: 'rgba(212, 175, 55, 0.45)',
          surface: 'rgba(212, 175, 55, 0.15)'
        },
        'earth-brown': {
          DEFAULT: '#6D4C41',
          light: '#FAFAFA'
        },

        // UI Surfaces & Text
        surface: {
          DEFAULT: '#0F131D',
          card: '#121824',
          hover: '#182133',
          glass: 'rgba(15, 19, 29, 0.75)'
        },
        'off-white': '#F5F5F5',
        'muted-text': '#8B94A0',
        'dim-text': '#525B6A',

        // Legacy aliases mapped to brand guide for backward compatibility
        'marvel-red': {
          DEFAULT: '#B71C1C',
          dark: '#8E0000',
          light: '#D32F2F',
          glow: 'rgba(183, 28, 28, 0.45)'
        }
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'Anton', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'Montserrat', 'system-ui', 'sans-serif'],
        label: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"Space Grotesk"', 'monospace']
      },
      boxShadow: {
        'glow-red': '0 0 25px rgba(183, 28, 28, 0.4)',
        'glow-purple': '0 0 25px rgba(106, 27, 154, 0.4)',
        'glow-blue': '0 0 25px rgba(40, 53, 147, 0.4)',
        'glow-gold': '0 0 25px rgba(212, 175, 55, 0.45)',
        'glow-orange': '0 0 25px rgba(255, 111, 0, 0.45)',
        'glow-combo': '0 0 30px rgba(183, 28, 28, 0.25), 0 0 45px rgba(106, 27, 154, 0.25)',
        'card': '0 10px 30px -10px rgba(0, 0, 0, 0.7)'
      },
      backgroundImage: {
        // Overall Story Arc: Civil War -> Infinity War -> Endgame
        'story-arc-gradient': 'linear-gradient(135deg, #B71C1C 0%, #6A1B9A 50%, #D4AF37 100%)',
        'marvel-gradient': 'linear-gradient(135deg, #B71C1C 0%, #6A1B9A 50%, #D4AF37 100%)',
        'marvel-gradient-subtle': 'linear-gradient(135deg, rgba(183, 28, 28, 0.15) 0%, rgba(106, 27, 154, 0.15) 50%, rgba(212, 175, 55, 0.15) 100%)',
        
        // Day-specific gradients from brand guide
        'day1-gradient': 'linear-gradient(135deg, #080B12 0%, #B71C1C 100%)',
        'day2-gradient': 'linear-gradient(135deg, #080B12 0%, #6A1B9A 50%, #283593 100%)',
        'day3-gradient': 'linear-gradient(135deg, #080B12 0%, #6D4C41 50%, #D4AF37 100%)'
      }
    },
  },
  plugins: [],
}
