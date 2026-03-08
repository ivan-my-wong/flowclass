import React from 'react'

import { Arrow, Content, Portal, Root, Trigger } from '@radix-ui/react-popover'

import { cn } from '@/utils/cn'

type PopoverProps = {
  trigger: JSX.Element
  children: JSX.Element
  isDayPicker?: boolean
}

const Popover: React.FC<PopoverProps> = ({
  trigger,
  children,
  isDayPicker,
}) => (
  <Root>
    <Trigger asChild>{trigger}</Trigger>
    <Portal>
      <Content
        sideOffset={5}
        className={cn(
          'w-fit overflow-auto bg-background-layer-2 z-modal',
          'max-h-[var(--radix-popover-content-available-height)]',
          'max-w-[var(--radix-popover-content-available-width)]',
          'rounded-xl shadow-lg',
          'data-[state=open]:data-[side=top]:animate-slide-down-fade',
          'data-[state=open]:data-[side=right]:animate-slide-left-fade',
          'data-[state=open]:data-[side=bottom]:animate-slide-up-fade',
          'data-[state=open]:data-[side=left]:animate-slide-right-fade'
        )}
        style={{
          animationDuration: '400ms',
          animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          willChange: 'transform, opacity',
        }}
      >
        <div
          className="flex flex-col gap-2.5"
          style={{ padding: isDayPicker ? 0 : 20 }}
        >
          {children}
        </div>
        <Arrow className="fill-background-layer-2" />
      </Content>
    </Portal>
  </Root>
)

export default Popover
