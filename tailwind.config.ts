import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,md}',
  ],
  theme: {
    extend: {
      colors: {
        // Direct Sovereign Tokens (PROJECT.md Interface Contract)
        obsidian: {
          DEFAULT: '#05131F',
          dark: '#05131F',
          card: '#0A1E30',
          elevated: '#0E273E',
        },
        porcelain: {
          DEFAULT: '#FBFBFB',
          light: '#FBFBFB',
          card: '#FFFFFF',
        },
        'klay-emerald': {
          DEFAULT: '#22C55E',
          hover: '#16A34A',
          dark: '#15803D',
          tint: 'rgba(34, 197, 94, 0.12)',
        },
        'klay-midnight': {
          DEFAULT: '#0C2D48',
          deep: '#05131F',
          surface: '#103859',
        },
        'klay-amber': {
          DEFAULT: '#E8A72E',
          hover: '#D1921E',
          tint: 'rgba(232, 167, 46, 0.12)',
        },
        'hairline-dark': {
          DEFAULT: 'rgba(226, 226, 226, 0.15)',
          hover: 'rgba(34, 197, 94, 0.40)',
        },
        'hairline-light': {
          DEFAULT: 'rgba(0, 0, 0, 0.08)',
          solid: '#E2E2E2',
        },
        navy: {
          900: '#0C2D48',
          800: '#0C2D48',
          700: '#0C2D48',
          600: '#0C2D48',
          500: '#0C2D48',
        },
        gold: {
          400: '#E8A72E',
          500: '#E8A72E',
          600: '#E8A72E',
          700: '#E8A72E',
        },
        champagne: '#E8C37A',
        palette: {
          black: '#000000',
          white: '#FFFFFF',
          gold: '#D4AF37',
          champagne: '#E8C37A',
        },
        cream: '#F6FBF4',
        'light-green': '#EDFBE2',
        'canvas-light': '#FBFBFB',
        'canvas-dark': '#05131F',
        'canvas-dark-card': '#0A1E30',
        'brand-navy': {
          DEFAULT: '#0C2D48',
          deep: '#05131F',
          surface: '#103859',
        },
        'brand-blue': {
          DEFAULT: '#0C2D48',
          deep: '#05131F',
          accent: '#2563EB',
        },
        'brand-green': {
          DEFAULT: '#22C55E',
          hover: '#16A34A',
          dark: '#15803D',
          tint: 'rgba(34, 197, 94, 0.12)',
        },
        'brand-gold': {
          DEFAULT: '#D4AF37',
          hover: '#C59B27',
        },
        'accent-amber': {
          DEFAULT: '#E8A72E',
          hover: '#D1921E',
        },
        'accent-champagne': {
          DEFAULT: '#E8C37A',
          tint: 'rgba(232, 195, 122, 0.12)',
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
      },
      fontFamily: {
        display: ['var(--font-display)'],
        aspekta: ['var(--font-aspekta)'],
        heading: ['var(--font-heading)'],
        body: ['var(--font-body)'],
      },
      letterSpacing: {
        tightest: '-0.04em',
        'display-tight': '-0.03em',
        'body-tight': '-0.02em',
      },
      fontSize: {
        'display-hero': [
          'clamp(2.94rem, 5.5vw, 4.93rem)',
          { lineHeight: '1', letterSpacing: '-0.03em', fontWeight: '400' },
        ],
        'display-section': [
          'clamp(2.63rem, 4.5vw, 4rem)',
          { lineHeight: '1.1', letterSpacing: '-0.04em', fontWeight: '400' },
        ],
        'display-card': [
          'clamp(2rem, 3.2vw, 3rem)',
          { lineHeight: '1.2', letterSpacing: '-0.04em', fontWeight: '400' },
        ],
        'display-step': [
          'clamp(1.5rem, 2.2vw, 2rem)',
          { lineHeight: '1.2', letterSpacing: '-0.03em', fontWeight: '400' },
        ],
        'display-stat': [
          'clamp(3.5rem, 6.5vw, 6rem)',
          { lineHeight: '1', letterSpacing: '0em', fontWeight: '400' },
        ],
        'display-body': [
          'clamp(1rem, 1.2vw, 1.125rem)',
          { lineHeight: '1.3', letterSpacing: '-0.02em', fontWeight: '400' },
        ],
        'display-nav': [
          '0.9375rem',
          { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '400' },
        ],
        'display-eyebrow': [
          'clamp(0.875rem, 1.1vw, 1.125rem)',
          { lineHeight: '1', letterSpacing: '0em', fontWeight: '400' },
        ],
        'display-caption': [
          '0.75rem',
          { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '400' },
        ],
        xs: ['var(--text-xs)', { lineHeight: 'var(--line-height-compact)' }],
        sm: ['var(--text-sm)', { lineHeight: 'var(--line-height-compact)' }],
        base: ['var(--text-base)', { lineHeight: 'var(--line-height-body)' }],
        lg: ['var(--text-lg)', { lineHeight: 'var(--line-height-body)' }],
        xl: ['var(--text-xl)', { lineHeight: 'var(--line-height-heading)' }],
        '2xl': ['var(--text-2xl)', { lineHeight: 'var(--line-height-heading)' }],
        '3xl': ['var(--text-3xl)', { lineHeight: 'var(--line-height-heading)' }],
        '4xl': ['var(--text-4xl)', { lineHeight: 'var(--line-height-heading)' }],
        '5xl': ['var(--text-5xl)', { lineHeight: 'var(--line-height-heading)' }],
        '6xl': ['var(--text-6xl)', { lineHeight: 'var(--line-height-heading)' }],
        '7xl': ['var(--text-7xl)', { lineHeight: 'var(--line-height-heading)' }],
      },
      backgroundImage: {
        'navy-gradient':
          'linear-gradient(135deg, rgba(12,45,72,0.88) 0%, #0C2D48 40%, rgba(12,45,72,0.92) 100%)',
        'gold-gradient':
          'linear-gradient(135deg, rgba(232,167,46,0.82) 0%, #E8A72E 50%, rgba(232,167,46,0.88) 100%)',
        'glass-gradient':
          'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(237,251,226,0.16) 100%)',
        'glass-dark-gradient':
          'linear-gradient(135deg, rgba(255,255,255,0.16) 0%, rgba(237,251,226,0.06) 100%)',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(12, 45, 72, 0.12)',
        'glass-lg': '0 16px 48px 0 rgba(12, 45, 72, 0.18)',
        gold: '0 8px 24px 0 rgba(232, 167, 46, 0.35)',
        'amber-glow': 'var(--amber-button-glow)',
        'amber-card': 'var(--amber-card-glow)',
        'green-glow': 'var(--green-button-glow)',
        'green-card': 'var(--green-card-glow)',
      },
      backdropBlur: {
        glass: '20px',
      },
      // Tailwind 3.3 has no spacing-based min-h-* utilities (added in 3.4).
      // These match the 3.4 spacing scale so existing classes (min-h-11 = 44px
      // tap targets, etc.) generate real CSS.
      minHeight: {
        10: '2.5rem',
        11: '2.75rem',
        12: '3rem',
        52: '13rem',
        64: '16rem',
        72: '18rem',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(calc(-100% - var(--gap)))' },
        },
        'marquee-vertical': {
          from: { transform: 'translateY(0)' },
          to: { transform: 'translateY(calc(-100% - var(--gap)))' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'scale-in': 'scale-in 0.4s ease-out forwards',
        float: 'float 6s ease-in-out infinite',
        marquee: 'marquee var(--duration) linear infinite',
        'marquee-vertical': 'marquee-vertical var(--duration) linear infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
