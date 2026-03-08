import { config } from 'dotenv'
import * as path from 'path'

// Load from monorepo root (one .env for all apps)
const rootDir = process.cwd()

export const initEnv = () => {
  const NODE_ENV = process.env.NODE_ENV || 'development'
  config({ path: path.join(rootDir, `.env.${NODE_ENV}`), override: false })
  config({ path: path.join(rootDir, '.env'), override: true })
  config({ path: path.join(rootDir, '.env.local'), override: true })
}
