/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
        mono: ['Roboto', 'monospace'],
      },
      colors: {
        background: {
          primary: '#0a0a0b',
          secondary: '#121214',
          tertiary: '#1a1a1d',
          elevated: '#222226',
        },
        foreground: {
          primary: '#faf9f7',
          secondary: '#a0a0a0',
          muted: '#6b6b6b',
        },
        accent: {
          gold: '#d4a574',
          'gold-light': '#e8c9a0',
          'gold-dark': '#b8935f',
          coral: '#e07a5f',
          'coral-light': '#f0937a',
          sage: '#81b29a',
          'sage-light': '#9bc4b0',
        },
        border: {
          subtle: 'rgba(255, 255, 255, 0.06)',
          DEFAULT: 'rgba(255, 255, 255, 0.1)',
          accent: 'rgba(212, 165, 116, 0.3)',
        },
      },
      boxShadow: {
        'soft': '0 1px 2px rgba(0, 0, 0, 0.3)',
        'card': '0 4px 12px rgba(0, 0, 0, 0.4)',
        'elevated': '0 8px 30px rgba(0, 0, 0, 0.5)',
        'gold': '0 0 30px rgba(212, 165, 116, 0.15)',
      },
      borderRadius: {
        'card': '0.75rem',
        'button': '0.375rem',
      },
      animation: {},
    },
  },
  plugins: [],
}
