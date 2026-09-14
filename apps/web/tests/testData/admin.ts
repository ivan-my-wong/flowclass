// Environment variables are loaded in the following order:
// 1. .env.local (highest priority)
// 2. .env.development or .env.production (based on environment)
// 3. .env (lowest priority)

// Next.js automatically handles this priority, so we just need to use process.env
export const testAdminUrl = process.env.NEXT_PUBLIC_E2E_TEST_ADMIN_URL || 'http://localhost:5173'

export const testLoginPayload = {
  email: process.env.NEXT_PUBLIC_E2E_TEST_EMAIL || 'crssultontest+1@gmail.com',
  password: process.env.NEXT_PUBLIC_E2E_TEST_PASSWORD || 'Password@123',
}
