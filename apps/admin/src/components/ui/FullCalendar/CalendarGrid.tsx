// eslint-disable-next-line simple-import-sort/imports

// eslint-disable-next-line simple-import-sort/imports
import { Spinner } from '@/components/Loaders/Spinner'
import { CustomItemFn } from '@/types/fullCalendar.type'

import { useCalendar } from './CalendarProvider'
import DayView from './views/DayView'
import MonthView from './views/MonthView'
import NDaysView from './views/NDayView'
import ScheduleView from './views/ScheduleView'
import WeekView from './views/WeekView'
import YearView from './views/YearView'

type CalendarGridProps = {
  className?: string
  onTimeSlotSelect?: (start: Date, end: Date) => void
  customItemFn?: CustomItemFn
}

export function CalendarGrid({
  className,
  onTimeSlotSelect,
  customItemFn,
}: CalendarGridProps): JSX.Element {
  const { view, isLoading } = useCalendar()
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner />
      </div>
    )
  }

  return (
    <div className={className}>
      {view === 'day' && (
        <DayView
          onTimeSlotSelect={onTimeSlotSelect}
          customItemFn={customItemFn}
        />
      )}
      {view === 'nDays' && (
        <NDaysView
          onTimeSlotSelect={onTimeSlotSelect}
          customItemFn={customItemFn}
        />
      )}
      {view === 'week' && (
        <WeekView
          onTimeSlotSelect={onTimeSlotSelect}
          customItemFn={customItemFn}
        />
      )}
      {view === 'month' && <MonthView customItemFn={customItemFn} />}
      {view === 'year' && <YearView />}
      {view === 'schedule' && <ScheduleView />}
    </div>
  )
}
