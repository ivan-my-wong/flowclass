// Logo URLs for the "Trusted By" section
export const TRUSTED_INSTITUTIONS_LOGOS = [
  'https://flowclass.io/wp-content/uploads/249-Logos-3-1440x540.png',
  'https://flowclass.io/wp-content/uploads/Generation-Hong-Kong.png',
  'https://flowclass.io/wp-content/uploads/images-3.png',
  'https://flowclass.io/wp-content/uploads/mulogo.png',
  'https://flowclass.io/wp-content/uploads/images-2.jpeg',
  'https://flowclass.io/wp-content/uploads/cropped-下載.png',
  'https://flowclass.io/wp-content/uploads/lf-1694484906-Innoport-Logo-color.png',
  'https://flowclass.io/wp-content/uploads/249-Logos-3-1440x540.png',
  'https://flowclass.io/wp-content/uploads/Generation-Hong-Kong.png',
  'https://flowclass.io/wp-content/uploads/images-3.png',
  'https://flowclass.io/wp-content/uploads/mulogo.png',
  'https://flowclass.io/wp-content/uploads/images-2.jpeg',
  'https://flowclass.io/wp-content/uploads/cropped-下載.png',
  'https://flowclass.io/wp-content/uploads/lf-1694484906-Innoport-Logo-color.png',
  'https://flowclass.io/wp-content/uploads/249-Logos-3-2-1440x540.png',
  'https://flowclass.io/wp-content/uploads/cropped-下載.png',
  'https://flowclass.io/wp-content/uploads/lf-1694484906-Innoport-Logo-color.png',
  'https://flowclass.io/wp-content/uploads/249-Logos-2-2-1440x540.webp',
]

// Remove duplicates and clean up the list
export const UNIQUE_LOGOS = Array.from(
  new Set(TRUSTED_INSTITUTIONS_LOGOS.map(u => u.trim()))
)
