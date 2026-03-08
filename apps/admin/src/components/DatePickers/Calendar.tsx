/* eslint-disable import/order */
/* eslint-disable simple-import-sort/imports */
import useSiteData from '@/hooks/useSiteData'
import { CalendarOptions } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import momentTimezonePlugin from '@fullcalendar/moment-timezone'
import FullCalendar from '@fullcalendar/react'
import rrulePlugin from '@fullcalendar/rrule'
import timeGridPlugin from '@fullcalendar/timegrid'
import { forwardRef } from 'react'

export const minutesToHours = (minutes: number): string[] => {
  const hours = Math.floor(minutes / 60)
  const minutesRemainder = minutes % 60

  const hoursString = String(hours).padStart(2, '0')
  const minutesString = String(minutesRemainder).padStart(2, '0')

  return [hoursString, minutesString]
}

const Calendar = forwardRef<FullCalendar, CalendarOptions>((props, ref) => {
  const { useGetCurrentSiteTimeZone } = useSiteData()
  return (
    <div
      id="calendar"
      className="w-full [&_.fc-header-toolbar]:sm:flex-col [&_.fc-header-toolbar]:sm:gap-4 [&_.fc-toolbar-title]:text-xl [&_.fc-button]:bg-transparent [&_.fc-button]:text-text [&_.fc-button-active]:!bg-transparent [&_.fc-button-active]:!border-[3px] [&_.fc-button-active]:!border-border [&_.fc-daygrid-day.fc-day-today]:border-4 [&_.fc-daygrid-day.fc-day-today]:border-primary-highlight [&_.fc-daygrid-day.fc-day-today]:bg-background-layer-2 [&_.fc-daygrid-day_.fc-day-past]:bg-background-layer-2 [&_.fc-daygrid-dot-event]:flex [&_.fc-daygrid-dot-event]:flex-col [&_.fc-daygrid-dot-event]:gap-1.5 [&_.fc-daygrid-event-dot]:h-1 [&_.fc-daygrid-event-dot]:w-1 [&_.fc-daygrid-event-dot]:rounded-full [&_.fc-daygrid-event-dot]:border-primary-highlight [&_.fc-daygrid-event-dot]:bg-primary-highlight"
    >
      <FullCalendar
        ref={ref}
        height="auto"
        timeZone={useGetCurrentSiteTimeZone()}
        plugins={[
          rrulePlugin,
          momentTimezonePlugin,
          dayGridPlugin,
          timeGridPlugin,
          listPlugin,
          interactionPlugin,
        ]}
        initialView="listMonth"
        headerToolbar={{
          start: 'title',
          center: 'today prev,next',
          end: 'listMonth,dayGridMonth',
        }}
        {...props}
      />
    </div>
  )
})
Calendar.displayName = 'Calendar'

export default Calendar
