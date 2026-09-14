/* eslint-disable import/order */
/* eslint-disable simple-import-sort/imports */
import useSiteData from '@/hooks/useSiteData'
import { styled } from '@/styles'
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
    <FullCalendarWrapper id="calendar">
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
    </FullCalendarWrapper>
  )
})
Calendar.displayName = 'Calendar'

// tried add css or create a styled component but it doesn't work
// need to add a wrapper to override the css
const FullCalendarWrapper = styled('div', {
  width: '100%',
  '.fc-header-toolbar': {
    '@sm': {
      flexDirection: 'column',
      gap: '$4',
    },

    '.fc-toolbar-title': {
      fontSize: '$5',
    },

    '.fc-button': {
      backgroundColor: 'transparent',
      color: '$text',
    },
    '.fc-button-active': {
      backgroundColor: 'transparent!important',
      border: '3px solid $colors$borderColor!important',
    },
  },

  '.fc-daygrid-day': {
    '&.fc-day-today': {
      border: '4px solid $colors$primaryHighlight',
      backgroundColor: '$backgroundLayer2',
    },
    '.fc-day-past': {
      backgroundColor: '$backgroundLayer2',
    },
    '.fc-daygrid-dot-event': {
      flexDirection: 'column',
      gap: '6px',
      '.fc-daygrid-event-dot': {
        height: '$1',
        width: '$1',
        borderRadius: '100%',
        borderColor: '$primaryHighlight',
        backgroundColor: '$primaryHighlight',
      },
    },
  },
})

export default Calendar
