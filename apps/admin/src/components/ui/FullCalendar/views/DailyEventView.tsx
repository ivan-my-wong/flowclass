import { LuCalendar } from 'react-icons/lu'
import { useRecoilValue } from 'recoil'

import { dateFormatOptions } from '@/constants/fullCalendar'
import { displayLanguageState } from '@/stores/displayLanguage'
import type { CalendarEvent } from '@/types/fullCalendar.type'

export function DailyEventView({
  event,
}: {
  event: CalendarEvent
}): JSX.Element {
  const language = useRecoilValue(displayLanguageState)
  return (
    <>
      <LuCalendar className="mr-2 h-4 w-4 opacity-70" aria-hidden="true" />{' '}
      <span className="text-xs text-muted-foreground">
        {event.start.toLocaleDateString(language, {
          ...dateFormatOptions.dateMonthName,
          weekday: 'long',
        })}
      </span>
    </>
  )
}
