import * as Collapsible from '@radix-ui/react-collapsible'
import { LuChevronRight, LuHelpCircle } from 'react-icons/lu'

import { useResponsive } from '@/hooks/useResponsive'
import { cn } from '@/utils/cn'

interface ICollapsibleSidebarProps {
  children: React.ReactNode
  className?: string
  isCollapsed: boolean
  onCollapse: (isOpen: boolean) => void
}

const CollapsibleSidebar = ({
  children,
  className,
  isCollapsed,
  onCollapse,
}: ICollapsibleSidebarProps): JSX.Element => {
  const { isMobile } = useResponsive()

  if (isMobile) {
    return (
      <>
        {/* Mobile Drawer Trigger Button */}
        <button
          type="button"
          aria-label={isCollapsed ? 'Close Drawer' : 'Open Drawer'}
          onClick={() => onCollapse(!isCollapsed)}
          className="group fixed bottom-6 right-6 z-50 flex items-center justify-center p-3 rounded-lg bg-background text-primary shadow-md transition-all duration-300 ease-in-out hover:bg-opacity-80 border border-blue-500"
        >
          <span className="flex items-center">
            <LuHelpCircle className="text-3xl mr-2" />
            <LuChevronRight
              className={cn(
                'text-3xl transition-transform duration-300 ease-in-out',
                isCollapsed ? 'rotate-90' : '-rotate-90' // Down for open, Up for closed
              )}
            />
          </span>
        </button>

        {/* Mobile Drawer Panel */}
        <div
          className={cn(
            'fixed inset-x-0 bottom-0 z-40 h-3/4 bg-background shadow-xl transition-transform duration-300 ease-in-out border-t border-gray-200 dark:border-gray-700',
            'flex flex-col',
            isCollapsed ? 'translate-y-0' : 'translate-y-full'
          )}
        >
          <div className="flex-grow overflow-y-auto p-4">{children}</div>
        </div>
      </>
    )
  }

  return (
    <Collapsible.Root
      open={isCollapsed}
      onOpenChange={onCollapse}
      className={cn('transition-all duration-500 relative', className)}
    >
      <div className="h-[calc(100vh-90px)]">
        <Collapsible.Content className="transform transition-all duration-300 ease-out data-[state=open]:translate-x-0 data-[state=open]:scale-100 data-[state=open]:opacity-100 data-[state=closed]:translate-x-full data-[state=closed]:scale-95 data-[state=closed]:opacity-0 origin-left">
          {children}
        </Collapsible.Content>

        <Collapsible.Trigger asChild>
          <button
            type="button"
            aria-label={isCollapsed ? 'Collapse sidebar' : 'Expand sidebar'}
            className="group fixed bottom-6 right-6 flex items-center justify-center p-3 rounded-lg bg-background text-primary shadow-md transition-all duration-500 ease-in-out hover:bg-opacity-80 border border-blue-500"
          >
            <span className="flex items-center">
              <LuHelpCircle className="text-3xl mr-2" />
              <LuChevronRight className="text-3xl transition-transform duration-500 ease-in-out group-data-[state=closed]:rotate-180" />
            </span>
          </button>
        </Collapsible.Trigger>
      </div>
    </Collapsible.Root>
  )
}

export default CollapsibleSidebar
