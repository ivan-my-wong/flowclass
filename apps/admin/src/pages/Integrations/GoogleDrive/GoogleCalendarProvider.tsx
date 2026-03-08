import { useEffect, useState } from 'react'

// Extend the Window interface to include the gapi property
declare global {
  interface Window {
    gapi: any
  }
}

interface GoogleCalendarProviderProps {
  children: React.ReactNode
}

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

const GoogleCalendarProvider = ({ children }: GoogleCalendarProviderProps) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadGoogleAPI = () => {
      const script1 = document.createElement('script')
      script1.src = 'https://apis.google.com/js/api.js'
      script1.async = true
      script1.defer = true
      script1.onload = () => {
        const script2 = document.createElement('script')
        script2.src = 'https://accounts.google.com/gsi/client'
        script2.async = true
        script2.defer = true
        script2.onload = initializeGoogleAPI
        document.body.appendChild(script2)
      }
      document.body.appendChild(script1)
    }

    const initializeGoogleAPI = () => {
      if (!GOOGLE_API_KEY || !GOOGLE_CLIENT_ID) {
        setError('Google Calendar API credentials are not configured')
        setIsLoading(false)
        return
      }

      window.gapi.load('client', async () => {
        try {
          await window.gapi.client.init({
            apiKey: GOOGLE_API_KEY,
            discoveryDocs: [
              'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
            ],
          })
          setIsLoading(false)
        } catch (err) {
          setError('Failed to initialize Google Calendar API')
          setIsLoading(false)
        }
      })
    }

    loadGoogleAPI()

    return () => {
      // Cleanup scripts on unmount
      const scripts = document.querySelectorAll(
        'script[src*="google"][src*="api"]'
      )
      scripts.forEach(script => script.remove())
    }
  }, [])

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  if (isLoading) {
    return <div>Loading Google Calendar API...</div>
  }

  return <>{children}</>
}

export default GoogleCalendarProvider
