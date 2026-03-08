import { createContext, useContext, useState } from 'react'

import type React from 'react'

type SidebarContextType = {
  isCollapsed: boolean
  setIsCollapsed: (isCollapsed: boolean) => void
  toggleSidebar: () => void
}

const CalendarSidebarContext = createContext<SidebarContextType | undefined>(
  undefined
)

export function CalendarSidebarProvider({
  children,
}: {
  children: React.ReactNode
}): JSX.Element {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggleSidebar = () => {
    setIsCollapsed(prev => !prev)
  }

  return (
    <CalendarSidebarContext.Provider
      value={{
        isCollapsed,
        setIsCollapsed,
        toggleSidebar,
      }}
    >
      {children}
    </CalendarSidebarContext.Provider>
  )
}

export function useCalendarSidebar(): SidebarContextType {
  const context = useContext(CalendarSidebarContext)
  if (!context) {
    throw new Error(
      'useCalendarSidebar must be used within a CalendarSidebarProvider'
    )
  }
  return context
}
