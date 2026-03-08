import * as dotenv from 'dotenv'
import * as path from 'path'

// Load from monorepo root (one .env for all apps)
const rootDir = path.resolve(__dirname, '../../..')
const loadEnv = () => {
  const NODE_ENV = process.env.NODE_ENV || 'development'
  dotenv.config({ path: path.join(rootDir, `.env.${NODE_ENV}`), override: false })
  dotenv.config({ path: path.join(rootDir, '.env'), override: true })
  dotenv.config({ path: path.join(rootDir, '.env.local'), override: true })
}

export default loadEnv
