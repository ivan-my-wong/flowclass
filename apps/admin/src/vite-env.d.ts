/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ADMIN_BASE_URL: string
  readonly VITE_WEB_BASE_URL: string
  readonly VITE_DEBUG_COMMIT_HASH?: string
  readonly VITE_DEPLOY_MODE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
