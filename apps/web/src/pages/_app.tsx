import type { AppProps } from 'next/app'

import { RecoilRoot } from 'recoil'

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

export default function App({ Component, pageProps }: AppProps): JSX.Element {
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
