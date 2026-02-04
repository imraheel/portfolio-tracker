/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Arial', 'Helvetica', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        accent: {
          teal: '#0d9488',
          purple: '#7c3aed',
          rose: '#e11d48',
        },
        dark: {
          slate: '#1e293b',
          slateLight: '#334155',
        },
      },
      boxShadow: {
        soft: '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        card: '0 0 2rem 0 rgba(0, 0, 0, 0.05)',
        hover: '0 10px 40px -10px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        card: 'rounded-xl',
        button: 'rounded-lg',
        metric: 'rounded-xl',
        table: 'rounded-xl',
      },
    },
  },
  plugins: [],
}
