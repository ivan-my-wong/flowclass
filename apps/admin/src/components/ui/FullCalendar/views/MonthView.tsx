import { useMemo } from 'react'

import { useTranslation } from 'react-i18next'

import { DAYS } from '@/constants/fullCalendar'
import { CalendarViewProps } from '@/types/fullCalendar.type'

import { useCalendar } from '../CalendarProvider'
import { MonthViewDropzone } from '../MonthViewDropzone'

import ColumnViewWrapper from './ColumnViewWrapper'

const MonthView = ({ customItemFn }: CalendarViewProps): JSX.Element => {
  const { currentDate } = useCalendar()

  const { t } = useTranslation('calendar')
  const getDaysInMonth = useMemo(
    () => (date: Date) => {
      const year = date.getFullYear()
      const month = date.getMonth()
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      const daysInMonth = lastDay.getDate()
      const startingDay = firstDay.getDay()

      // Get the previous month's days that should appear
      const prevMonth = new Date(year, month - 1, 1)
      const prevMonthLastDay = new Date(year, month, 0).getDate()
      const prevMonthDays = Array.from({ length: startingDay }, (_, i) => ({
        date: new Date(
          prevMonth.getFullYear(),
          prevMonth.getMonth(),
          prevMonthLastDay - startingDay + i + 1
        ),
        isCurrentMonth: false,
      }))

      // Current month's days
      const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => ({
        date: new Date(year, month, i + 1),
        isCurrentMonth: true,
      }))

      // Calculate how many next month's days we need
      const totalDays = prevMonthDays.length + currentMonthDays.length
      const nextMonthDays = Array.from({ length: 42 - totalDays }, (_, i) => ({
        date: new Date(year, month + 1, i + 1),
        isCurrentMonth: false,
      }))

      return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays]
    },
    []
  )

  const allDays = useMemo(
    () => getDaysInMonth(currentDate),
    [currentDate, getDaysInMonth]
  )

  return (
    <ColumnViewWrapper data-testid="month-view" aria-label="Month View">
      <div className="grid grid-cols-7 border-b">
        {DAYS.map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium">
            {t(`days.${day}`)}
          </div>
        ))}
      </div>
      <div className="flex-1 divide-y">
        <div className="grid grid-cols-7 divide-x divide-y divide-gray-300 border-b border-gray-300">
          {allDays.map(({ date, isCurrentMonth }, index) => {
            return (
              <MonthViewDropzone
                key={date.toISOString()}
                date={date}
                isCurrentMonth={isCurrentMonth}
                customItemFn={customItemFn}
              />
            )
          })}
        </div>
      </div>
    </ColumnViewWrapper>
  )
}

export default MonthView
