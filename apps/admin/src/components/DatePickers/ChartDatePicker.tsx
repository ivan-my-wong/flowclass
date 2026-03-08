/* eslint-disable react/no-unused-prop-types */
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import { TriangleDownIcon } from '@radix-ui/react-icons'
import { Close } from '@radix-ui/react-popover'
import dayjs from 'dayjs'
import { t } from 'i18next'
import { CiCalendarDate } from 'react-icons/ci'
import { IoMdClose } from 'react-icons/io'

import { DateRange, DayPicker } from 'react-day-picker'

import Popover from '@/components/Tooltips/Popover'
import { Button } from '@/components/ui/Button'
import { ChartDate } from '@/types/chartDate.type'
import {
  chartDateOptionMapping,
  customDateRangeMapping,
} from '@/utils/chartjsSetup'
import { cn } from '@/utils/cn'
import {
  formatChartDate,
  formatChartDateInWords,
  formatDateRelativeToToday,
} from '@/utils/timeString'

type ChartDatePickerProps = {
  /**
   * Handles date range changes.
   * @param date The new chart date range
   * @remarks Accepts either a React state setter or a custom callback function
   */
  handleChartDateChange:
    | Dispatch<SetStateAction<ChartDate>>
    | ((date: ChartDate) => void)
  chartDate: ChartDate
  includeFuture?: boolean
  className?: string
  onReset?: () => void
  defaultDate?: ChartDate
}

const ChartDatePicker = ({
  mode,
  ...props
}: ChartDatePickerProps & { mode?: 'range' | 'month' }): JSX.Element => {
  if (mode === 'month') {
    return <ChartMonthDatePicker {...props} />
  }
  return <ChartRangeDatePicker {...props} />
}

