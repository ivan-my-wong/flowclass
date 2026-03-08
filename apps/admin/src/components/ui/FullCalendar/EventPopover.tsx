import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/Popover'
import { dateFormatOptions } from '@/constants/fullCalendar'
import { useLanguage } from '@/hooks/useLanguage'
import type { CalendarEvent } from '@/types/fullCalendar.type'
import { cn } from '@/utils/cn'

import { useEvents } from './EventProvider'

type EventPopoverProps = {
  date: Date
  events: CalendarEvent[]
  children: React.ReactNode
}

export function EventPopover({ date, events, children }: EventPopoverProps) {
  const { language } = useLanguage()
  const { t } = useTranslation('calendar')
  const [isLoading, setIsLoading] = useState(false)
  const { onEventClick } = useEvents()
  const [isOpen, setIsOpen] = useState(false)
  const onClickEvent = async (event: CalendarEvent) => {
    // Close the popover
    setIsOpen(false)
    setIsLoading(true)
    try {
      await onEventClick?.(event)
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">
              {date.toLocaleDateString(language)}
            </h4>
            <p className="text-sm text-muted-foreground">
              {t('events.eventsForDay')}
            </p>
          </div>
          <div className="grid gap-2">
            {events.map(event => (
              <div
                key={event.id}
                className={cn(
                  isLoading && 'cursor-not-allowed pointer-events-none',
                  'grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 border-l-2 !h-fit rounded-l-md shadow py-2 text-left',
                  event.color || 'border-blue-500'
                )}
                role="button"
                aria-label={`Event: ${
                  event.title
                } from ${event.start.toLocaleTimeString()} to ${event.end.toLocaleTimeString()}`}
                aria-pressed="false"
                onClick={() => onClickEvent(event)}
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    onClickEvent(event)
                  }
                }}
              >
                <span className="flex h-2 w-2 translate-y-1" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {event.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {event.start.toLocaleTimeString(
                      language,
                      dateFormatOptions.clock
                    )}{' '}
                    -
                    {event.end.toLocaleTimeString(
                      language,
                      dateFormatOptions.clock
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
