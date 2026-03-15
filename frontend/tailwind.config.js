/** @type {import('tailwindcss').Config} */
export default {
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
          bg:       'hsl(220, 16%, 8%)',
          surface:  'hsl(220, 16%, 12%)',
          elevated: 'hsl(220, 14%, 16%)',
          card:     'hsl(220, 12%, 18%)',
          border:   'hsl(220, 14%, 24%)',
          subtle:   'hsl(220, 14%, 20%)',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, hsl(142,76%,36%), hsl(173,80%,40%))',
        'gradient-hero':    'linear-gradient(135deg, hsl(142,60%,10%) 0%, hsl(220,16%,8%) 60%)',
        'gradient-card':    'linear-gradient(145deg, hsl(220,14%,16%), hsl(220,12%,18%))',
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
