import React, { ReactElement, useRef } from 'react'

import { cn } from '@/utils/cn'

type Props = {
  children: ReactElement
  open: boolean
  onClose?: () => void
  maxWidth?: string
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Drawer = ({ children, open, onClose, maxWidth }: Props) => {
  const refDrawer = useRef<HTMLDivElement>(null)

  return (
    <div
      className={cn(
        'h-screen fixed top-0 w-screen right-0 z-[1050] transition-[visibility_0s,opacity_0.15s_ease-out]',
        open ? 'visible opacity-100' : 'invisible opacity-0'
      )}
    >
      <div className="absolute bg-text-subtle/50 w-screen h-screen" />
      <div
        ref={refDrawer}
        className={cn(
          'absolute bg-background-layer-2 shadow-md top-0 right-0 px-2 py-8 h-screen overflow-y-auto',
          maxWidth
            ? 'w-full'
            : 'max-w-[500px] min-w-[600px] sm:min-w-[95%] xs:p-5'
        )}
        style={maxWidth ? { maxWidth } : undefined}
      >
        {children}
      </div>
    </div>
  )
}

export default Drawer
