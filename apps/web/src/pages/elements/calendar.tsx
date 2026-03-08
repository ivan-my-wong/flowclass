import { GetServerSidePropsContext, InferGetServerSidePropsType, NextPage } from 'next'
import { useEffect, useMemo, useState } from 'react'

import { EventClickArg, EventInput } from '@fullcalendar/core'

import CalendarPage from '@/components/Calendar/Calendar'
import { Course } from '@/types'
import { EmbeddedComponentParams } from '@/types/embed-component'
import { generateRecurringEvents } from '@/utils/calendar'
import { CustomPathProps, getPathRelatedData } from '@/utils/domain'

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const props = (await getPathRelatedData(context)) as { props: CustomPathProps }
  const { query } = context
  const otherParams = query as EmbeddedComponentParams

  return {
    props: {
      courses: props.props.courseProps.courses as Course[],
      ...otherParams,
    },
  }
}

type PageProps = InferGetServerSidePropsType<typeof getServerSideProps>

const Calendar: NextPage<PageProps> = ({ courses, height, width }) => {
  const otherStyles = useMemo(() => {
    if (height && width) {
      return { width: `${width}px`, height: `${height}px` }
    }
    return {
      width: `100%`,
    }
  }, [width, height])

  const [earliestStartDate, setEarliestStartDate] = useState<Date>(new Date())
  const [events, setEvents] = useState<EventInput[]>()

  useEffect(() => {
    if (courses) {
      const recur = generateRecurringEvents({ courses, baseUrl: '/@' })
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

  const handleEventClick = (clickInfo: EventClickArg) => {
    clickInfo.jsEvent.preventDefault()

    if (clickInfo.event.url) {
      window.open(clickInfo.event.url, '_blank')
    }
  }

  return (
    <div style={otherStyles} className="p-3">
      <CalendarPage
        events={events}
        initialDate={earliestStartDate}
        availableViews={['timeGridWeek']}
        eventClick={handleEventClick}
      />
    </div>
  )
}

export default Calendar
