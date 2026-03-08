import tailwindcssTypography from '@tailwindcss/typography'
import type { Config } from 'tailwindcss'
import tailwindcssAnimated from 'tailwindcss-animated'
import tailwindcssRadix from 'tailwindcss-radix'

import {
  blackAlpha,
  blue,
  gray,
  green,
  orange,
  pink,
  purple,
  red,
  teal,
  whiteAlpha,
  yellow,
} from './src/styles/colors'
import { lightThemeColors } from './src/styles/colorTheme'

export default {
  content: [
    'src/**/*.{js,ts,jsx,tsx}',
    'src/app/**/*.{js,ts,jsx,tsx}',
    'src/pages/**/*.{js,ts,jsx,tsx}',
    'src/components/**/*.{js,ts,jsx,tsx}',
    'public/index.html',
  ],
  darkMode: 'class',
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      ...lightThemeColors,
    },
    textColor: {
      transparent: 'transparent',
      current: 'currentColor',
      ...lightThemeColors,
      primary: `var(--color-primary, ${blue[600]})`,
    },
    fontFamily: {
      sans: [
        '"Inter"',
        'system-ui',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        '"Noto Sans"',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
        '"Noto Color Emoji"',
      ],
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: `var(--color-primary, ${blue[600]})`,
          subtle: `var(--color-primary-subtle, ${blue[400]})`,
          highlight: `var(--color-primary-highlight, ${blue[800]})`,
          foreground: 'white',
        },
        destructive: {
          DEFAULT: red[300],
          subtle: red[200],
          highlight: red[100],
          foreground: 'white',
        },
        black: blackAlpha,
        white: whiteAlpha,
        gray,
        green,
        purple,
        yellow,
        pink,
        blue,
        secondary: {
          DEFAULT: `var(--color-secondary, ${yellow[700]})`,
          subtle: `var(--color-secondary-subtle, ${yellow[500]})`,
        },
        tertiary: `var(--color-tertiary, ${pink[400]})`,
        whatsapp: '#25D366',
        background: {
          DEFAULT: 'white',
          'layer-2': gray[50],
          'layer-3': gray[100],
          'layer-4': gray[200],
          disabled: gray[400],
        },
        text: {
          DEFAULT: blackAlpha[900],
          contrast: 'white',
          subtle: gray[600],
          highlight: purple[500],
          disabled: gray[200],
          sub: gray[500],
        },
        border: {
          DEFAULT: blackAlpha[600],
        },
        shadow: {
          DEFAULT: blackAlpha[100],
          highlight: blackAlpha[50],
        },
        success: {
          DEFAULT: green[500],
          subtle: green[100],
        },
        warn: {
          DEFAULT: red[500],
          subtle: red[100],
        },
        overlay: blackAlpha[500],
        facebook: '#1877f2',
        publish: {
          success: green[200],
        },
        // Warna tema gelap
        dark: {
          primary: {
            DEFAULT: orange[500],
            subtle: orange[600],
            highlight: orange[400],
            foreground: 'white',
          },
          secondary: {
            DEFAULT: teal[500],
            subtle: teal[600],
          },
          tertiary: purple[500],
          background: {
            DEFAULT: gray[900],
            'layer-2': gray[800],
            'layer-3': gray[700],
            'layer-4': gray[900],
            disabled: gray[600],
          },
          text: {
            DEFAULT: 'white',
            contrast: gray[900],
            subtle: yellow[300],
            highlight: teal[500],
            disabled: gray[300],
            sub: gray[300],
          },
          border: {
            DEFAULT: gray[300],
            primary: orange[300],
          },
          shadow: {
            DEFAULT: whiteAlpha[800],
            highlight: whiteAlpha[700],
          },
          success: {
            DEFAULT: green[400],
            subtle: green[100],
          },
          warn: {
            DEFAULT: red[400],
            subtle: red[100],
          },
          publish: {
            success: green[400],
          },
        },
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      zIndex: {
        navBar: '1100',
        modal: '1300',
        modalOverlay: '1305',
        modalContent: '1310',
        selectPopup: '1320',
        tooltip: '1500',
        noti: '1600',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        popIn: {
          '0%': { transform: 'scale(0) translate(-50%, -50%)', opacity: '0' },
          '100%': { transform: 'scale(1) translate(-50%, -50%)', opacity: '1' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-out',
        popIn: 'popIn 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.3rem',
        sm: '0.15rem',
      },
    },
  },
  screens: {
    xs: { max: '480px' },
    sm: { max: '768px' },
    md: { max: '1024px' },
    lg: { max: '1280px' },
    xl: { min: '1281px' },
  },
  variants: {
    extend: {
      outline: ['focus'],
    },
  },

  extend: {
    // Adds a new breakpoint in addition to the default breakpoints
    screens: {
      spacing: {
        sm: '0.25rem',
        base: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
        '2xl': '2rem',
      },
    },
  },
  plugins: [tailwindcssRadix, tailwindcssTypography, tailwindcssAnimated],
} satisfies Config
