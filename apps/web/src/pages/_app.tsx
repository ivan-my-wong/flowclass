import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

import { RecoilRoot } from 'recoil'

import TagManager, { TagManagerArgs } from 'react-gtm-module'
import { ReactQueryDevtools } from 'react-query/devtools'

import { CustomToastContainer } from '@/components/CustomProvider/CustomToastContainer'
import ThemeUpdater from '@/components/CustomProvider/ThemeUpdater'
import { QueryProvider } from '@/providers/QueryProvider'
import { SchoolProvider } from '@/stores/schoolContext'
import { TabProvider } from '@/stores/tabContext'

import '@/styles/globals.css'
import 'react-phone-input-2/lib/style.css'
import 'slick-carousel/slick/slick-theme.css'
import 'slick-carousel/slick/slick.css'

import '../firebase.config'

const tagManagerArgs: TagManagerArgs = {
  gtmId: process.env.NEXT_PUBLIC_GTM_TAG_ID || 'GTM-M8JMXGB',
  dataLayerName: 'PageDataLayer',
}

export default function App({ Component, pageProps }: AppProps): JSX.Element {
  const router = useRouter()

  useEffect(() => {
    TagManager.initialize(tagManagerArgs)

    const handleRouteChangeError = (err: any, url: string) => {
      // If the chunk failed to load, it means the app has been updated
      if (err.name === 'ChunkLoadError' || err.message.includes('Failed to load static file')) {
        if (!sessionStorage.getItem('chunk_reloaded')) {
          sessionStorage.setItem('chunk_reloaded', 'true')
          window.location.href = url
        }
      }
    }

    router.events.on('routeChangeError', handleRouteChangeError)

    // Clear the reload flag on successful load
    const handleRouteChangeComplete = () => {
      sessionStorage.removeItem('chunk_reloaded')
    }
    router.events.on('routeChangeComplete', handleRouteChangeComplete)

    return () => {
      router.events.off('routeChangeError', handleRouteChangeError)
      router.events.off('routeChangeComplete', handleRouteChangeComplete)
    }
  }, [router.events])
  return (
    <RecoilRoot>
      <QueryProvider>
        <SchoolProvider>
          <TabProvider>
            <ThemeUpdater />
            <ReactQueryDevtools />
            <Component {...pageProps} />
            <CustomToastContainer />
          </TabProvider>
        </SchoolProvider>
      </QueryProvider>
    </RecoilRoot>
  )
}
