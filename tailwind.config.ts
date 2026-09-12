import type { Config } from 'tailwindcss';

export default {
  content: [
    './entrypoints/**/*.{tsx,ts,html}',
    './components/**/*.{tsx,ts}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bias: {
          framing: '#3b82f6',
          loaded: '#f59e0b',
          emotion: '#f43f5e',
          dichotomy: '#f97316',
          adhominem: '#a855f7',
          authority: '#14b8a6',
          bandwagon: '#06b6d4',
          strawman: '#6366f1',
          slippery: '#ef4444',
          generalization: '#22c55e',
          cherry: '#eab308',
          causation: '#ec4899',
          whataboutism: '#8b5cf6',
        },
      },
      animation: {
        'score-fill': 'scoreFill 1.2s ease-out forwards',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
      },
      keyframes: {
        scoreFill: {
          '0%': { strokeDashoffset: '283' },
          '100%': { strokeDashoffset: 'var(--score-offset)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
