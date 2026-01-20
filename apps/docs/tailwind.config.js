/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './content/**/*.{md,mdx}',
    './mdx-components.{ts,tsx}',
    './node_modules/fumadocs-ui/dist/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--fd-border))',
        input: 'hsl(var(--fd-border))',
        ring: 'hsl(var(--fd-ring))',
        background: 'hsl(var(--fd-background))',
        foreground: 'hsl(var(--fd-foreground))',
        primary: {
          DEFAULT: 'hsl(var(--fd-primary))',
          foreground: 'hsl(var(--fd-primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--fd-secondary))',
          foreground: 'hsl(var(--fd-secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--fd-muted))',
          foreground: 'hsl(var(--fd-muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--fd-accent))',
          foreground: 'hsl(var(--fd-accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--fd-card))',
          foreground: 'hsl(var(--fd-card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
        'fade-in-up': 'fade-in-up 0.6s ease-out',
        'slide-in-right': 'slide-in-right 0.5s ease-out',
      },
    },
  },
  plugins: [],
};
