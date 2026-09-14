import { getApp, getApps, initializeApp } from 'firebase/app'

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || ''
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || ''
const databaseURL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || ''
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || ''
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || ''
const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || ''
const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ''
const measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ''

const config = {
  apiKey,
  authDomain,
  databaseURL,
  projectId,
  storageBucket,
  messagingSenderId,
  appId,
  measurementId,
}

let app: any = null
if (getApps().length > 0) {
  app = getApp()
} else if (apiKey) {
  app = initializeApp(config)
}

export default app
