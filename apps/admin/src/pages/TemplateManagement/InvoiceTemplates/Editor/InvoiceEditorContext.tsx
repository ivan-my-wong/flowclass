import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'

import { AvailableSchedules } from '@/types/appointment'
import { DateOverrideProps } from '@/types/availability.type'
import {
  Classes,
  PeriodLessonsStringId,
  RecurringSchedules,
} from '@/types/classes'
import type { AllClassesLessonsResponse } from '@/types/classWithLessons.type'
import { LessonPreview, PriceOption } from '@/types/regularClass'
import { getDatesForWeekdays, parseTimeToDate } from '@/utils/date.utils'
import dayjs from '@/utils/dayjs'
import { generateIdEventByTimeSlot } from '@/utils/invoice-campaign.utils'

type InvoiceEditorContextType = {
  isViewOnly: boolean
  isOpenDialog: boolean
  setOpenDialog: Dispatch<SetStateAction<boolean>>
  regularV2Lessons: LessonPreview[]
  currentClass: Classes | null
  currentDate: Date
  setCurrentDate: Dispatch<SetStateAction<Date>>
  appointmentSchedules: AvailableSchedules[]
  appointmentAvailableDays: Date[]
  recurringAvailableDays: Date[]
  appointmentDateOverrides: DateOverrideProps[]
  recurringSchedules: RecurringSchedules[]
  setCurrentClass: Dispatch<SetStateAction<Classes | null>>
  setRegularV2Lessons: Dispatch<SetStateAction<LessonPreview[]>>
  selectedSessions: LessonPreview[]
  setSelectedSessions: Dispatch<SetStateAction<LessonPreview[]>>
  workshopLessons: PeriodLessonsStringId[]
  manuallySelectedPrice: PriceOption | null
  setManuallySelectedPrice: Dispatch<SetStateAction<PriceOption | null>>
  isWithinApplicationPeriodForEvent: (
    start: Date | string,
    end: Date | string
  ) => boolean
  // New states for showing all classes in course
  showAllClassesInCourse: boolean
  setShowAllClassesInCourse: Dispatch<SetStateAction<boolean>>
  selectedCourseId: number | null
  setSelectedCourseId: Dispatch<SetStateAction<number | null>>
  allClassesInCourse: Classes[]
  setAllClassesInCourse: Dispatch<SetStateAction<Classes[]>>
  allClassesLessonsData: AllClassesLessonsResponse | null
  setAllClassesLessonsData: Dispatch<
    SetStateAction<AllClassesLessonsResponse | null>
  >
}

const InvoiceEditorContext = createContext<
  InvoiceEditorContextType | undefined
>(undefined)

