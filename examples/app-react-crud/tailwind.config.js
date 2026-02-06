/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        accents: {
          1: "var(--accents-1)",
          2: "var(--accents-2)",
          3: "var(--accents-3)",
          4: "var(--accents-4)",
          5: "var(--accents-5)",
          6: "var(--accents-6)",
          7: "var(--accents-7)",
          8: "var(--accents-8)",
        },
        success: {
          lighter: "var(--success-lighter)",
          light: "var(--success-light)",
          DEFAULT: "var(--success)",
          dark: "var(--success-dark)",
        },
        error: {
          lighter: "var(--error-lighter)",
          light: "var(--error-light)",
          DEFAULT: "var(--error)",
          dark: "var(--error-dark)",
        },
        warning: {
          lighter: "var(--warning-lighter)",
          light: "var(--warning-light)",
          DEFAULT: "var(--warning)",
          dark: "var(--warning-dark)",
        },
      },
    },
  },
  plugins: [],
}
