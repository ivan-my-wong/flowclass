import { config } from 'dotenv'

const APP_ENV = process.env.APP_ENV || 'local'

export const initEnv = () => {
  // Load order: .env.APP_ENV.local -> .env.APP_ENV -> .env -> .env.local (last one wins)
  // .env.local should have the highest precedence and override all previous values
  if (APP_ENV) {
    config({ path: `.env.${APP_ENV}`, override: false })
  }

  // Load .env before .env.local (will be overridden by .env.local)
  config({ path: '.env', override: true })

  // Load .env.local last so it has the highest precedence and overrides all previous values
  config({ path: '.env.local', override: true })
}