export function InvoiceEditorProvider({
  children,
  isViewOnly = false,
}: PropsWithChildren<{ isViewOnly?: boolean }>): JSX.Element {
  const [isOpenDialog, setOpenDialog] = useState<boolean>(true)
  const [currentClass, setCurrentClass] = useState<Classes | null>(null)
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [regularV2Lessons, setRegularV2Lessons] = useState<LessonPreview[]>([])
  const [selectedSessions, setSelectedSessions] = useState<LessonPreview[]>([])
  const [manuallySelectedPrice, setManuallySelectedPrice] =
    useState<PriceOption | null>(null)

  // New states for showing all classes in course
  const [showAllClassesInCourse, setShowAllClassesInCourse] =
    useState<boolean>(false)
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null)
  const [allClassesInCourse, setAllClassesInCourse] = useState<Classes[]>([])
  const [allClassesLessonsData, setAllClassesLessonsData] =
    useState<AllClassesLessonsResponse | null>(null)

  const isWithinApplicationPeriod = useCallback(
    (date: Date): boolean => {
      if (!currentClass?.applicationPeriod) {
        return true
      }
      const { startDatetime, endDatetime } = currentClass.applicationPeriod
      const dateToCheck = dayjs(date)

      // check if the date is after the start date
      if (startDatetime) {
        const startDate = dayjs(startDatetime)
        if (dateToCheck.isBefore(startDate, 'day')) {
          return false
        }
      }

      // check if the date is before the end date
      if (endDatetime) {
        const endDate = dayjs(endDatetime)
        if (dateToCheck.isAfter(endDate, 'day')) {
          return false
        }
      }

      return true
    },
    [currentClass?.applicationPeriod]
  )

  const isWithinApplicationPeriodForEvent = useCallback(
    (start: Date | string, end: Date | string): boolean => {
      if (!currentClass?.applicationPeriod) return true

      const { startDatetime, endDatetime } = currentClass.applicationPeriod
      const eventStart = dayjs(start)
      const eventEnd = dayjs(end)

      // check if the date is after the start date
      if (startDatetime) {
        const apStart = dayjs(startDatetime)
        // if the date is before the start date
        if (eventStart.isBefore(apStart, 'day')) return false
        // if the date is on the same day, compare to the minute
        if (eventStart.isSame(apStart, 'day')) {
          if (eventStart.isBefore(apStart, 'minute')) return false
        }
      }

      // check if the date is before the end date
      if (endDatetime) {
        const apEnd = dayjs(endDatetime)
        // if the date is after the end date
        if (eventEnd.isAfter(apEnd, 'day')) return false
        // if the date is on the same day, compare to the minute
        if (eventEnd.isSame(apEnd, 'day')) {
          if (eventEnd.isAfter(apEnd, 'minute')) return false
        }
      }

      return true
    },
    [currentClass?.applicationPeriod]
  )

  const appointmentSchedules = useMemo(() => {
    return [
      ...(currentClass?.appointment?.availability?.availableSchedules ?? []),
    ]
  }, [currentClass?.appointment?.availability?.availableSchedules])

  const recurringSchedules = useMemo(() => {
    return currentClass?.recurringSchedules ?? []
  }, [currentClass?.recurringSchedules])

  const workshopSchedules = useMemo(() => {
    return currentClass?.regularPeriods || []
  }, [currentClass?.regularPeriods])

  const workshopLessons = useMemo(() => {
    return workshopSchedules
      .flatMap(schedule => schedule.lessons ?? [])
      .map(
        d =>
          ({
            ...d,
            id: generateIdEventByTimeSlot(d.startTime, dayjs(d.startTime)),
            lessonId: d.id,
          } as PeriodLessonsStringId)
      )
  }, [workshopSchedules])

  const appointmentDateOverrides = useMemo(() => {
    return [...(currentClass?.appointment?.availability?.dateOverrides ?? [])]
  }, [currentClass?.appointment?.availability?.dateOverrides])

  const appointmentAvailableDays: Date[] = useMemo(() => {
    let schedules: Date[] = []
    if (appointmentSchedules) {
      schedules = getDatesForWeekdays(
        appointmentSchedules.map(schedule => schedule.dayOfWeek) ?? [],
        currentDate.getFullYear(),
        currentDate.getMonth() + 1
      )
    }
    schedules = schedules.filter(date => isWithinApplicationPeriod(date))
    let overrides: Date[] = []
    if (appointmentDateOverrides) {
      overrides = appointmentDateOverrides
        .filter(o => o.isAvailable)
        .map(o => {
          if (!o.startTime) {
            schedules = schedules.filter(p => !dayjs(p).isSame(o.date, 'd'))
          }
          return o.startTime
            ? parseTimeToDate(o.startTime, new Date(o.date))
            : null
        })
        .filter(Boolean) as Date[]
    }

    return [...schedules, ...overrides].filter(date =>
      dayjs(date).isAfter(dayjs(), 'day')
    )
  }, [
    appointmentDateOverrides,
    appointmentSchedules,
    currentDate,
    isWithinApplicationPeriod,
  ])

  const recurringAvailableDays = useMemo(() => {
    // Available days are the days of the week in one month
    // Get weeks on the current month
    return getDatesForWeekdays(
      recurringSchedules.map(schedule => schedule.weekDay) || [],
      currentDate.getFullYear(),
      currentDate.getMonth() + 1
    )
      .filter(date => dayjs(date).isAfter(dayjs(), 'day'))
      .filter(date => isWithinApplicationPeriod(date))
  }, [recurringSchedules, currentDate, isWithinApplicationPeriod])

  const value = useMemo(
    () => ({
      isViewOnly,
      isOpenDialog,
      setOpenDialog,
      regularV2Lessons,
      setRegularV2Lessons,
      selectedSessions,
      setSelectedSessions,
      currentClass,
      setCurrentClass,
      currentDate,
      setCurrentDate,
      appointmentSchedules,
      appointmentDateOverrides,
      recurringSchedules,
      appointmentAvailableDays,
      recurringAvailableDays,
      workshopLessons,
      manuallySelectedPrice,
      setManuallySelectedPrice,
      isWithinApplicationPeriodForEvent,
      // New values for showing all classes
      showAllClassesInCourse,
      setShowAllClassesInCourse,
      selectedCourseId,
      setSelectedCourseId,
      allClassesInCourse,
      setAllClassesInCourse,
      allClassesLessonsData,
      setAllClassesLessonsData,
    }),
    [
      isViewOnly,
      isOpenDialog,
      regularV2Lessons,
      selectedSessions,
      currentDate,
      setCurrentDate,
      currentClass,
      appointmentSchedules,
      appointmentDateOverrides,
      recurringSchedules,
      appointmentAvailableDays,
      recurringAvailableDays,
      workshopLessons,
      manuallySelectedPrice,
      isWithinApplicationPeriodForEvent,
      // New dependencies
      showAllClassesInCourse,
      selectedCourseId,
      allClassesInCourse,
      allClassesLessonsData,
    ]
  )
  return (
    <InvoiceEditorContext.Provider value={value}>
      {children}
    </InvoiceEditorContext.Provider>
  )
}

export function useInvoiceEditorContext(): InvoiceEditorContextType {
  const context = useContext(InvoiceEditorContext)
  if (!context) {
    throw new Error(
      'useInvoiceEditorContext must be used within an InvoiceEditorProvider'
    )
  }
  return context
}
