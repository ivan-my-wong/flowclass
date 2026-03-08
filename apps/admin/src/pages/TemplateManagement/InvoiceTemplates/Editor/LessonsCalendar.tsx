import { FC, useCallback, useEffect } from 'react'

import { useTranslation } from 'react-i18next'

import { CalendarGrid } from '@/components/ui/FullCalendar/CalendarGrid'
import { CalendarHeader } from '@/components/ui/FullCalendar/CalendarHeader'
import { useCalendar } from '@/components/ui/FullCalendar/CalendarProvider'
import { CalendarSidebarProvider } from '@/components/ui/FullCalendar/CalendarSidebarContext'
import { EventProvider } from '@/components/ui/FullCalendar/EventProvider'
import QuotaIndicator from '@/components/ui/QuotaIndicator'
import { Separator } from '@/components/ui/Separator'
import { QuotaTypeEnum } from '@/types/classes'
import { ClassTypeEnum } from '@/types/course'
import { CalendarEvent } from '@/types/fullCalendar.type'
import { LessonPreview } from '@/types/regularClass'
import dayjs from '@/utils/dayjs'

import ClassToggleSwitch from './ClassToggleSwitch'
import { useInvoiceEditorContext } from './InvoiceEditorContext'
import LessonCampaignItem from './LessonCampaignItem'
import SelectedSessionSide from './SelectedSessionSide'

interface Props {
  isOpen: boolean
  onCloseDialog: (isOpen: boolean) => void
}

