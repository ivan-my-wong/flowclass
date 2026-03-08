import { lightThemeColors } from './colorTheme'

/**
 * Theme object for runtime color values used in inline styles.
 * Use Tailwind classes (text-primary, bg-background, etc.) when possible.
 */
export const theme = {
  colors: lightThemeColors,
}

/**
 * Use Tailwind's animate-spin class for loading spinners.
 * Example: className="animate-spin"
 */
export const loadingSpinner = 'animate-spin'
