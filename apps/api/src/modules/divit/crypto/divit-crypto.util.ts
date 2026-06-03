import { createCipheriv, createDecipheriv, createHmac, randomBytes, timingSafeEqual } from 'crypto'
import * as fs from 'fs'
import { resolve } from 'path'

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

const ALGORITHM = 'aes-256-gcm'

export function encryptDivitKey(plaintext: string): string {
  const hexKey = process.env.DIVIT_ENCRYPTION_KEY
  if (!hexKey) throw new Error('DIVIT_ENCRYPTION_KEY is not set')
  const key = Buffer.from(hexKey, 'hex')
  const iv = randomBytes(12)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`
}

export function decryptDivitKey(stored: string): string {
  const hexKey = process.env.DIVIT_ENCRYPTION_KEY
  if (!hexKey) throw new Error('DIVIT_ENCRYPTION_KEY is not set')
  const [ivHex, tagHex, encryptedHex] = stored.split(':')
  const key = Buffer.from(hexKey, 'hex')
  const iv = Buffer.from(ivHex, 'hex')
  const tag = Buffer.from(tagHex, 'hex')
  const encrypted = Buffer.from(encryptedHex, 'hex')
  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)
  return decipher.update(encrypted).toString('utf8') + decipher.final('utf8')
}

export function verifyDivitWebhookSignature(
  rawBody: string,
  signatureHeader: string,
  signatureKey: string
): boolean {
  try {
    // Header format: t=TIMESTAMP,s1=SIGNATURE
    const parts = signatureHeader.split(',')
    if (parts.length < 2) return false
    const timestamp = parts[0].replace('t=', '')
    const receivedSig = parts[1].replace('s1=', '')

    const content = `${timestamp}.${rawBody}`
    const expectedSig = createHmac('sha256', signatureKey).update(content).digest('base64')

    const a = Buffer.from(receivedSig)
    const b = Buffer.from(expectedSig)
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}
