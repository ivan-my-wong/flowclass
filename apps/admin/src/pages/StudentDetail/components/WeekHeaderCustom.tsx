import { useEffect, useState } from 'react'

import { RefObject } from '@fullcalendar/core/preact'
import FullCalendar from '@fullcalendar/react'
import dayjs from 'dayjs'

import { cn } from '@/utils/cn'

import { TimeFormat } from '../../../constants/common'

type Props = {
  calendarRef: RefObject<FullCalendar>
  currentDate?: string
  setCurrentDate?: (value: Date) => void
}

type DateItem = {
  id: string
  dateString: string
  dateNumber: string
  source: Date
}

const WeekHeaderCustom = ({
  calendarRef,
  currentDate,
  setCurrentDate,
}: Props) => {
  const [weekDates, setWeekDates] = useState<DateItem[]>([])

  useEffect(() => {
    const currentWeek: DateItem[] = Array.from(Array(7).keys()).map(idx => {
      const d = currentDate ? new Date(currentDate) : new Date()
      d?.setDate(d.getDate() - d.getDay() + idx)
      return {
        id: `${idx}-${dayjs(d).format('ddd').toUpperCase()}`,
        dateString: dayjs(d).format('ddd').toUpperCase(),
        dateNumber: dayjs(d).format('DD'),
        source: d,
      }
    })
    setWeekDates(currentWeek)
  }, [currentDate])

  const handleClick = (data: DateItem) => {
    const calApi = calendarRef.current?.getApi()
    if (calApi) {
      if (calApi) {
        calApi.gotoDate(data.source)
        if (setCurrentDate) {
          setCurrentDate(data.source)
        }
      }
    }
  }
  return (
    <div className="w-full flex gap-5 my-[15px] cursor-pointer">
      {weekDates?.map(item => {
        const date = currentDate || new Date()
        const isActive =
          dayjs(date).format(TimeFormat.DD_MM_YYYY) ===
          dayjs(item.source).format(TimeFormat.DD_MM_YYYY)
        return (
          <div
            key={item.id}
            role="button"
            tabIndex={0}
            className="flex flex-col justify-center items-center"
            onClick={() => {
              handleClick(item)
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleClick(item)
              }
            }}
          >
            <div className="text-base font-normal h-fit">{item.dateString}</div>
            <div
              className={cn(
                'w-[42px] h-[42px] rounded-full flex justify-center items-center mt-[7px] text-base font-normal',
                isActive ? 'text-white bg-[#5C95FF]' : 'text-black bg-[#D9D9D9]'
              )}
            >
              {item.dateNumber}
            </div>
          </div>
        )
      })}
    </div>
  )
}
export default WeekHeaderCustom
