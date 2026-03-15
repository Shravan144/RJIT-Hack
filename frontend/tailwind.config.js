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
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      colors: {
        green: {
          400: 'hsl(142, 71%, 45%)',
          500: 'hsl(142, 76%, 36%)',
          600: 'hsl(142, 80%, 28%)',
        },
        teal: {
          400: 'hsl(173, 80%, 40%)',
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
        'gradient-primary': 'linear-gradient(135deg, hsl(142,76%,36%), hsl(173,80%,40%))',
        'gradient-hero':    'var(--bg-gradient-hero)',
        'gradient-card':    'var(--bg-gradient-card)',
      },
      boxShadow: {
        glow:  '0 0 24px hsla(142,76%,36%,0.25)',
        'glow-lg': '0 0 40px hsla(142,76%,36%,0.35)',
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
        pulse: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
        fadeDown: 'fadeDown 0.15s ease',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        fadeDown: {
          from: { opacity: 0, transform: 'translateY(-6px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
