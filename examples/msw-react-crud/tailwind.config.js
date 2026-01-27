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
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
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
