import * as dotenv from 'dotenv'
// Load order: .env.APP_ENV -> .env -> .env.local (last one wins)
// .env.local should have the highest precedence
const APP_ENV = process.env.APP_ENV || 'local'
const loadEnv = () => {
  if (APP_ENV) {
    dotenv.config({ path: `.env.${APP_ENV}`, override: false })
  }

  // Load .env before .env.local
  dotenv.config({ path: '.env', override: true })

  // Load .env.local last so it has the highest precedence
  dotenv.config({ path: '.env.local', override: true })
}

export default loadEnv
