import { useMemo, useRef, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Inputs/Input'
import { dateFormatOptions, HOURS } from '@/constants/fullCalendar'
import { useLanguage } from '@/hooks/useLanguage'
import { CalendarViewProps } from '@/types/fullCalendar.type'
import {
  getHighlightedMinutesForHour,
  handleClick,
  handleDragEnd,
  handleDragMove,
  handleDragStart,
} from '@/utils/calendar-drag.utils'
import { generateDayToShow } from '@/utils/date.utils'

import { useCalendar } from '../CalendarProvider'
import { DayViewGridItem } from '../DayViewDropzone'
import { NDayDropzone } from '../NDayDropzone'

import ColumnViewWrapper from './ColumnViewWrapper'
import Hour from './Hour'

const NDaysView = ({ onTimeSlotSelect, customItemFn }: CalendarViewProps) => {
  const { t } = useTranslation('calendar')
  const { language } = useLanguage()
  const { currentDate } = useCalendar()
  const [numDays, setNumDays] = useState(3)

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

  const getDaysToShow = useMemo(
    () => () => generateDayToShow(currentDate, numDays),
    [numDays, currentDate]
  )

  const daysToShow = useMemo(() => getDaysToShow(), [getDaysToShow])

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
    <ColumnViewWrapper data-testid="n-day-view" aria-label="NDay View">
      <div className="flex w-full items-center justify-end p-2 border-b">
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
          Reset
        </Button>
      </div>
      <div className="flex-1 overflow-auto">
        <div className="flex border-b relative">
          <div className="w-16 flex-none" />
          {daysToShow.map(date => (
            <div
              key={date.toISOString()}
              className="flex-1 text-center border-l p-2"
              role="columnheader"
              data-testid="n-day-view-days"
              aria-label={date.toLocaleDateString(
                language,
                dateFormatOptions.shortMonthDay
              )}
            >
              <div className="font-medium">
                {t(
                  `days.${date.toLocaleDateString(
                    'en-US',
                    dateFormatOptions.shortDayName
                  )}`
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {date.toLocaleDateString(
                  language,
                  dateFormatOptions.shortMonthDay
                )}
              </div>
            </div>
          ))}
        </div>
        <div
          className="flex"
          onMouseUp={() => handleDragEnd(onTimeSlotSelect, dragState)}
          onMouseLeave={() => handleDragEnd(onTimeSlotSelect, dragState)}
          role="presentation"
        >
          <div className="flex overflow-y-auto">
            <Hour />
          </div>
          {daysToShow.map(date => (
            <div
              key={date.toISOString()}
              className="relative flex-1 border-l"
              role="gridcell"
              aria-label={date.toLocaleDateString(
                language,
                dateFormatOptions.shortMonthDay
              )}
            >
              <div className="absolute inset-0">
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
              <div className="absolute inset-0">
                {HOURS.map(hour => (
                  <NDayDropzone
                    key={`${date.toISOString()}-${hour}`}
                    date={date}
                    hour={hour}
                    customItemFn={customItemFn}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ColumnViewWrapper>
  )
}

export default NDaysView
