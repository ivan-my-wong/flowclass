import type { Config } from 'tailwindcss'
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

const config: Config = {
  darkMode: 'class',
  content: [
    './index.html',
    'src/**/*.{ts,tsx}',
    'src/pages/**/*.{ts,tsx}',
    'src/components/**/*.{ts,tsx}',
    'src/app/**/*.{ts,tsx}',
    'src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      theme: {
        extend: {
          colors: {
            warning: 'hsl(var(--warning))',
            'warning-foreground': 'hsl(var(--warning-foreground))',
          },
          fontFamily: {
            lato: [
              'Lato',
              'Segoe UI',
              'Helvetica Neue',
              'Helvetica',
              'Arial',
              'sans-serif',
            ],
          },
        },
      },
      colors: {
        primary: {
          DEFAULT: blue[600],
          subtle: blue[400],
          highlight: blue[800],
          foreground: 'white',
        },
        destructive: {
          DEFAULT: red[300],
          subtle: red[200],
          highlight: red[100],
          foreground: 'white',
        },
        secondary: {
          DEFAULT: yellow[700],
          subtle: yellow[500],
        },
        popover: {
          DEFAULT: 'white',
          foreground: 'black',
          disabled: gray[400],
        },
        tertiary: pink[400],
        background: {
          DEFAULT: 'white',
          'layer-2': gray[50],
          'layer-3': gray[100],
          'layer-4': gray[200],
          'primary-subtle': blue[50],
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
          primary: blue[700],
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
        whatsapp: '#75f94d',
        publish: {
          success: green[200],
        },
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
          popover: {
            DEFAULT: gray[900],
            foreground: 'white',
            disabled: gray[600],
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
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      // screens: {
      //   xs: { max: '480px' },
      //   sm: { max: '768px' },
      //   md: { max: '1024px' },
      //   lg: { max: '1280px' },
      //   xl: { min: '1281px' },
      // },
      spacing: {
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '2.5rem',
        '3xl': '3rem',
        '4xl': '3.5rem',
        '5xl': '4rem',
      },
      zIndex: {
        behind: '-1',
        default: '1',
        dropdown: '1000',
        sticky: '1020',
        fixed: '1030',
        'modal-backdrop': '1040',
        modal: '1050',
        popover: '1060',
        tooltip: '1070',
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
        'slide-left': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-right': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        'color-cycle': {
          '0%, 100%': { backgroundColor: 'rgb(var(--primary-rgb) / 0.9)' },
          '33%': { backgroundColor: 'rgb(147 51 234 / 0.9)' }, /* Purple */
          '66%': { backgroundColor: 'rgb(236 72 153 / 0.9)' }, /* Pink */
        },
        'slide-up-fade': {
          '0%': { opacity: '0', transform: 'translateY(2px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down-fade': {
          '0%': { opacity: '0', transform: 'translateY(-2px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-left-fade': {
          '0%': { opacity: '0', transform: 'translateX(2px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-right-fade': {
          '0%': { opacity: '0', transform: 'translateX(-2px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'dialog-overlay': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'dialog-content': {
          '0%': { opacity: '0', transform: 'translate(-50%, -48%) scale(0.96)' },
          '100%': { opacity: '1', transform: 'translate(-50%, -50%) scale(1)' },
        },
        dash: {
          '0%': { strokeDasharray: '1, 150', strokeDashoffset: '0' },
          '50%': { strokeDasharray: '90, 150', strokeDashoffset: '-35' },
          '100%': { strokeDasharray: '90, 150', strokeDashoffset: '-124' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'slide-left': 'slide-left 0.3s ease-out',
        'slide-right': 'slide-right 0.3s ease-out',
        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
        'color-cycle': 'color-cycle 6s ease-in-out infinite',
        'slide-up-fade': 'slide-up-fade 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down-fade': 'slide-down-fade 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-left-fade': 'slide-left-fade 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-right-fade': 'slide-right-fade 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        'dialog-overlay': 'dialog-overlay 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        'dialog-content': 'dialog-content 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        dash: 'dash 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} as Config

export default config
