import { getApp, getApps, initializeApp } from 'firebase/app'

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || ''
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || ''
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || ''
const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || ''
const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || ''
const appId = import.meta.env.VITE_FIREBASE_APP_ID || ''
const measurementId = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ''

const config = {
  apiKey,
  authDomain,
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

