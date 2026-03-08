import { LuClock } from 'react-icons/lu'
import { useRecoilValue } from 'recoil'

import { dateFormatOptions } from '@/constants/fullCalendar'
import { displayLanguageState } from '@/stores/displayLanguage'
import { CalendarEvent } from '@/types/fullCalendar.type'

export function DailyEventTime({
  event,
}: {
  event: CalendarEvent
}): JSX.Element {
  const language = useRecoilValue(displayLanguageState)
  return (
    <div className="flex items-center">
      <LuClock className="mr-2 h-4 w-4 opacity-70" aria-hidden="true" />{' '}
      <span className="text-xs text-muted-foreground">
        <span className="sr-only">Event time: </span>
        {event.start.toLocaleTimeString(language, dateFormatOptions.clock)}{' '}
        <span aria-hidden="true">-</span>{' '}
        {event.end.toLocaleTimeString(language, dateFormatOptions.clock)}
      </span>
    </div>
  )
}
