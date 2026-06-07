import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import dayjs, { OpUnitType } from 'dayjs'
import { useTranslation } from 'react-i18next'
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu'
import { toast } from 'sonner'

import { Button } from '@/components/ui/Button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { viewTypes } from '@/constants/fullCalendar'
import { useLanguage } from '@/hooks/useLanguage'
import { CalendarViewType } from '@/types/fullCalendar.type'
import {
  formatCalendarDate,
  getEarliestDayOfDifferentUnit,
  getNextEndDateFromCalendarView,
} from '@/utils/date.utils'

import { Input } from '../Inputs/Input'

import AttendanceIndicatorBar from './AttendanceIndicatorBar'
import { useCalendar } from './CalendarProvider'

type CalendarHeaderProps = {
  className?: string
  hideViewModeSelection?: boolean
  hideAttendanceIndicator?: boolean
}

export function CalendarHeader({
  className,
  hideViewModeSelection,
  hideAttendanceIndicator,
}: CalendarHeaderProps): JSX.Element {
  const [params, setSearchParams] = useSearchParams()

  const {
    view,
    setView,
    currentDate,
    goToNextDay,
    goToPreviousDay,
    goToNextWeek,
    goToPreviousWeek,
    goToNextMonth,
    goToPreviousMonth,
    goToNextYear,
    goToPreviousYear,
    goToToday,
    numDays,
    setNumDays,
  } = useCalendar()

  const { t } = useTranslation('calendar')
  const { language } = useLanguage()
  const formatDate = useMemo(
    () => (date: Date) => {
      return formatCalendarDate(date, view, language)
    },
    [view, language]
  )

  const navigationHandlers = {
    day: { next: goToNextDay, previous: goToPreviousDay },
    schedule: { next: goToNextDay, previous: goToPreviousDay },
    nDays: { next: goToNextDay, previous: goToPreviousDay },
    week: { next: goToNextWeek, previous: goToPreviousWeek },
    month: { next: goToNextMonth, previous: goToPreviousMonth },
    year: { next: goToNextYear, previous: goToPreviousYear },
  } as const

  const handleNext = () => {
    const handler = navigationHandlers[view]

    if (!handler) throw new Error(`Unknown view: ${view}`)

    const nextDate = handler.next()

    const earliestDay = getEarliestDayOfDifferentUnit(nextDate, view)

    const objParams = Object.fromEntries(params.entries())
    setSearchParams({
      ...objParams,
      startDate: earliestDay.toISOString(),
      endDate: getNextEndDateFromCalendarView(earliestDay, view).toISOString(),
    })
  }

  const handlePrevious = () => {
    const handler = navigationHandlers[view]

    if (!handler) throw new Error(`Unknown view: ${view}`)

    const previousDate = handler.previous()

    const earliestDay = getEarliestDayOfDifferentUnit(previousDate, view)

    setSearchParams({
      ...params,
      startDate: earliestDay.toISOString(),
      endDate: getNextEndDateFromCalendarView(earliestDay, view).toISOString(),
    })
  }

  const handleGoToToday = () => {
    const today = goToToday()

    const earliestDay = getEarliestDayOfDifferentUnit(today, view)

    setSearchParams({
      ...params,
      startDate: earliestDay.toISOString(),
      endDate: getNextEndDateFromCalendarView(earliestDay, view).toISOString(),
    })
  }

  const handleNumDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value, 10)
    if (Number.isNaN(value) || value <= 0) {
      toast.error(t('errors.onlyPositiveNumber'))
      return
    }
    if (value > 31) {
      toast.error(t('errors.exceedDayLimit'))
      return
    }
    setNumDays(value)
  }

  return (
    <header
      className={`flex h-14 items-center justify-between gap-2 px-4 ${className}`}
    >
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={handleGoToToday}
          aria-label="Today"
          dataTestId="today-button"
        >
          {t('days.Today')}
        </Button>
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            dataTestId="previous-date-button"
            onClick={handlePrevious}
            aria-label="Previous"
          >
            <LuChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            dataTestId="next-date-button"
            onClick={handleNext}
            aria-label="Next"
          >
            <LuChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <h2
          className="font-semibold hidden md:block"
          role="presentation"
          aria-label="current-date"
          data-testid="current-date-header"
        >
          {formatDate(currentDate)}
        </h2>
      </div>
      {!hideAttendanceIndicator && (
        <div className="ml-auto">
          <AttendanceIndicatorBar />
        </div>
      )}
      {!hideViewModeSelection && (
        <div className="flex items-center">
          <Select
            value={view}
            onValueChange={(v: CalendarViewType) => {
              setView(v)
              if (['day', 'week', 'month', 'year'].includes(v)) {
                const startDate = dayjs().startOf(v as OpUnitType)
                const endDate = dayjs().endOf(v as OpUnitType)

                setSearchParams({
                  ...params,
                  startDate: startDate.toISOString(),
                  endDate: endDate.toISOString(),
                })
              }
            }}
            aria-label="View"
          >
            <SelectTrigger
              className="w-24 sm:w-32"
              data-testid="calendar-view-select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {viewTypes.map(view => (
                <SelectItem key={`select-view-${view}`} value={view}>
                  {t(`label.${view}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {view === 'nDays' && (
            <div className="flex items-center justify-end p-2 border-b">
              <Input
                type="number"
                min="1"
                value={numDays}
                data-testid="n-day-view-input"
                onChange={handleNumDaysChange}
                containerClassName="!w-20 mr-2"
              />
              <Button
                variant="outline"
                dataTestId="n-day-view-reset-button"
                onClick={() => setNumDays(3)}
              >
                {t('action.reset', { defaultValue: 'Reset' })}
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
