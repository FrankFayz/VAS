/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        vas: {
          50: '#f0f5ff',
          100: '#e0ebff',
          200: '#c2d9ff',
          300: '#94baff',
          400: '#5c94f5',
          500: '#3b76e8',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        surface: '#0c1220',
        'surface-raised': '#111827',
        'surface-border': '#1e293b',
      },
      fontFamily: {
        sans: ['Manrope', 'Segoe UI', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Sora', 'Manrope', 'Segoe UI', 'sans-serif'],
        block: ['Space Grotesk', 'Sora', 'Arial Black', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.03em', fontWeight: '700' }],
        'display-md': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.02em', fontWeight: '700' }],
      },
      maxWidth: {
        page: '80rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s ease-out both',
        'fade-up-delayed': 'fade-up 0.8s ease-out 0.15s both',
        'fade-up-late': 'fade-up 0.8s ease-out 0.3s both',
      },
    },
  },
  plugins: [],
}
