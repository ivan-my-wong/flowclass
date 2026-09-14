import { useEffect } from 'react'

const FACEBOOK_SDK_ID = 'facebook-jssdk'
const DEFAULT_META_APP_ID = '1169305084905353'

declare global {
  interface Window {
    FB?: {
      init: (params: {
        appId: string
        autoLogAppEvents?: boolean
        xfbml?: boolean
        version: string
      }) => void
      login: (
        callback: (response: {
          authResponse?: { code?: string }
          status?: string
        }) => void,
        options?: Record<string, unknown>
      ) => void
    }
    fbAsyncInit?: () => void
    __metaFacebookAppId?: string
  }
}

export function FacebookSdk(): null {
  useEffect(() => {
    const configuredAppId =
      (import.meta as any).env?.VITE_META_APP_ID || DEFAULT_META_APP_ID
    const graphApiVersion = 'v21.0'

    window.fbAsyncInit = () => {
      if (!configuredAppId) return
      window.FB?.init({
        appId: configuredAppId,
        autoLogAppEvents: true,
        xfbml: true,
        version: graphApiVersion,
      })
      window.__metaFacebookAppId = configuredAppId
    }

    if (document.getElementById(FACEBOOK_SDK_ID)) {
      window.fbAsyncInit()
      return
    }

    const script = document.createElement('script')
    script.id = FACEBOOK_SDK_ID
    script.async = true
    script.defer = true
    script.crossOrigin = 'anonymous'
    script.src = 'https://connect.facebook.net/en_US/sdk.js'

    const firstScript = document.getElementsByTagName('script')[0]
    firstScript?.parentNode?.insertBefore(script, firstScript)
  }, [])

  return null
}

export default FacebookSdk