const LessonsCalendar: FC<Props> = ({ isOpen, onCloseDialog }): JSX.Element => {
  const { t } = useTranslation()
  const {
    currentDate: currDate,
    setView,
    setCurrentDate: setCurrDate,
  } = useCalendar()
  const {
    regularV2Lessons: lessons,
    workshopLessons,
    selectedSessions,
    setSelectedSessions,
    isOpenDialog,
    setOpenDialog,
    setCurrentDate,
    currentClass,
    setSelectedCourseId,
    showAllClassesInCourse,
    setShowAllClassesInCourse,
    setAllClassesLessonsData,
  } = useInvoiceEditorContext()

  // Set courseId when class is selected
  useEffect(() => {
    if (currentClass?.course?.id) {
      setSelectedCourseId(currentClass.course.id)
    }
  }, [currentClass, setSelectedCourseId])

  // Reset toggle and data when modal closes
  useEffect(() => {
    if (!isOpenDialog) {
      setShowAllClassesInCourse(false)
      setAllClassesLessonsData(null)
    }
  }, [isOpenDialog, setShowAllClassesInCourse, setAllClassesLessonsData])

  const selectRegularLessons = (event: CalendarEvent) => {
    const selectedSession = lessons.find(
      lesson => lesson.id.toString() === event.id
    )
    if (selectedSession) {
      setSelectedSessions(prevSessions => {
        const mergedSessionIds = prevSessions
          .map(session => session.id.toString())
          .concat(selectedSession.id.toString())
        const uniqueSessionIds = Array.from(new Set(mergedSessionIds))
        return uniqueSessionIds
          .map(
            id =>
              lessons.find(
                lesson => lesson.id.toString() === id
              ) as LessonPreview
          )
          .filter(Boolean) as LessonPreview[]
      })
    }
  }

  const selectWorkshopLessons = (event: CalendarEvent) => {
    const selectedSession = workshopLessons.find(
      lesson => lesson.id === event.id
    )
    if (selectedSession) {
      setSelectedSessions(prevSessions => {
        if (!checkLessonCount(prevSessions, event)) return prevSessions
        if (prevSessions.some(s => s.id.toString() === event.id))
          return prevSessions
        const mergedSessionIds = prevSessions
          .map(session => session.id.toString())
          .concat(selectedSession.id)
        const uniqueSessionIds = Array.from(new Set(mergedSessionIds))
        return uniqueSessionIds
          .map(
            id =>
              workshopLessons.find(
                lesson => lesson.id === id
              ) as unknown as LessonPreview
          )
          .filter(Boolean) as LessonPreview[]
      })
    }
  }

  const checkLessonCount = useCallback(
    (sessions: LessonPreview[], event: CalendarEvent): boolean => {
      // Only check if lesson already exists (no limit on number of lessons)
      const isSessionExists = sessions.find(
        session => session.id.toString() === event.id.toString()
      )
      if (isSessionExists) {
        return false
      }
      return true
    },
    []
  )

  const selectRecurringLessons = (event: CalendarEvent) => {
    setSelectedSessions(prevSessions => {
      // Check if lesson already exists
      const eventId = event.id.toString()
      const isAlreadySelected = prevSessions.some(
        session => session.id.toString() === eventId
      )
      if (isAlreadySelected) {
        return prevSessions
      }

      if (!checkLessonCount(prevSessions, event)) {
        return prevSessions
      }

      return [
        ...prevSessions,
        {
          id: Number.parseInt(event.id, 10),
          date: dayjs(event.start).format('YYYY-MM-DD'),
          startTime: dayjs(event.start).toISOString(),
          endTime: dayjs(event.end).toISOString(),
          lessonNumber: 1,
          isBlocked: false,
          isOverride: false,
        } as LessonPreview,
      ]
    })
  }

  const selectAppointmentSchedule = (event: CalendarEvent) => {
    setSelectedSessions(prevSessions => {
      // Check if lesson already exists
      const eventId = event.id.toString()
      const isAlreadySelected = prevSessions.some(
        session => session.id.toString() === eventId
      )

      if (isAlreadySelected) {
        return prevSessions
      }

      if (!checkLessonCount(prevSessions, event)) {
        return prevSessions
      }

      return [
        ...prevSessions,
        {
          id: Number.parseInt(event.id, 10),
          date: dayjs(event.start).format('YYYY-MM-DD'),
          startTime: dayjs(event.start).toISOString(),
          endTime: dayjs(event.end).toISOString(),
          lessonNumber: 1,
          isBlocked: false,
          isOverride: false,
        } as LessonPreview,
      ]
    })
  }
  // Generic handler for all classes mode - directly add from event data
  const selectLessonFromEvent = (event: CalendarEvent) => {
    setSelectedSessions(prevSessions => {
      // Check if already selected
      const isAlreadySelected = prevSessions.some(
        session => session.id.toString() === event.id.toString()
      )
      if (isAlreadySelected) {
        return prevSessions
      }

      // Create lesson from event with class information
      const newLesson = {
        id: Number.parseInt(event.id, 10),
        date: dayjs(event.start).format('YYYY-MM-DD'),
        startTime: dayjs(event.start).toISOString(),
        endTime: dayjs(event.end).toISOString(),
        lessonNumber: 1,
        isBlocked: false,
        isOverride: false,
        // Store class info for multi-class support
        ...(event.classId && { classId: event.classId }),
      } as LessonPreview & { classId?: number }

      return [...prevSessions, newLesson]
    })
  }

  const eventMap = {
    [ClassTypeEnum.regularV2]: selectRegularLessons,
    [ClassTypeEnum.workshop]: selectWorkshopLessons,
    [ClassTypeEnum.recurring]: selectRecurringLessons,
    [ClassTypeEnum.appointment]: selectAppointmentSchedule,
  }

  const handleEventClick = (event: CalendarEvent) => {
    // When showing all classes, use generic handler that works with any class
    if (showAllClassesInCourse) {
      selectLessonFromEvent(event)
      return
    }

    // Otherwise, use type-specific handlers (original behavior)
    const handler = eventMap[event.type]
    if (handler) {
      handler(event)
    }
  }

  useEffect(() => {
    if (isOpen) {
      setOpenDialog(true)
      if (isOpenDialog === false) {
        onCloseDialog(false)
      }
    }
  }, [isOpen, isOpenDialog, onCloseDialog, setOpenDialog])

  useEffect(() => {
    return () => {
      // Cleanup when component unmounts
      setSelectedSessions([])
      setShowAllClassesInCourse(false)
      setAllClassesLessonsData(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setCurrentDate(currDate)
  }, [currDate, setCurrentDate])

  useEffect(() => {
    setView('month')
    setCurrDate(dayjs().startOf('month').toDate())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <EventProvider onEventClick={handleEventClick}>
      <CalendarSidebarProvider>
        <div className="flex w-full h-full bg-background">
          <div className="flex flex-1 flex-col h-full pb-36 overflow-y-auto">
            {/* Legend and Toggle Switch Container */}
            <div className="flex items-center justify-between py-4 pl-4 pr-4 border-b">
              <div className="flex gap-x-4">
                <QuotaIndicator type={QuotaTypeEnum.AVAILABLE} />
                <QuotaIndicator type={QuotaTypeEnum.LIMITED} />
                <QuotaIndicator type={QuotaTypeEnum.FULL} />
                <Separator orientation="vertical" />
                <span>{t('calendar:legend.leftDot')}</span>
                <span>{t('calendar:legend.rightDot')}</span>
              </div>

              {/* Toggle Switch */}
              <ClassToggleSwitch />
            </div>

            <CalendarHeader
              className="border-b"
              hideViewModeSelection
              hideAttendanceIndicator
            />
            <CalendarGrid
              className="flex-1 overflow-auto"
              customItemFn={props => (
                <LessonCampaignItem
                  {...props}
                  selectedSessions={selectedSessions}
                />
              )}
            />
          </div>
          <SelectedSessionSide />
        </div>
      </CalendarSidebarProvider>
    </EventProvider>
  )
}

export default LessonsCalendar
