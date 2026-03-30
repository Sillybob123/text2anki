import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#faf8f3',
        sage: {
          DEFAULT: '#8fab87',
          light: '#a8c4a5',
          dark: '#6d8f6a',
        },
        lavender: {
          DEFAULT: '#b8a8c8',
          light: '#d4c8e0',
          muted: '#e8e0f0',
        },
        teal: {
          calm: '#7fb5b0',
          light: '#a0cdc9',
          dark: '#5a9a95',
        },
        warm: {
          sand: '#e8dfd0',
          rose: '#d4b8b0',
        },
        text: {
          primary: '#3d4a3e',
          secondary: '#6b7a6c',
          muted: '#9aaa9b',
        },
      },
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        calm: '0 4px 24px rgba(107, 122, 108, 0.12)',
        'calm-lg': '0 8px 40px rgba(107, 122, 108, 0.16)',
        card: '0 2px 12px rgba(107, 122, 108, 0.08)',
      },
      backdropBlur: {
        calm: '12px',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'stagger': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
