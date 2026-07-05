/**
 * API base URL - always points to localhost API in open-source build.
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (typeof window !== 'undefined' &&
  !['localhost', '127.0.0.1', '0.0.0.0'].includes(window.location.hostname)
    ? 'https://v2.apiv3.flowclass.io'
    : 'http://localhost:3100')

/**
 * Base URL where the app is hosted. Defaults to same domain (window.location.origin).
 */
export const getBaseUrl = (): string =>
  (typeof window !== 'undefined' ? window.location.origin : '') ||
  process.env.NEXT_PUBLIC_WEB_BASE_URL ||
  ''
