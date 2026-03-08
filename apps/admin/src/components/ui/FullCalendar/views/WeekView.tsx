import { useMemo, useRef, useState } from 'react'

import { useTranslation } from 'react-i18next'

import { dateFormatOptions, DAYS, HOURS } from '@/constants/fullCalendar'
import { useLanguage } from '@/hooks/useLanguage'
import type { CalendarViewProps } from '@/types/fullCalendar.type'
import {
  getHighlightedMinutesForHour,
  handleClick,
  handleDragEnd,
  handleDragMove,
  handleDragStart,
} from '@/utils/calendar-drag.utils'
import { cn } from '@/utils/cn'
import { formatHourCalendar } from '@/utils/date.utils'

import { useCalendar } from '../CalendarProvider'
import { DayViewGridItem } from '../DayViewDropzone'
import WeekViewEvents from '../WeekViewEvents'

import ColumnViewWrapper from './ColumnViewWrapper'

type WeekStartDay = 0 | 1 | 6 // Sunday = 0, Monday = 1, Saturday = 6

const WeekView = ({
  onTimeSlotSelect,
  customItemFn,
}: CalendarViewProps): JSX.Element => {
  const { currentDate } = useCalendar()
  const { t } = useTranslation('calendar')
  const { language } = useLanguage()

  // Drag state
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartTime, setDragStartTime] = useState<Date | null>(null)
  const [dragEndTime, setDragEndTime] = useState<Date | null>(null)
  const isMouseDownRef = useRef(false)

  const dragState = {
    isDragging,
    dragStartTime,
    dragEndTime,
    isMouseDownRef,
    setIsDragging,
    setDragStartTime,
    setDragEndTime,
  }

  const getWeekDates = useMemo(
    () =>
      (date: Date, weekStartDay: WeekStartDay = 0) => {
        const week: Date[] = []
        const start = new Date(date)
        const diff = (start.getDay() - weekStartDay + 7) % 7
        start.setDate(start.getDate() - diff)

        for (let i = 0; i < 7; i++) {
          week.push(new Date(start))
          start.setDate(start.getDate() + 1)
        }
        return week
      },
    []
  )

  const weekDates = useMemo(
    () => getWeekDates(currentDate),
    [currentDate, getWeekDates]
  )

  return (
    <ColumnViewWrapper data-testid="week-view" aria-label="Week View">
      <div className="flex border-b">
        <div className="w-16 flex-none" />
        {weekDates.map((date, index) => (
          <div
            key={`${date.toISOString()}-days`}
            className="flex-1 border-l p-2 text-center"
          >
            <div className="text-sm font-medium">
              {t(`days.${DAYS[index]}`)}
            </div>
            <div className="text-xs text-muted-foreground">
              {date.toLocaleDateString(
                language,
                dateFormatOptions.shortMonthDay
              )}
            </div>
          </div>
        ))}
      </div>
      <div
        className="flex flex-1"
        onMouseUp={() => handleDragEnd(onTimeSlotSelect, dragState)}
        onMouseLeave={() => handleDragEnd(onTimeSlotSelect, dragState)}
        role="presentation"
      >
        <div className="w-16 flex-none bg-muted/5">
          {HOURS.map(hour => (
            <div key={hour} className="relative h-14 text-xs">
              <span
                className={cn(
                  'absolute -top-2.5 right-4 text-muted-foreground',
                  hour === 0 && 'opacity-0'
                )}
              >
                {formatHourCalendar(hour)}
              </span>
            </div>
          ))}
        </div>
        <div className="relative flex-1">
          <div className="absolute inset-0 flex">
            {weekDates.map(date => (
              <div
                key={`${date.toISOString()}-hours`}
                className="flex-1 border-l border-gray-300 first:border-black/50"
              >
                {HOURS.map(hour => (
                  <DayViewGridItem
                    key={hour}
                    hour={hour}
                    date={date}
                    highlightedMinutes={getHighlightedMinutesForHour(
                      hour,
                      date,
                      dragState
                    )}
                    onDragStart={(h, m) =>
                      handleDragStart(h, m, date, dragState)
                    }
                    onDragMove={(h, m) => handleDragMove(h, m, date, dragState)}
                    onClick={(h, m) =>
                      handleClick(h, m, date, onTimeSlotSelect, dragState)
                    }
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="absolute inset-0 flex">
            {weekDates.map(date => (
              <WeekViewEvents
                key={`${date.toISOString()}-events`}
                date={date}
                customItemFn={customItemFn}
              />
            ))}
          </div>
        </div>
      </div>
    </ColumnViewWrapper>
  )
}

export default WeekView
