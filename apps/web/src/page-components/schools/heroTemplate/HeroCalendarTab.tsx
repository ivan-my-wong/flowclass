import { useEffect, useState } from 'react'

import { EventInput } from '@fullcalendar/core'

import { useSchoolContext } from '@/stores/schoolContext'
import { Course } from '@/types'
import { generateRecurringEvents } from '@/utils/calendar'

const HeroCalendarTab = (): JSX.Element => {
  const { schoolContext } = useSchoolContext()

  const [earliestStartDate, setEarliestStartDate] = useState<Date>(new Date())
  const [events, setEvents] = useState<EventInput[]>()
  const { courses, baseUrl } = schoolContext as {
    courses: Course[]
    baseUrl: string
  }

  useEffect(() => {
    if (courses) {
      const recur = generateRecurringEvents({ courses, baseUrl })
      const events = recur.events
      const earliest = recur.earliest

      if (events) {
        setEvents(events)
      }

      if (earliest) {
        setEarliestStartDate(earliest > new Date() ? earliest : new Date())
      }
    }
  }, [courses])

  return (
    <div id="contact" className="flex h-full w-full max-w-6xl flex-col items-center justify-center">
      {/* <div className="mt-6 flex h-full w-full flex-col overflow-y-visible p-6 pb-12">
        <Calendar
          events={events}
          initialDate={earliestStartDate}
          availableViews={['timeGridWeek']}
        />
      </div> */}
    </div>
  )
}

export default HeroCalendarTab
