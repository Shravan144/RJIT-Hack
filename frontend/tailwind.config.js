/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
      colors: {
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        brand: {
          bg:       'var(--color-brand-bg)',
          surface:  'var(--color-brand-surface)',
          elevated: 'var(--color-brand-elevated)',
          card:     'var(--color-brand-card)',
          border:   'var(--color-brand-border)',
          subtle:   'var(--color-brand-subtle)',
          base:     'var(--color-text-base)',
          muted:    'var(--color-text-muted)',
          inverted: 'var(--color-text-inverted)',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, theme(colors.emerald.600), theme(colors.emerald.500))',
      },
      boxShadow: {
        glow:  '0 4px 24px theme(colors.emerald.500 / 15%)',
        'glow-lg': '0 8px 32px theme(colors.emerald.600 / 20%)',
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
        pulse: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
        fadeDown: 'fadeDown 0.3s ease-out forwards',
        fadeIn: 'fadeIn 0.3s ease-out forwards',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        fadeDown: {
          from: { opacity: 0, transform: 'translateY(-10px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        }
      },
    },
  },
  plugins: [],
};
