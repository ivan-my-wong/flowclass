import { ReactElement, RefObject, useEffect, useMemo, useState } from 'react'

import FullCalendar from '@fullcalendar/react'
import { useTranslation } from 'react-i18next'

import FilterIcon from '@/assets/svgs/lessondatetime/filterIcon'
import NextIcon from '@/assets/svgs/lessondatetime/nextIcon'
import PreIcon from '@/assets/svgs/lessondatetime/preIcon'
import SelectDateIcon from '@/assets/svgs/lessondatetime/SelectDate'
import CustomDatePicker from '@/components/DatePickers/DatePicker'
import SvgIcon from '@/components/Images/SvgIcon'
import Text from '@/components/Texts/Text'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import { useResponsive } from '@/hooks/useResponsive'
import { cn } from '@/utils/cn'
import { formatTs } from '@/utils/timeFormat'

import Filter from './Filter'

import 'react-datepicker/dist/react-datepicker.css'

export type ChangeDateRangeParam = {
  start: Date
  end: Date
}

export type TCalendarHeader = {
  calendarRef: RefObject<FullCalendar>
  handleClassSelect: (value: number[]) => void
  onChangeDateRange: (value: ChangeDateRangeParam) => void
  setCurrentDate?: (value: Date) => void
  isTeachingService?: boolean
}
export const CalendarHeader = ({
  calendarRef,
  handleClassSelect,
  onChangeDateRange,
  setCurrentDate,
  isTeachingService,
}: TCalendarHeader): ReactElement => {
  const { t } = useTranslation()
  const { isMobile } = useResponsive()
  const [title, setTitle] = useState(calendarRef.current?.getApi()?.view.title)
  const [date, setDate] = useState<Date | undefined>(
    calendarRef.current?.getApi().getDate()
  )
  const [isOpenFilter, setIsOpenFilter] = useState<boolean>(false)

  useMemo(() => {
    return date
  }, [date])
  const memoTitle = useMemo(() => {
    return title
  }, [title])
  useEffect(() => {
    const calApi = calendarRef.current?.getApi()
    if (calApi) {
      setTitle(calendarRef.current?.getApi()?.view.title)
      setDate(calApi.getDate())
    }
  }, [calendarRef])

  const handleDateChange = (direction: 'prev' | 'today' | 'next'): void => {
    const calApi = calendarRef.current?.getApi()

    if (calApi) {
      if (direction === 'prev') {
        calApi.prev()
      } else if (direction === 'next') {
        calApi.next()
      } else {
        calApi.today()
      }
      const { activeStart, activeEnd } = calApi.view
      onChangeDateRange({
        start: activeStart,
        end: activeEnd,
      })
      setDate(calApi.getDate())
      if (setCurrentDate) {
        setCurrentDate(calApi.getDate())
      }
    }
  }
  const handleChangeDate = (newValue: Date) => {
    const calApi = calendarRef.current?.getApi()

    setDate(newValue)
    if (setCurrentDate && !!newValue) {
      setCurrentDate(newValue)
    }
    if (calApi) {
      calApi.gotoDate(newValue || new Date())
      const { activeStart, activeEnd } = calApi.view
      onChangeDateRange({
        start: activeStart,
        end: activeEnd,
      })
    }
  }
  return (
    <header>
      <Box justify="between" className="my-4">
        <Box justify="start">
          <Box className="w-fit" padding="0">
            <CustomDatePicker
              customInput={
                <SvgIcon>
                  <SelectDateIcon />
                </SvgIcon>
              }
              selected={null}
              showTimeSelect={false}
              dateFormat="yyyy/MM/dd hh:mm aa"
              onChange={(newValue: Date | null) => {
                if (newValue) {
                  handleChangeDate(newValue)
                }
              }}
              selectedDate={null}
            />
          </Box>

          <Text
            css={{ fontWeight: 'bold', fontSize: '$6', whiteSpace: 'nowrap' }}
          >
            {memoTitle}
          </Text>
        </Box>

        <Box justify="end">
          {isMobile ||
            (isTeachingService && (
              <div>
                <Button
                  onClick={() => setIsOpenFilter(true)}
                  className="bg-background-layer-3"
                >
                  <SvgIcon>
                    <FilterIcon />
                  </SvgIcon>
                </Button>
              </div>
            ))}

          <div>
            <Button
              onClick={(): void => handleDateChange('prev')}
              variant="ghost"
            >
              <SvgIcon>
                <PreIcon />
              </SvgIcon>
            </Button>
          </div>
          <div>
            <Button
              variant="ghost"
              onClick={(): void => handleDateChange('today')}
              className={cn(
                date &&
                  formatTs(date?.toString(), 'YYYY/MM/DD') ===
                    formatTs(new Date().toDateString(), 'YYYY/MM/DD')
                  ? 'text-black'
                  : 'text-text-disabled'
              )}
            >
              {t('Today')}
            </Button>
          </div>
          <div>
            <Button
              onClick={(): void => handleDateChange('next')}
              variant="ghost"
            >
              <SvgIcon>
                <NextIcon />
              </SvgIcon>
            </Button>
          </div>
        </Box>
      </Box>
      <Filter
        handleClassSelect={handleClassSelect}
        open={isOpenFilter}
        handleClose={() => setIsOpenFilter(false)}
      />
    </header>
  )
}
