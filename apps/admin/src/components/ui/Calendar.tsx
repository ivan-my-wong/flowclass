import * as React from 'react'

import {
  LuChevronDown,
  LuChevronLeft,
  LuChevronRight,
  LuChevronUp,
} from 'react-icons/lu'

import { DayPicker } from 'react-day-picker'

import { cn } from '@/utils/cn'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-1', className)}
      components={{
        IconDropdown: ({ orientation }: any) => {
          const className = 'h-4 w-4 cursor-pointer'
          switch (orientation) {
            case 'down':
              return <LuChevronDown className={className} />
            case 'up':
              return <LuChevronUp className={className} />
            case 'left':
              return <LuChevronLeft className={className} />
            case 'right':
              return <LuChevronRight className={className} />
            default:
              return null
          }
        },
      }}
      {...props}
    />
  )
}

Calendar.displayName = 'Calendar'

export { Calendar }