const ChartRangeDatePicker = ({
  chartDate,
  handleChartDateChange,
  includeFuture = false,
  className,
  onReset,
  defaultDate,
}: ChartDatePickerProps): JSX.Element => {
  const popoverCloseRef = useRef<HTMLButtonElement>(null)
  const initialDate = defaultDate || chartDate
  // Current displayed date in the UI
  const [displayedDate, setDisplayedDate] = useState<DateRange>({
    from: new Date(chartDate.startDate),
    to: new Date(chartDate.endDate),
  })
  // Temporary date selection that will only be applied when confirmed
  const [tempDateSelection, setTempDateSelection] = useState<DateRange>({
    from: new Date(chartDate.startDate),
    to: new Date(chartDate.endDate),
  })

  const [datePickerDateLabel, setDatePickerDateLabel] = useState<string | null>(
    null
  )

  // Update displayed date when chartDate prop changes
  useEffect(() => {
    setDisplayedDate({
      from: new Date(chartDate.startDate),
      to: new Date(chartDate.endDate),
    })
    setTempDateSelection({
      from: new Date(chartDate.startDate),
      to: new Date(chartDate.endDate),
    })
  }, [chartDate.startDate, chartDate.endDate])

  // Handle preset period selection (7 days, 30 days, etc.)
  const handleDefaultPeriodSelection = useCallback((days: number | string) => {
    let from: Date
    let to: Date = new Date()
    const today = dayjs()
    if (typeof days === 'string') {
      switch (days) {
        case 'thisWeek':
          from = today.startOf('week').toDate()
          to = today.toDate()
          break
        case 'lastWeek': {
          const lastWeekStart = today.startOf('week').subtract(1, 'week')
          from = lastWeekStart.toDate()
          to = lastWeekStart.endOf('week').toDate()
          break
        }
        case 'thisMonth':
          from = today.startOf('month').toDate()
          to = today.toDate()
          break
        case 'lastMonth': {
          const lastMonth = today.subtract(1, 'month')
          from = lastMonth.startOf('month').toDate()
          to = lastMonth.endOf('month').toDate()
          break
        }
        case 'last3Months': {
          const threeMonthsAgo = today.subtract(3, 'month').startOf('month')
          from = threeMonthsAgo.toDate()
          to = today.toDate()
          break
        }
        case 'thisYear':
          from = today.startOf('year').toDate()
          to = today.toDate()
          break
        case 'lastYear': {
          const lastYear = today.subtract(1, 'year')
          from = lastYear.startOf('year').toDate()
          to = lastYear.endOf('year').toDate()
          break
        }
        default:
          from = today.toDate()
          to = today.toDate()
      }
    } else {
      from = dayjs(formatDateRelativeToToday(days)).toDate()
      to = dayjs(formatDateRelativeToToday(0)).toDate()
    }
    setTempDateSelection({ from, to })
  }, [])

  // Handle date picker calendar selection
  const handleDatePickerChange = (date: DateRange | undefined) => {
    if (date?.from && date?.to) {
      setTempDateSelection(date)
    } else if (date?.from) {
      setTempDateSelection({
        ...tempDateSelection,
        from: date.from,
      })
    }
  }

  // Apply the temporary selection to the actual chart date
  const applyDateSelection = useCallback(() => {
    if (!tempDateSelection?.from || !tempDateSelection?.to) return

    handleChartDateChange({
      startDate: formatChartDate(tempDateSelection.from),
      endDate: formatChartDate(tempDateSelection.to),
    })

    popoverCloseRef.current?.click()
  }, [tempDateSelection, handleChartDateChange])

  // Reset to default date range
  const handleReset = useCallback(() => {
    if (onReset) {
      onReset()
    } else {
      const resetDate = {
        from: new Date(initialDate.startDate),
        to: new Date(initialDate.endDate),
      }
      setTempDateSelection(resetDate)
      setDisplayedDate(resetDate)
      handleChartDateChange({
        startDate: initialDate.startDate,
        endDate: initialDate.endDate,
      })
    }
    setDatePickerDateLabel(null)
    popoverCloseRef.current?.click()
  }, [onReset, initialDate, handleChartDateChange])

  return (
    <Popover
      isDayPicker
      trigger={
        <div
          className={cn(
            'border-blue-300 border-2 rounded-md p-2 flex items-center gap-2 hover:bg-blue-50 hover:border-blue-400 cursor-pointer transition-colors',
            className
          )}
        >
          <div className="flex items-center justify-start gap-2 cursor-pointer w-full">
            <CiCalendarDate size="1.5rem" className="text-blue-600" />
            <span className="line-clamp-1 text-blue-700 font-medium">
              {formatChartDateInWords(displayedDate?.from)} -{' '}
              {formatChartDateInWords(displayedDate?.to)}
            </span>
          </div>
          <TriangleDownIcon className="text-blue-600" />
        </div>
      }
    >
      <div className="box-col gap-0 items-start bg-white rounded-xl overflow-hidden">
        <div className="box-row-full gap-0 items-start h-full">
          <div className="box-row-full gap-0 items-start pt-4 px-4 border-r border-text-disabled">
            <div className="box-col-full gap-0 items-start">
              {chartDateOptionMapping.map(option => (
                <Button
                  key={option.label}
                  variant={
                    option.label === datePickerDateLabel ? 'link' : 'ghost'
                  }
                  className={cn(
                    'p-0',
                    option.label === datePickerDateLabel
                      ? 'text-blue-600 font-semibold'
                      : 'text-text hover:text-blue-600'
                  )}
                  onClick={() => {
                    handleDefaultPeriodSelection(option.dayLength)
                    setDatePickerDateLabel(option.label)
                  }}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            <div className="box-col-full gap-0 items-start">
              {customDateRangeMapping.map(option => (
                <Button
                  key={option.label}
                  variant={
                    option.label === datePickerDateLabel ? 'link' : 'ghost'
                  }
                  className={cn(
                    'p-0',
                    option.label === datePickerDateLabel
                      ? 'text-blue-600 font-semibold'
                      : 'text-text hover:text-blue-600'
                  )}
                  onClick={() => {
                    handleDefaultPeriodSelection(option.dayLength)
                    setDatePickerDateLabel(option.label)
                  }}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
          <DayPicker
            // initialFocus
            mode="range"
            selected={tempDateSelection}
            onSelect={handleDatePickerChange}
            fromMonth={new Date(formatDateRelativeToToday(365))}
            toMonth={includeFuture ? undefined : new Date()}
            disabled={includeFuture ? undefined : { after: new Date() }}
            showOutsideDays
            className="[&_.rdp-nav]:z-[1050] [&_.rdp-day_selected]:bg-blue-100 [&_.rdp-day_selected]:text-blue-800 [&_.rdp-day_range_start]:bg-blue-600 [&_.rdp-day_range_start]:text-white [&_.rdp-day_range_end]:bg-blue-600 [&_.rdp-day_range_end]:text-white [&_.rdp-day_range_middle]:bg-blue-100 [&_.rdp-day_range_middle]:text-blue-800 [&_.rdp-day:hover:not(.rdp-day_disabled):not(.rdp-day_selected)]:bg-blue-50 [&_.rdp-day:hover:not(.rdp-day_disabled):not(.rdp-day_selected)]:text-blue-800"
          />
        </div>
        <div className="box-row-full justify-between items-center pt-4 pb-2 border-t border-text-disabled gap-4">
          <Close
            ref={popoverCloseRef}
            className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 text-text-disabled hover:text-text cursor-pointer transition-colors flex items-center justify-center border-0"
          >
            <IoMdClose size="1.5rem" />
          </Close>
          <p className="text-md font-bold text-center flex-1 text-blue-700">
            {formatChartDateInWords(tempDateSelection?.from)} -{' '}
            {formatChartDateInWords(tempDateSelection?.to)}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleReset}
              className="text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              {t('common:action.reset')}
            </Button>
            <Button
              onClick={applyDateSelection}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {t(`component:googleAnalytics.confirm`)}
            </Button>
          </div>
        </div>
      </div>
    </Popover>
  )
}

export default ChartDatePicker

const ChartMonthDatePicker = ({
  chartDate,
  handleChartDateChange,
  includeFuture = false,
  className,
}: ChartDatePickerProps): JSX.Element => {
  const popoverCloseRef = useRef<HTMLButtonElement>(null)
  const initialMonth = dayjs(chartDate.startDate).startOf('month').toDate()
  const [tempMonth, setTempMonth] = useState<Date>(initialMonth)

  useEffect(() => {
    setTempMonth(dayjs(chartDate.startDate).startOf('month').toDate())
  }, [chartDate.startDate])

  const handleMonthSelection = useCallback((date?: Date) => {
    if (!date) return
    setTempMonth(dayjs(date).startOf('month').toDate())
  }, [])

  const applyMonthSelection = useCallback(() => {
    const start = dayjs(tempMonth).startOf('month').toDate()
    const end = dayjs(tempMonth).endOf('month').toDate()
    handleChartDateChange({
      startDate: formatChartDate(start),
      endDate: formatChartDate(end),
    })
    popoverCloseRef.current?.click()
  }, [handleChartDateChange, tempMonth])

  const monthLabel = dayjs(tempMonth).format('MMMM YYYY')

  const now = dayjs()
  const currentYear = now.year()

  return (
    <Popover
      isDayPicker
      trigger={
        <div
          className={cn(
            'border-blue-300 border-2 rounded-md p-2 flex items-center gap-2 hover:bg-blue-50 hover:border-blue-400 cursor-pointer transition-colors',
            className
          )}
        >
          <div className="flex items-center justify-start gap-2 cursor-pointer w-full">
            <CiCalendarDate size="1.5rem" className="text-blue-600" />
            <span className="line-clamp-1 text-blue-700 font-medium">
              {monthLabel}
            </span>
          </div>
          <TriangleDownIcon className="text-blue-600" />
        </div>
      }
    >
      <div className="box-col gap-4 items-start p-4 bg-white rounded-lg">
        <DayPicker
          mode="single"
          captionLayout="dropdown-buttons"
          month={tempMonth}
          selected={tempMonth}
          onMonthChange={handleMonthSelection}
          onSelect={handleMonthSelection}
          fromYear={2018}
          toYear={includeFuture ? currentYear + 5 : currentYear}
          toMonth={includeFuture ? undefined : now.startOf('month').toDate()}
          disabled={
            includeFuture
              ? undefined
              : {
                  after: now.endOf('month').toDate(),
                }
          }
          className="[&_.rdp-table]:hidden [&_.rdp-weekdays]:hidden [&_.rdp-caption_label]:font-bold [&_.rdp-caption_dropdowns]:w-full [&_.rdp-caption_dropdowns]:gap-2"
        />
        <div className="box-row-full justify-between items-center border-t border-text-disabled pt-3">
          <Close
            ref={popoverCloseRef}
            className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 text-text-disabled hover:text-text cursor-pointer transition-colors flex items-center justify-center border-0"
          >
            <IoMdClose size="1.5rem" />
          </Close>
          <p className="text-md font-bold">{monthLabel}</p>
          <Button onClick={applyMonthSelection}>
            {t(`component:googleAnalytics.confirm`)}
          </Button>
        </div>
      </div>
    </Popover>
  )
}
