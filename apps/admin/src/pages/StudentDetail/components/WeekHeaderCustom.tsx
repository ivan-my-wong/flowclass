import { useEffect, useState } from 'react'

import { RefObject } from '@fullcalendar/core/preact'
import FullCalendar from '@fullcalendar/react'
import dayjs from 'dayjs'

import { TimeFormat } from '../../../constants/common'
import { styled } from '../../../styles'

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
    <Wrapp>
      {weekDates?.map(item => {
        const date = currentDate || new Date()
        return (
          <DateItem
            key={item.id}
            onClick={() => {
              handleClick(item)
            }}
          >
            <DateString>{item.dateString}</DateString>
            <DateNumber
              status={
                dayjs(date).format(TimeFormat.DD_MM_YYYY) ===
                dayjs(item.source).format(TimeFormat.DD_MM_YYYY)
                  ? 'active'
                  : 'inactive'
              }
            >
              {item.dateNumber}
            </DateNumber>
          </DateItem>
        )
      })}
    </Wrapp>
  )
}
const Wrapp = styled('div', {
  width: '100%',
  display: 'flex',
  gap: 20,
  margin: '15px 0',
  cursor: 'pointer',
})

const DateString = styled('div', {
  fontSize: 16,
  fontWeight: 400,
  height: 'fit-content',
})
const DateNumber = styled(DateString, {
  width: 42,
  height: 42,
  backgroundColor: '#D9D9D9',
  borderRadius: '50%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 7,
  variants: {
    status: {
      active: {
        color: '#FFFFFF',
        backgroundColor: '#5C95FF',
      },
      inactive: {
        color: '#000000',
        backgroundColor: '#D9D9D9',
      },
    },
  },
})
const DateItem = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
})
export default WeekHeaderCustom
