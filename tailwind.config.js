/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: '16px',
    },
    extend: {
      colors: {
        brand: {
          indigo: {
            50: '#EEF2F9',
            100: '#D9E2F0',
            200: '#B3C5E1',
            300: '#8DA8D2',
            400: '#678BC3',
            500: '#416EB4',
            600: '#2E528F',
            700: '#1E3A5F',
            800: '#172D4A',
            900: '#0F1F34',
            950: '#08101C',
          },
          rose: {
            50: '#FBF7EF',
            100: '#F4EAD6',
            200: '#E8D5AD',
            300: '#DDC084',
            400: '#D1AB5B',
            500: '#C9A96E',
            600: '#B08D52',
            700: '#8B6E3F',
            800: '#66502C',
            900: '#40321B',
          },
          purple: {
            50: '#F4F2FB',
            100: '#E6E2F5',
            200: '#CEC5EB',
            300: '#B5A8E1',
            400: '#9D8BD7',
            500: '#8B7EC8',
            600: '#6D5FB0',
            700: '#554988',
            800: '#3D3560',
            900: '#252038',
          },
        },
        semantic: {
          success: '#6FCF97',
          successLight: '#E8F8EF',
          warning: '#F2994A',
          warningLight: '#FEF2E6',
          danger: '#E05A5A',
          dangerLight: '#FDECEC',
          info: '#2D9CDB',
          infoLight: '#E5F4FC',
        },
        neutral: {
          bg: '#F7F8FA',
          card: '#FFFFFF',
          border: 'rgba(30, 58, 95, 0.08)',
          text: {
            primary: '#2C3E50',
            secondary: '#5C6B7A',
            tertiary: '#8892A0',
            disabled: '#B0B8C1',
          },
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'Georgia', 'serif'],
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        kpi: ['32px', { lineHeight: '40px', fontWeight: '700' }],
        'kpi-sm': ['24px', { lineHeight: '32px', fontWeight: '700' }],
        'page-title': ['28px', { lineHeight: '36px', fontWeight: '700' }],
        'section-title': ['18px', { lineHeight: '26px', fontWeight: '600' }],
        'card-title': ['14px', { lineHeight: '22px', fontWeight: '500' }],
        'body': ['13px', { lineHeight: '20px', fontWeight: '400' }],
        'caption': ['11px', { lineHeight: '16px', fontWeight: '400' }],
      },
      borderRadius: {
        'card': '12px',
        'widget': '8px',
        'pill': '9999px',
      },
      boxShadow: {
        'card': '0 4px 20px rgba(30, 58, 95, 0.06)',
        'card-hover': '0 8px 32px rgba(30, 58, 95, 0.10)',
        'inner-soft': 'inset 0 1px 2px rgba(30, 58, 95, 0.04)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'breath': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(224, 90, 90, 0.4)' },
          '50%': { boxShadow: '0 0 0 12px rgba(224, 90, 90, 0)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease-out both',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'breath': 'breath 2.4s ease-in-out infinite',
        'slide-in-right': 'slide-in-right 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
      backgroundImage: {
        'gradient-kpi-success': 'linear-gradient(135deg, #E8F8EF 0%, #FFFFFF 60%, #F7F8FA 100%)',
        'gradient-kpi-warning': 'linear-gradient(135deg, #FEF2E6 0%, #FFFFFF 60%, #F7F8FA 100%)',
        'gradient-kpi-danger': 'linear-gradient(135deg, #FDECEC 0%, #FFFFFF 60%, #F7F8FA 100%)',
        'gradient-kpi-info': 'linear-gradient(135deg, #E5F4FC 0%, #FFFFFF 60%, #F7F8FA 100%)',
        'gradient-rose-gold': 'linear-gradient(135deg, #DDC084 0%, #C9A96E 50%, #B08D52 100%)',
        'gradient-indigo': 'linear-gradient(135deg, #2E528F 0%, #1E3A5F 50%, #0F1F34 100%)',
      },
    },
  },
  plugins: [],
};
