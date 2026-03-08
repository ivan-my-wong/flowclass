import { FC, useEffect, useMemo, useState } from 'react'

import { Popover, PopoverContent, PopoverPortal, PopoverTrigger } from '@radix-ui/react-popover'
import dayjs from 'dayjs'
import { LucideChevronLeft, LucideChevronRight } from 'lucide-react'
import { ClassNames, DateRange, DayPicker, ModifiersClassNames } from 'react-day-picker'

import Button from '@/components/Buttons/Button'

export const classNameDayPicker: Partial<ClassNames> = {
  root: 'flex flex-col items-center justify-center',
  day: 'w-10 h-8 md:w-14 md:h-10 mx-2 my-2',
  week: '',
  chevron: 'hidden',
  months: 'mx-auto',
  month_grid: 'mx-auto',
  day_button: 'text-center flex items-center gap-2 justify-center w-full select-none',
  selected: 'bg-primary',
  range_start: 'rounded-tl-lg rounded-bl-lg text-[#ffffff]',
  range_middle: 'bg-purple-200 text-primary',
  range_end: 'rounded-tr-lg rounded-br-lg text-[#ffffff]',
  footer: 'block w-full mt-2',
}

export const modifiersClassNames: ModifiersClassNames = {
  availableDays: 'bg-primaryHighlightSubtle/70 rounded-full text-primary available-days',
  selectedTimeSlots: '!bg-primary !text-background !rounded-full selected-time-slots',
}

interface NavigationProps {
  month: Date
  onMonthChange: (month: Date) => void
}

const Navigation: FC<NavigationProps> = ({ month, onMonthChange }): JSX.Element => {
  const updateMonth = (counter: number) => {
    const prev = new Date(month)
    prev.setMonth(month.getMonth() + counter)
    onMonthChange(prev)
  }
  return (
    <div className="mb-5 flex items-center justify-around px-0">
      <LucideChevronLeft onClick={() => updateMonth(-1)} className="mr-auto cursor-pointer" />
      <div>{dayjs(month).format('MMMM YYYY')}</div>
      <LucideChevronRight onClick={() => updateMonth(1)} className="ml-auto cursor-pointer" />
    </div>
  )
}

interface CustomPickerProps {
  range: DateRange | undefined
  onChange: (range: DateRange | undefined) => void
}
const CustomPicker: FC<CustomPickerProps> = ({ range, onChange }): JSX.Element => {
  const [selectedDate, setSelectedDate] = useState<DateRange | undefined>(range)
  const [month, setMonth] = useState<Date>(range?.from ? new Date(range?.from) : new Date())
  const [open, setOpen] = useState(false)

  const formatLabe = useMemo(() => {
    return `${dayjs(range?.from).format('YYYY-MM-DD')} - ${dayjs(range?.to).format('YYYY-MM-DD')}`
  }, [range?.from, range?.to])

  useEffect(() => {
    if (range?.from) {
      setMonth(new Date(range.from))
    }
  }, [range?.from])

  useEffect(() => {
    setSelectedDate(range)
  }, [range])

  useEffect(() => {
    if (open) {
      setSelectedDate(range)
    }
  }, [open, range])

  const onClose = (event: boolean) => {
    if (selectedDate) {
      onChange(selectedDate)
    }

    setOpen(event)
  }

  return (
    <>
      <Popover open={open} onOpenChange={onClose}>
        <PopoverTrigger asChild>
          <div className="flex w-full">
            <Button className="w-full font-medium" variant="text">
              {formatLabe}
            </Button>
          </div>
        </PopoverTrigger>
        <PopoverPortal>
          <PopoverContent
            align="start"
            className="mt-1 w-[var(--radix-popover-trigger-width)] bg-white p-0 shadow"
          >
            <div className="w-full bg-[#ffffff] p-4 shadow">
              <DayPicker
                mode="range"
                selected={selectedDate}
                showOutsideDays
                onSelect={date => {
                  if (date) {
                    setSelectedDate(date)
                  }
                }}
                components={{
                  MonthCaption: () => null,
                  Nav: () => <Navigation month={month} onMonthChange={setMonth} />,
                }}
                classNames={classNameDayPicker}
                modifiersClassNames={modifiersClassNames}
                month={month}
                footer={
                  <div className="flex justify-end">
                    <Button
                      variant="outlined"
                      className="h-8 text-sm"
                      onClick={() => setSelectedDate(undefined)}
                    >
                      Reset Selected Range
                    </Button>
                  </div>
                }
              />
            </div>
          </PopoverContent>
        </PopoverPortal>
      </Popover>
    </>
  )
}

export default CustomPicker
