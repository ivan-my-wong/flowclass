import { LuCalendar } from 'react-icons/lu'
import { useRecoilValue } from 'recoil'

import { dateFormatOptions } from '@/constants/fullCalendar'
import { displayLanguageState } from '@/stores/displayLanguage'
import { CalendarEvent } from '@/types/fullCalendar.type'

export function WeeklyEventView({
  event,
}: {
  event: CalendarEvent
}): JSX.Element {
  const language = useRecoilValue(displayLanguageState)
  return (
    <div className="flex flex-col gap-1">
      <div className="flex text-xs text-muted-foreground">
        <LuCalendar className="mr-2 h-4 w-4 opacity-70" />{' '}
        {event.start.toLocaleDateString(
          language,
          dateFormatOptions.shortDateTime
        )}
      </div>

      <div className="flex text-xs text-muted-foreground">
        <LuCalendar className="mr-2 h-4 w-4 opacity-70" />{' '}
        {event.end.toLocaleDateString(
          language,
          dateFormatOptions.shortDateTime
        )}
      </div>
    </div>
  )
}
