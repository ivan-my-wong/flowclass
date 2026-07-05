/**
 * API base URL - always points to localhost API in open-source build.
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' &&
  !['localhost', '127.0.0.1', '0.0.0.0'].includes(window.location.hostname)
    ? 'https://v2.apiv3.flowclass.io'
    : 'http://localhost:3100')

/**
 * Base URL where the app is hosted. Defaults to same domain (window.location.origin) when not set.
 */
export const getBaseUrl = (): string =>
  import.meta.env.VITE_ADMIN_BASE_URL ||
  (typeof window !== 'undefined' ? window.location.origin : '') ||
  ''

/**
 * Domain derived from base URL (e.g. "localhost" or "example.com").
 */
export const getAppDomain = (): string => {
  const base = getBaseUrl()
  if (base) {
    try {
      return new URL(base).hostname
    } catch {
      return 'localhost'
    }
  }
  return typeof window !== 'undefined' ? window.location.hostname : 'localhost'
}
