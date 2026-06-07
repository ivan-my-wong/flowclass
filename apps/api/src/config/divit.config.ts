import * as fs from 'fs'
import * as Joi from 'joi'
import { resolve } from 'path'

export type DivitConfig = {
  DIVIT_ENCRYPTION_KEY: string
  DIVIT_WEBHOOK_BASE_URL?: string
}

// Safely load ONLY DIVIT_ environment variables from monorepo root to avoid overriding other local dev env vars like DATABASE_HOST
function loadDivitEnv() {
  const possiblePaths = [
    resolve(process.cwd(), '.env'),
    resolve(process.cwd(), '../../.env'),
    resolve(__dirname, '../../../../../../.env'),
    resolve(__dirname, '../../../../../../.env.local'),
  ]

  for (const envPath of possiblePaths) {
    try {
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8')
        content.split(/\r?\n/).forEach(line => {
          const trimmed = line.trim()
          if (!trimmed || trimmed.startsWith('#')) return
          const parts = trimmed.split('=')
          if (parts.length >= 2) {
            const key = parts[0].trim()
            const val = parts.slice(1).join('=').trim()
            if (key.startsWith('DIVIT_')) {
              process.env[key] = val
            }
          }
        })
      }
    } catch (e) {
      // Ignore
    }
  }
}

loadDivitEnv()

export const divitConfigSchema = Joi.object<DivitConfig>({
  DIVIT_ENCRYPTION_KEY: Joi.string().allow('').default(''),
  DIVIT_WEBHOOK_BASE_URL: Joi.string().allow('').default(''),
}).required()
