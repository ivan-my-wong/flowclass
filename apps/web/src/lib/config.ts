/**
 * API base URL - always points to localhost API in open-source build.
 */
export const API_BASE_URL = 'http://localhost:3100'

/**
 * Base URL where the app is hosted. Defaults to same domain (window.location.origin).
 */
export const getBaseUrl = (): string =>
  (typeof window !== 'undefined' ? window.location.origin : '') ||
  process.env.NEXT_PUBLIC_WEB_BASE_URL ||
  ''
