/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro"', '"Helvetica Neue"', 'sans-serif'],
        mono: ['"SF Mono"', '"SF Pro"', 'monospace'],
      },
      colors: {
        background: {
          primary: '#F5F5F7',
          secondary: '#FFFFFF',
          tertiary: '#F2F2F7',
          elevated: '#FFFFFF',
        },
        foreground: {
          primary: '#1D1D1F',
          secondary: '#86868B',
          muted: '#A1A1A6',
        },
        accent: {
          blue: '#007AFF',
          'blue-light': '#409CFF',
          'blue-dark': '#0066D6',
          red: '#FF3B30',
          'red-light': '#FF6259',
          green: '#34C759',
          'green-light': '#4CD964',
        },
        border: {
          subtle: '#E5E5E7',
          DEFAULT: '#D2D2D7',
          accent: '#007AFF',
        },
      },
      boxShadow: {
        'soft': '0 1px 3px rgba(0, 0, 0, 0.08)',
        'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'elevated': '0 8px 24px rgba(0, 0, 0, 0.12)',
      },
      borderRadius: {
        'card': '0.5rem',
        'button': '0.375rem',
      },
    },
  },
  plugins: [],
}
