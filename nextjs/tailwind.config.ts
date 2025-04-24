import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Nunito", "ui-sans-serif", "system-ui"],
        heading: ["Montserrat", "ui-sans-serif", "system-ui"],
      },

      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        // Background shades (optional if you're using them in components)
        backgroundSoft: "var(--bg-soft)",
        backgroundMuted: "var(--bg-muted)",

        // Text
        text: {
          headline: "var(--text-headline)",
          subhead: "var(--text-subhead)",
          cardHeadline: "var(--text-card-headline)",
          cardParagraph: "var(--text-card-paragraph)",
        },

        // Primary
        primary: {
          DEFAULT: "var(--color-primary)",
          100: "var(--color-primary-100)",
          200: "var(--color-primary-200)",
          300: "var(--color-primary-300)",
          400: "var(--color-primary-400)",
          500: "var(--color-primary-500)",
          600: "var(--color-primary-600)",
          700: "var(--color-primary-700)",
          800: "var(--color-primary-800)",
          900: "var(--color-primary-900)",
        },

        // Secondary
        secondary: {
          DEFAULT: "var(--color-secondary)",
          100: "var(--color-secondary-100)",
          200: "var(--color-secondary-200)",
          300: "var(--color-secondary-300)",
          400: "var(--color-secondary-400)",
          500: "var(--color-secondary-500)",
          600: "var(--color-secondary-600)",
          700: "var(--color-secondary-700)",
          800: "var(--color-secondary-800)",
          900: "var(--color-secondary-900)",
        },

        // Tertiary (if used)
        tertiary: "var(--color-tertiary)",

        // Status
        success: {
          DEFAULT: "var(--color-success)",
          100: "var(--color-success-100)",
        },
        warning: {
          DEFAULT: "var(--color-warning)",
          100: "var(--color-warning-100)",
        },
        danger: {
          DEFAULT: "var(--color-danger)",
          100: "var(--color-danger-100)",
          200: "var(--color-danger-200)",
          300: "var(--color-danger-300)",
          400: "var(--color-danger-400)",
          500: "var(--color-danger-500)",
          600: "var(--color-danger-600)",
          700: "var(--color-danger-700)",
          800: "var(--color-danger-800)",
          900: "var(--color-danger-900)",
        },

        // Grayscale
        gray: {
          50: "var(--color-gray-50)",
          100: "var(--color-gray-100)",
          200: "var(--color-gray-200)",
          300: "var(--color-gray-300)",
          400: "var(--color-gray-400)",
          500: "var(--color-gray-500)",
          600: "var(--color-gray-600)",
          700: "var(--color-gray-700)",
          800: "var(--color-gray-800)",
          900: "var(--color-gray-900)",
        },

        // Borders / Dividers
        border: "var(--border-default)",
        divider: "var(--divider)",
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
