/* eslint-disable simple-import-sort/imports */
import React from 'react'
import { BrowserRouter } from 'react-router-dom'

import { TourProvider } from '@reactour/tour'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { createRoot } from 'react-dom/client'
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import { RecoilRoot } from 'recoil'

import App from './App'
import { tourProviderConfig } from './constants/config'

import './i18n'
import './utils/wakeLock'
import { Toaster } from './components/ui/Sonner'

const buildInfo = {
  commitHash: import.meta.env.VITE_DEBUG_COMMIT_HASH || '',
}

;(window as any).buildInfo = buildInfo
const queryCache = new QueryCache({})
const mutationCache = new MutationCache({})
const queryClient = new QueryClient({
  queryCache,
  mutationCache,
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
})

const container = document.getElementById('root')
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!)

root.render(
  <React.StrictMode>
    <RecoilRoot>
      <QueryClientProvider client={queryClient}>
        <DndProvider backend={HTML5Backend}>
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <TourProvider {...tourProviderConfig}>
              <App />
            </TourProvider>
            <ReactQueryDevtools />
            <Toaster />
          </BrowserRouter>
        </DndProvider>
      </QueryClientProvider>
    </RecoilRoot>
  </React.StrictMode>
)
