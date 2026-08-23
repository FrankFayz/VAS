/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        vas: {
          50: '#eef8f7',
          100: '#d5f0ed',
          200: '#aee1db',
          300: '#7ccbc3',
          400: '#4aada4',
          500: '#2f9189',
          600: '#247470',
          700: '#205d5b',
          800: '#1e4b4a',
          900: '#1c3f3e',
          950: '#0b2424',
        },
        ink: {
          DEFAULT: 'var(--vas-bg)',
          raised: 'var(--vas-bg-raised)',
          panel: 'var(--vas-bg-panel)',
          border: 'var(--vas-border)',
          mute: 'var(--vas-text-mute)',
        },
        severity: {
          low: 'var(--vas-severity-low)',
          medium: 'var(--vas-severity-medium)',
          high: 'var(--vas-severity-high)',
          critical: 'var(--vas-severity-critical)',
        },
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
        'pulse-live': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.45' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s ease-out both',
        'fade-up-delayed': 'fade-up 0.8s ease-out 0.15s both',
        'fade-up-late': 'fade-up 0.8s ease-out 0.3s both',
        'pulse-live': 'pulse-live 1.6s ease-in-out infinite',
        'slide-in': 'slide-in 0.35s ease-out both',
      },
    },
  },
  plugins: [],
}
