/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary & Brand Colors
        whiteCustom: "#FFFFFF",
        blackCustom: "#010138",
        purplePrimary: "#4D4DE9",
        
        // Secondary Colors
        secondaryGreen: "#BDF6CC",
        secondaryPink: "#F9B9D9",
        secondaryYellow: "#FFDD99",
        
        // Neutral Palette
        neutral1: "#E7E7FD",
        neutral2: "#D4D4FB",
        neutral3: "#C4C4FF",
        neutral4: "#9797F6",
        neutral5: "#7171F1",
        
        // Gray Palette
        gray1: "#F5F5FE",
        gray2: "#EBEBF8",
        gray3: "#DDDDDF",
        gray4: "#C5C5E2",
        gray5: "#9292B4",
        gray6: "#5F5F79",

        // Soft Dark Palette
        dark900: "#0F1623",
        dark800: "#1A2235",
        dark700: "#243047",
        dark600: "#2E3D5C",
        dark500: "#4A5E80",
        darkText1: "#E8ECF4",
        darkText2: "#9BAEC8",
        darkText3: "#6B82A0",

        // Evening / dusk palette
        eveningBg: "#FFF6EE",
        eveningCard: "#FFFBF6",
        eveningCardAlt: "#F5EDE4",
        eveningHeader: "#2A1F3D",
        eveningBorder: "#E8D9C8",
        eveningText: "#1F1630",
        eveningTextSecondary: "#5C4A3A",
        eveningTextMuted: "#8A7360",

        // Semantic tokens (resolve via CSS vars)
        brand: {
          50:  "#EEEEFC",
          100: "#DDDDFA",
          200: "#BBBBF5",
          300: "#9999EF",
          400: "#7777EC",
          500: "#4D4DE9",
          600: "#3A3AD4",
          700: "#2E2EAA",
          800: "#232380",
          900: "#1A1A5C",
        },
        success: {
          light:   "#D1FAE5",
          DEFAULT: "#10B981",
          dark:    "#047857",
        },
        warning: {
          light:   "#FEF3C7",
          DEFAULT: "#F59E0B",
          dark:    "#B45309",
        },
        danger: {
          light:   "#FEE2E2",
          DEFAULT: "#EF4444",
          dark:    "#B91C1C",
        },
        ink: {
          DEFAULT: 'var(--ink, #010138)',
          muted:   'var(--ink-muted, #5F5F79)',
          faint:   'var(--ink-faint, #9292B4)',
        },
        surface: {
          DEFAULT: 'var(--surface, #FFFFFF)',
          subtle:  'var(--surface-subtle, #F5F5FE)',
          muted:   'var(--surface-muted, #EBEBF8)',
          border:  'var(--surface-border, #DDDDDF)',
        },
      },
      boxShadow: {
        card: '0 2px 8px 0 rgba(1, 1, 56, 0.06), 0 1px 2px 0 rgba(1, 1, 56, 0.04)',
        pop: '0 12px 32px 0 rgba(1, 1, 56, 0.16), 0 4px 12px 0 rgba(1, 1, 56, 0.08)',
      },
      fontFamily: {
        sans: ['Indivisible','Poppins','Inter','system-ui','sans-serif'],
      },
      fontSize: {
        'title': ['32px', { lineHeight: '40px', fontWeight: '750' }],
        'subtitle': ['24px', { lineHeight: '32px', fontWeight: '750' }],
        'heading': ['20px', { lineHeight: '28px', fontWeight: '750' }],
        'paragraph': ['16px', { lineHeight: '24px', fontWeight: '500' }],
        'secondaryText': ['14px', { lineHeight: '20px', fontWeight: '500' }],
        'smallText': ['12px', { lineHeight: '16px', fontWeight: '500' }],
        'small': ['12px', { lineHeight: '16px', fontWeight: '500' }],
      }
    },
  },
  plugins: [],
}