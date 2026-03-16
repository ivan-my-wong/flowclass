import { lightThemeColors } from './colorTheme'

/**
 * Theme object for runtime color values used in inline styles.
 * Use Tailwind classes (text-primary, bg-background, etc.) when possible.
 */
export const theme = {
  colors: lightThemeColors,
  zIndices: {
    tooltip: 1070,
    popover: 1060,
    modal: 1050,
    dropdown: 1000,
  },
}

/**
 * Use Tailwind's animate-spin class for loading spinners.
 * Example: className="animate-spin"
 */
export const loadingSpinner = 'animate-spin'
