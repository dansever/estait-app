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
  			sans: [
  				'Open Sans',
  				'ui-sans-serif',
  				'system-ui'
  			],
  			display: [
  				'Playfair Display',
  				'ui-serif',
  				'serif'
  			]
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			backgroundSoft: 'var(--bg-soft)',
  			backgroundMuted: 'var(--bg-muted)',
  			text: {
  				headline: 'var(--text-headline)',
  				subhead: 'var(--text-subhead)',
  				cardHeadline: 'var(--text-card-headline)',
  				cardParagraph: 'var(--text-card-paragraph)'
  			},
  			primary: {
  				'100': 'var(--color-primary-100)',
  				'200': 'var(--color-primary-200)',
  				'300': 'var(--color-primary-300)',
  				'400': 'var(--color-primary-400)',
  				'500': 'var(--color-primary-500)',
  				'600': 'var(--color-primary-600)',
  				'700': 'var(--color-primary-700)',
  				'800': 'var(--color-primary-800)',
  				'900': 'var(--color-primary-900)',
  				DEFAULT: 'var(--color-primary)'
  			},
  			secondary: {
  				'100': 'var(--color-secondary-100)',
  				'200': 'var(--color-secondary-200)',
  				'300': 'var(--color-secondary-300)',
  				'400': 'var(--color-secondary-400)',
  				'500': 'var(--color-secondary-500)',
  				'600': 'var(--color-secondary-600)',
  				'700': 'var(--color-secondary-700)',
  				'800': 'var(--color-secondary-800)',
  				'900': 'var(--color-secondary-900)',
  				DEFAULT: 'var(--color-secondary)'
  			},
  			tertiary: 'var(--color-tertiary)',
  			success: {
  				'100': 'var(--color-success-100)',
  				DEFAULT: 'var(--color-success)'
  			},
  			warning: {
  				'100': 'var(--color-warning-100)',
  				DEFAULT: 'var(--color-warning)'
  			},
  			danger: {
  				'100': 'var(--color-danger-100)',
  				'200': 'var(--color-danger-200)',
  				'300': 'var(--color-danger-300)',
  				'400': 'var(--color-danger-400)',
  				'500': 'var(--color-danger-500)',
  				'600': 'var(--color-danger-600)',
  				'700': 'var(--color-danger-700)',
  				'800': 'var(--color-danger-800)',
  				'900': 'var(--color-danger-900)',
  				DEFAULT: 'var(--color-danger)'
  			},
  			gray: {
  				'50': 'var(--color-gray-50)',
  				'100': 'var(--color-gray-100)',
  				'200': 'var(--color-gray-200)',
  				'300': 'var(--color-gray-300)',
  				'400': 'var(--color-gray-400)',
  				'500': 'var(--color-gray-500)',
  				'600': 'var(--color-gray-600)',
  				'700': 'var(--color-gray-700)',
  				'800': 'var(--color-gray-800)',
  				'900': 'var(--color-gray-900)'
  			},
  			border: 'var(--border-default)',
  			divider: 'var(--divider)',
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
