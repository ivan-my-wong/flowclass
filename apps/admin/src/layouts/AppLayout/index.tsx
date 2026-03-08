import { Outlet } from 'react-router-dom'

import MenuBar from '@/components/MenuBar'

import AppHeader from './AppHeader'

const AppLayout = ({ children }: { children?: React.ReactNode }) => {
  return (
    <div className="flex flex-col h-screen">
      <div className="bg-background border-b-2 border-background-layer-3 h-12 z-default sm:block sm:sticky sm:top-0">
        <AppHeader />
      </div>
      <div className="flex max-h-[calc(100vh-3rem)] flex-1 sm:max-h-none">
        <aside className="sm:hidden">
          <MenuBar />
        </aside>
        <main className="flex-1 overflow-y-auto">
          <Outlet />
          {children}
        </main>
      </div>
    </div>
  )
}

export default AppLayout
