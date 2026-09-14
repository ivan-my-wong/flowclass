import { createRef, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { EventClickArg } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import { useTranslation } from 'react-i18next'
import { useRecoilState, useRecoilValue } from 'recoil'

import Text from '@/components/Texts/Text'
import Box from '@/components/ui/Box'
import useBlockTimeData from '@/hooks/useBlockTimeData'
import { useResponsive } from '@/hooks/useResponsive'
import useSiteData from '@/hooks/useSiteData'
import EventContentMobile from '@/pages/FullCalendar/components/EventContentMobile'
import { courseState } from '@/stores/courseData'
import { darkModeState } from '@/stores/darkMode'
import { lessonDateTimeState } from '@/stores/lessonDateTimeData'
import { styled } from '@/styles'
import { ClassTypeEnum } from '@/types/course'
import { ClassLesson } from '@/types/student'
import dayjs from '@/utils/dayjs'
import { formatTs } from '@/utils/timeFormat'

import { CalendarHeader, ChangeDateRangeParam } from './CalenderHeader'
import EventContentDesktop from './EventContent'

import '@/styles/components/calender.css'

interface Props {
  classIdSelected: number[]
  initialDateRange: ChangeDateRangeParam
  handleClassSelect: (value: number[]) => void
  onChangeDateRange: (value: ChangeDateRangeParam) => void
}

interface ArgEvent {
  jsEvent: {
    pageY: number
    pageX: number
    layerY: number
  }
  event: {
    start: string
    end: string
    extendedProps: {
      courseId: number
      courseName: string
      class: string
    }
  }
}

const FullCalendarComponent = ({
  classIdSelected,
  initialDateRange,
  handleClassSelect,
  onChangeDateRange,
}: Props): JSX.Element => {
  const { getCurrentSiteTimeZoneDate } = useSiteData()
  const courseData = useRecoilValue(courseState)
  const allClassData = useMemo(
    () => (courseData?.courses || []).flatMap(course => course.classes),
    [courseData?.courses]
  )
  const [params] = useSearchParams()
  const { t } = useTranslation()
  const { isMobile } = useResponsive()
  const [lessonData] = useRecoilState(lessonDateTimeState)
  const calendarRef = createRef<FullCalendar>()
  const currentLocation = useLocation()
  const { useFetchAllblockTimeData } = useBlockTimeData()
  const { data } = useFetchAllblockTimeData()
  const [events, setEvents] = useState<ClassLesson[]>(lessonData.lessons)
  const [isDarkMode] = useRecoilState(darkModeState)

  const navigate = useNavigate()

  const handleEventClick = (clickInfo: EventClickArg) => {
    if (!clickInfo.event.extendedProps.blockTime) {
      const backUrl = new URLSearchParams(currentLocation.search)

      params.set('back', `${currentLocation.pathname}?${backUrl.toString()}`)
      navigate(
        `/course-calendar/lesson/${clickInfo.event.id}?${params.toString()}`
      )
    }
  }
  const [tooltip, setTooltip] = useState<{
    isVisible: boolean
    content?: ArgEvent
    position: {
      top: number
      left: number
    }
  }>({
    isVisible: false,
    position: { top: 0, left: 0 },
  })

  useEffect(() => {
    if (lessonData) {
      let newLesson = lessonData.lessons.map((lesson: ClassLesson) => {
        const newLesson: any = { ...lesson }
        newLesson.id = lesson.id.toString()

        newLesson.borderColor = '#5C95FF'
        newLesson.backgroundColor = isDarkMode ? '#44464a' : '#F7F7F7'

        newLesson.start = lesson.changeStartTime
          ? lesson.changeStartTime
          : getCurrentSiteTimeZoneDate(lesson.start as unknown as string)
        newLesson.end = lesson.changeEndTime
          ? lesson.changeEndTime
          : getCurrentSiteTimeZoneDate(lesson.end as unknown as string)
        return newLesson
      })
      if (data) {
        const newBlockTime = data.map(blocktime => {
          return {
            start: blocktime.startTime,
            end: blocktime.endTime,
            blockTime: true,
            title: `${t('setting:systemSettings.blockTimeSetting')}`,
            backgroundColor: '#969696',
            borderColor: '#969696',
          }
        })
        newLesson = newLesson.concat(newBlockTime)
      }
      setEvents(newLesson.filter(o => o.courseId && o.classId))
    }
  }, [data, lessonData, t])
  useEffect(() => {
    const calApi = calendarRef.current?.getApi()

    if (calApi) {
      // onChangeStartDate(calApi.view.activeStart)
      // onChangeEndDate(calApi.view.activeStart)
    }
  }, [calendarRef])
  useEffect(() => {
    const calApi = calendarRef.current?.getApi()

    if (calApi && initialDateRange) {
      calApi.gotoDate(initialDateRange.start)
    }
  }, [])

  useEffect(() => {
    if (classIdSelected && classIdSelected.length !== 0) {
      const selectedClasses = allClassData.filter(c =>
        classIdSelected.includes(c.id)
      )

      const newSelectedClass = selectedClasses[selectedClasses.length - 1]
      let lessonDate = new Date()
      if (
        newSelectedClass.type === ClassTypeEnum.regular ||
        newSelectedClass.type === ClassTypeEnum.workshop
      ) {
        const { startTime } = newSelectedClass.regularPeriods[0].lessons[0]

        if (startTime) lessonDate = dayjs(startTime).toDate()
      }
      const calApi = calendarRef.current?.getApi()

      // setDate(newValue)
      // if (setCurrentDate && !!newValue) {
      //   setCurrentDate(newValue)
      // }
      if (calApi) {
        calApi.gotoDate(lessonDate)
        const { activeStart, activeEnd } = calApi.view
        onChangeDateRange({
          start: activeStart,
          end: activeEnd,
        })
      }
    }
  }, [allClassData, classIdSelected])

  const calenderOptions = {
    initialView: isMobile ? 'timeGridDay' : 'timeGridWeek',
    weekends: true,
    slotEventOverlap: false,
    allDaySlot: false,
    slotDuration: '01:00:00',
    slotLabelInterval: '01:00:00',
    slotMinTime: '00:00:00',
    slotMaxTime: '24:00:00',
    nowIndicator: true,
    buttonIcons: {
      prev: 'chevron-left',
      next: 'chevron-right',
      prevYear: 'chevrons-left', // double chevron
      nextYear: 'chevrons-right', // double chevron
    },
    // editable: true,
    selectable: true,
    height: '90%',
    expandRows: true,
    dayMaxEvents: true,
  }

  const handleMouseEnter = (info: any) => {
    if (info.event.extendedProps.courseId) {
      let position = {
        top: info.jsEvent?.pageY - 170 - info.jsEvent.layerY,
        left: info.jsEvent.pageX - 400,
      }
      if (isMobile) {
        position = {
          top: info.jsEvent?.pageY - 170 - info.jsEvent.layerY,
          left: info.jsEvent.pageX - 160,
        }
      }

      setTooltip({
        isVisible: true,
        content: info,
        position,
      })
    }
  }
  const { isVisible, content, position } = tooltip
  const handleMouseLeave = () => {
    setTooltip({
      isVisible: false,
      position: { top: 0, left: 0 },
    })
  }

  return (
    <CalenderWrapper>
      <CalendarHeader
        calendarRef={calendarRef}
        handleClassSelect={handleClassSelect}
        onChangeDateRange={onChangeDateRange}
      />
      <FullCalendar
        ref={calendarRef}
        {...calenderOptions}
        headerToolbar={false}
        plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
        eventContent={isMobile ? EventContentMobile : EventContentDesktop}
        eventClick={handleEventClick}
        eventMouseEnter={handleMouseEnter}
        eventMouseLeave={handleMouseLeave}
        slotLabelFormat={{
          hour: 'numeric',
          minute: '2-digit',
          omitZeroMinute: false,
        }}
        titleFormat={{
          month: 'long', // Display full month name
          year: 'numeric', // Display 4-digit year
        }}
        // events={data}
        events={events as any}
      />
      {isVisible && content && (
        <TooltipBox
          className="custom-tooltip"
          style={{
            position: 'absolute',
            top: position.top,
            left: position.left + 100,
            pointerEvents: 'none',
          }}
        >
          <Box direction="col" align="start" padding="lg">
            <Text>
              {formatTs(content?.event?.start, 'hh:mm')}-{' '}
              {formatTs(content?.event?.end, 'hh:mm')}
            </Text>
            <Text css={{ fontWeight: 'bold' }}>
              {content?.event?.extendedProps?.courseName}
            </Text>
            <Text>{content?.event?.extendedProps?.class}</Text>
          </Box>
        </TooltipBox>
      )}
    </CalenderWrapper>
  )
}

const CalenderWrapper = styled('div', {
  minHeight: '76vh',
  width: '100%',
  position: 'relative',
  '.fc-event-main': {
    overflow: 'hidden',
  },
})
const TooltipBox = styled('div', {
  background: '#5C97FF',
  width: '200px',
  color: 'white',
  padding: '$3',
  borderRadius: '5px',
})

export default FullCalendarComponent
