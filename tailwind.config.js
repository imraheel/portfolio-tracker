/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['JetBrains Mono', 'monospace'],
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
      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg, #e8c9a0 0%, #d4a574 50%, #b8935f 100%)',
        'gradient-dark': 'linear-gradient(145deg, rgba(26, 26, 29, 0.8), rgba(18, 18, 20, 0.9))',
        'gradient-radial': 'radial-gradient(ellipse at center, var(--tw-gradient-stops))',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
