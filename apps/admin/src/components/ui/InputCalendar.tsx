import { ComponentPropsWithoutRef } from 'react'

import { format } from 'date-fns'
import { ControllerRenderProps } from 'react-hook-form/dist/types/controller'
import { LuCalendar } from 'react-icons/lu'

import { Button } from '@/components/ui/Button'
import { Calendar } from '@/components/ui/Calendar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { cn } from '@/utils/cn'

type PropTypes = {
  field: ControllerRenderProps<any, any>
  placeholder?: string
} & ComponentPropsWithoutRef<typeof Button>
const InputCalendar = ({ field, placeholder, ...props }: PropTypes) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          {...props}
          variant="outline"
          className={cn(
            'pl-3 text-left font-normal',
            !field.value && 'text-muted-foreground',
            props.className
          )}
        >
          {field.value ? (
            format(field.value, 'PPP')
          ) : (
            <span className="text-gray-500/70">
              {placeholder || 'Pick a date'}
            </span>
          )}
          <LuCalendar className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-auto p-0 z-popover" align="start">
        <Calendar
          mode="single"
          selected={field.value}
          onSelect={field.onChange}
          showOutsideDays
          showWeekNumber
        />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default InputCalendar
