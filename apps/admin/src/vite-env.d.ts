/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_LEGACY_API_BASE_URL: string
  readonly VITE_DEBUG_COMMIT_HASH: string
  readonly VITE_API_BASE_LOCAL_URL: string
  readonly VITE_FLOWCLASS_URL: string
  readonly VITE_GTM_TAG_ID: string
  readonly VITE_E2E_TEST_URL: string
  readonly VITE_E2E_TEST_EMAIL: string
  readonly VITE_E2E_TEST_PASSWORD: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
