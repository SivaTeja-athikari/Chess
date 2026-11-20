/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0b0e',
        surface: {
          DEFAULT: '#12141a',
          hover: '#1a1d24',
          active: '#222630',
        },
        primary: {
          DEFAULT: '#d4af37',
          hover: '#e5be48',
          light: '#f3e5ab',
          dark: '#9a7b20',
        },
        accent: {
          gold: '#c5a059',
          crimson: '#e63946',
          emerald: '#2a9d8f',
          sapphire: '#457b9d',
        },
        board: {
          light: '#eae4d9',
          dark: '#584334',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Cinzel', 'Playfair Display', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'luxury': '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 20px rgba(212, 175, 55, 0.1)',
        'gold-glow': '0 0 25px rgba(212, 175, 55, 0.35)',
        'crimson-glow': '0 0 25px rgba(230, 57, 70, 0.45)',
        'inner-bevel': 'inset 0 1px 1px rgba(255, 255, 255, 0.15), inset 0 -1px 1px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'pulse-subtle': 'pulseSubtle 2.5s infinite ease-in-out',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        pulseSubtle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.03)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
