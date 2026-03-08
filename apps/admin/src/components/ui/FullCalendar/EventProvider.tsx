import { createContext, useContext, useState } from 'react'

import { isDate } from 'lodash-es'
import type React from 'react'

import { HOUR_HEIGHT_PX, MINUTES_IN_HOUR } from '@/constants/fullCalendar'
// import { sampleEvents } from '@/data/sample-event'
import type { CalendarEvent } from '@/types/fullCalendar.type'
import dayjs from '@/utils/dayjs'

type EventContextType = {
  events: CalendarEvent[]
  addEvent: (event: CalendarEvent) => void
  updateEvent: (event: CalendarEvent) => void
  deleteEvent: (id: string) => void
  getEventsForDay: (date: Date, events: CalendarEvent[]) => CalendarEvent[]
  calculateEventWidth: (
    event: CalendarEvent,
    eventsForDay: CalendarEvent[],
    divider?: number
  ) => { width: string; left: string }
  filterEventMultipleDays: (
    event: CalendarEvent,
    date: Date,
    hour: number
  ) => boolean
  calculateEventPosition: (
    event: CalendarEvent,
    date: Date
  ) => {
    top: string
    height: string
  }
  onEventClick?: (event: CalendarEvent) => void
  setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>
}

const EventContext = createContext<EventContextType | undefined>(undefined)
type EventProviderProps = {
  children: React.ReactNode
  onEventClick?: (event: CalendarEvent) => void
  initialEvents?: CalendarEvent[]
}
export function EventProvider({
  children,
  onEventClick,
  initialEvents = [],
}: EventProviderProps): JSX.Element {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents)

  const addEvent = (event: CalendarEvent) => {
    setEvents(prevEvents => [...prevEvents, event])
  }

  const updateEvent = (updatedEvent: CalendarEvent) => {
    setEvents(prevEvents =>
      prevEvents.map(event =>
        event.id === updatedEvent.id ? updatedEvent : event
      )
    )
  }

  const deleteEvent = (id: string) => {
    setEvents(prevEvents => prevEvents.filter(event => event.id !== id))
  }

  const filterEventMultipleDays = (
    event: CalendarEvent,
    date: Date,
    hour: number
  ): boolean =>
    (event.start.getHours() === hour &&
      event.start.getDay() === date.getDay()) ||
    (dayjs(
      new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, 0, 0)
    ).isBetween(event.start, event.end, 'hour', '[]') &&
      hour === 0)

  const getEventsForDay = (date: Date, events: CalendarEvent[]) => {
    // Prevent duplicate events

    return [
      ...events.filter(event =>
        dayjs(date).isBetween(event.start, event.end, 'day', '[]')
      ),
    ].sort((a, b) => a.start.getTime() - b.start.getTime())
  }

  const calculateEventWidth = (
    event: CalendarEvent,
    eventsForDay: CalendarEvent[],
    divider = 50
  ) => {
    // This overlapping should be overlaps each hour not all all hours in a day
    const overlappingEvents = eventsForDay.filter(
      e => e.start < event.end && e.end > event.start
    )
    const position = overlappingEvents.indexOf(event)
    const width = divider / overlappingEvents.length
    return {
      width: `${width}%`,
      left: `${position * width}%`,
    }
  }

  const calculateEventPosition = (event: CalendarEvent, date: Date) => {
    let startHour
    let startMinute
    let endHour
    let endMinute
    let eventStart = event.start
    let eventEnd = event.end

    if (!isDate(event.start) || !isDate(event.end)) {
      startHour = new Date(event.start).getHours()
      startMinute = new Date(event.start).getMinutes()
      endHour = new Date(event.end).getHours()
      endMinute = new Date(event.end).getMinutes()
      eventStart = new Date(event.start)
      eventEnd = new Date(event.end)
    } else {
      startHour = event.start.getHours()
      startMinute = event.start.getMinutes()
      endHour = event.end.getHours()
      endMinute = event.end.getMinutes()
    }

    if (event.isMultipleDays) {
      if (eventStart.getDay() === date.getDay()) {
        endHour = 23
        endMinute = 59
      } else if (eventEnd.getDay() !== date.getDay()) {
        startHour = 0
        endHour = 23
        endMinute = 59
      } else {
        startHour = 0
        startMinute = 0
        endHour = eventEnd.getHours()
        endMinute = eventEnd.getMinutes()
      }
    }
    const duration =
      endHour +
      endMinute / MINUTES_IN_HOUR -
      (startHour + startMinute / MINUTES_IN_HOUR)

    return {
      top: `${(startHour + startMinute / MINUTES_IN_HOUR) * HOUR_HEIGHT_PX}px`,
      height: `${duration * HOUR_HEIGHT_PX}px`,
    }
  }
  return (
    <EventContext.Provider
      value={{
        events,
        addEvent,
        updateEvent,
        deleteEvent,
        getEventsForDay,
        calculateEventWidth,
        calculateEventPosition,
        filterEventMultipleDays,
        onEventClick,
        setEvents,
      }}
    >
      {children}
    </EventContext.Provider>
  )
}

export function useEvents() {
  const context = useContext(EventContext)
  if (!context) {
    throw new Error('useEvents must be used within an EventProvider')
  }
  return context
}
