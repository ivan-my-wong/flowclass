import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { useRecoilValue, useSetRecoilState } from 'recoil'

import { getAllClassesLessonsInCourse } from '@/api/class'
import { Button } from '@/components/ui/Button'
import { useEvents } from '@/components/ui/FullCalendar/EventProvider'
import { useRegularClassData } from '@/hooks/useRegularClassData'
import useSiteData from '@/hooks/useSiteData'
import {
  availableLessonsByClassState,
  currentActiveStudentState,
  invoiceSessionState,
} from '@/stores/studentInvoice.store'
import type { RecurringScheduleWithKey } from '@/types/appointment'
import { Classes } from '@/types/classes'
import { ClassTypeEnum } from '@/types/course'
import type { CalendarEvent } from '@/types/fullCalendar.type'
import type { LessonPreview } from '@/types/regularClass'
import { generateTimeslots, getDatesForWeekdays } from '@/utils/date.utils'
import dayjs from '@/utils/dayjs'
import { generateIdEventByTimeSlot } from '@/utils/invoice-campaign.utils'

import EditorAction from './EditorAction'
import { useInvoiceEditorContext } from './InvoiceEditorContext'
import MultiplePriceInfo from './MultiplePriceInfo'
import SessionEmpty from './SessionEmpty'
import SessionItem from './SessionItem'

const SelectedSessionSide = (): JSX.Element => {
  const { t } = useTranslation('invoiceCampaign')
  const [searchParams] = useSearchParams()
  const isEditLessonMode = searchParams.has('edit')
  const currentActiveStudent = useRecoilValue(currentActiveStudentState)
  const allInvoiceSessions = useRecoilValue(invoiceSessionState)
  const eventContext = useEvents()
  const {
    selectedSessions,
    currentClass: classData,
    setSelectedSessions,
    setRegularV2Lessons,
    recurringAvailableDays,
    workshopLessons,
    appointmentSchedules,
    appointmentAvailableDays,
    appointmentDateOverrides,
    regularV2Lessons,
    isWithinApplicationPeriodForEvent,
    // New states for all classes view
    showAllClassesInCourse,
    selectedCourseId,
    allClassesInCourse,
    setAllClassesInCourse,
    allClassesLessonsData,
    setAllClassesLessonsData,
  } = useInvoiceEditorContext()

  const [isLoadingAllClasses, setIsLoadingAllClasses] = useState(false)
  const setAvailableLessonsByClass = useSetRecoilState(
    availableLessonsByClassState
  )

  const { usePreviewClassLessons } = useRegularClassData()
  const { data: lessonsData } = usePreviewClassLessons(classData ?? undefined)
  const { getCurrentSiteTimeZoneDate, convertDateToCurrentTimeZoneUTCString } =
    useSiteData()

  useEffect(() => {
    setRegularV2Lessons(lessonsData?.lessons || [])
  }, [setRegularV2Lessons, lessonsData?.lessons])

  // Populate available lessons by class for package discount auto-apply
  useEffect(() => {
    if (lessonsData?.lessons && classData?.id) {
      setAvailableLessonsByClass(prev => ({
        ...prev,
        [classData.id]: lessonsData.lessons.map(lesson => ({
          id: lesson.id,
          date: lesson.date,
          period: lesson.period,
        })),
      }))
    }
  }, [lessonsData?.lessons, classData?.id, setAvailableLessonsByClass])

  // Fetch all classes lessons when toggle is ON
  useEffect(() => {
    const fetchAllClassesLessons = async () => {
      if (
        showAllClassesInCourse &&
        selectedCourseId &&
        classData?.institutionId
      ) {
        setIsLoadingAllClasses(true)
        try {
          const data = await getAllClassesLessonsInCourse(
            selectedCourseId,
            classData.institutionId
          )
          setAllClassesLessonsData(data)

          // Extract all classes from the response
          const classes = data.classes.map(classItem => ({
            ...classData, // Use current class as base
            id: classItem.classId,
            name: classItem.className,
            type: classItem.type as ClassTypeEnum,
          }))
          setAllClassesInCourse(classes as any[])
        } catch (error) {
          console.error('Error fetching all classes lessons:', error)
        } finally {
          setIsLoadingAllClasses(false)
        }
      }
    }

    fetchAllClassesLessons()
  }, [
    showAllClassesInCourse,
    selectedCourseId,
    classData?.institutionId,
    classData,
    setAllClassesInCourse,
  ])

  // Helper function to sort sessions by lessonNumber
  const sortSessionsByLessonNumber = useCallback(
    (sessions: LessonPreview[]): LessonPreview[] => {
      return [...sessions].sort((a, b) => {
        const lessonNumA = a.lessonNumber ?? 0
        const lessonNumB = b.lessonNumber ?? 0
        if (lessonNumA !== lessonNumB) {
          return lessonNumA - lessonNumB
        }
        // Fallback to startTime if lessonNumber is the same
        return dayjs(a.startTime).unix() - dayjs(b.startTime).unix()
      })
    },
    []
  )

  const handleRemoveSession = (sessionId: number, uniqueKey?: string) => {
    setSelectedSessions(prevSessions => {
      let filtered: LessonPreview[]
      // If uniqueKey is provided, use it for more precise deletion
      if (uniqueKey) {
        filtered = prevSessions.filter((session, index) => {
          const sessionKey = `${session.id}-${session.startTime}-${index}`
          return sessionKey !== uniqueKey
        })
      } else {
        // Fallback to ID-based deletion (may remove duplicates)
        filtered = prevSessions.filter(session => session.id !== sessionId)
      }
      return sortSessionsByLessonNumber(filtered)
    })
  }

  // Get the max numberOfLessons from price options (for recurring classes)
  const recurringMaxLessons = useMemo(() => {
    if (
      !classData?.priceOptions ||
      classData.priceOptions.length === 0 ||
      classData.type !== ClassTypeEnum.recurring
    ) {
      return 0
    }
    return Math.max(
      ...classData.priceOptions.map(option => option.numberOfLessons ?? 0)
    )
  }, [classData?.priceOptions, classData?.type])

  // Get the next target number of lessons based on price options
  const nextRecurringLessonTarget = useMemo(() => {
    if (
      classData?.type !== ClassTypeEnum.recurring ||
      !classData.priceOptions ||
      classData.priceOptions.length === 0
    ) {
      return null
    }

    const currentCount = selectedSessions.length

    // Sort price options by numberOfLessons
    const sortedPriceOptions = [...classData.priceOptions].sort(
      (a, b) => (a.numberOfLessons ?? 0) - (b.numberOfLessons ?? 0)
    )

    // Find the next price option
    const nextOption = sortedPriceOptions.find(
      option => (option.numberOfLessons ?? 0) > currentCount
    )

    return nextOption?.numberOfLessons ?? null
  }, [classData?.priceOptions, classData?.type, selectedSessions.length])

  const regularV2LessonsByPeriod = useMemo(() => {
    const map = new Map<number | undefined, LessonPreview[]>()
    regularV2Lessons.forEach(lesson => {
      const key = lesson.period
      if (!map.has(key)) {
        map.set(key, [])
      }
      map.get(key)?.push(lesson)
    })
    return map
  }, [regularV2Lessons])

  const regularV2RemainingLessonCount = useMemo(() => {
    if (classData?.type !== ClassTypeEnum.regularV2) {
      return 0
    }

    if (!selectedSessions.length) {
      return 0
    }

    const periods = selectedSessions.map(item => item.period)
    const [periodOfFirstLesson] = periods

    const isAllLessonHasSamePeriod = periods.every(
      value => value === periodOfFirstLesson
    )

    if (!isAllLessonHasSamePeriod) return 0

    const allLessonsInPeriod =
      regularV2LessonsByPeriod.get(periodOfFirstLesson) ?? []

    if (allLessonsInPeriod.length === 0) return 0

    const selectedLessonIds = new Set(
      selectedSessions.map(session => session.id.toString())
    )

    const unselectedLessons = allLessonsInPeriod.filter(
      lesson => !selectedLessonIds.has(lesson.id.toString())
    )

    return unselectedLessons.length
  }, [classData?.type, regularV2LessonsByPeriod, selectedSessions])

  // Calculate how many lessons to add
  const recurringLessonsRemaining = useMemo(() => {
    if (
      classData?.type !== ClassTypeEnum.recurring ||
      nextRecurringLessonTarget === null ||
      nextRecurringLessonTarget === undefined
    ) {
      return 0
    }
    const currentCount = selectedSessions.length
    return Math.max(nextRecurringLessonTarget - currentCount, 0)
  }, [classData?.type, nextRecurringLessonTarget, selectedSessions.length])

  const regularV2WeeksToAdd = useMemo(() => {
    if (
      classData?.type !== ClassTypeEnum.regularV2 ||
      selectedSessions.length === 0
    ) {
      return 0
    }
    if (!Array.isArray(regularV2Lessons) || regularV2Lessons.length === 0) {
      return regularV2RemainingLessonCount > 0 ? 1 : 0
    }

    const [firstLesson] = selectedSessions
    const allLessonsOfXPeriod = regularV2Lessons.filter(
      item => item.period === firstLesson.period
    )

    // Sort lessons by start time
    const sortedLessons = [...allLessonsOfXPeriod].sort(
      (a, b) => dayjs(a.startTime).unix() - dayjs(b.startTime).unix()
    )

    const nextLessons = sortedLessons.filter(
      lesson =>
        !selectedSessions.some(
          selected => selected.id.toString() === lesson.id.toString()
        )
    )

    const nextLessonTarget = nextLessons[regularV2RemainingLessonCount - 1]

    if (!nextLessonTarget) return 1

    const lastSelectedDate = dayjs(
      selectedSessions[selectedSessions.length - 1].startTime
    )

    const weekDiff = dayjs(nextLessonTarget.startTime).diff(
      lastSelectedDate,
      'week',
      true
    )

    return Math.ceil(weekDiff) || 1
  }, [
    classData?.type,
    regularV2Lessons,
    regularV2RemainingLessonCount,
    selectedSessions,
  ])

  const showRegularV2AddAllButton = useMemo(() => {
    if (classData?.type !== ClassTypeEnum.regularV2) return false
    if (!selectedSessions.length) return false
    if (regularV2RemainingLessonCount <= 0) return false
    return true
  }, [classData?.type, regularV2RemainingLessonCount, selectedSessions.length])

  const addAllRegularV2Lessons = () => {
    if (
      classData?.type !== ClassTypeEnum.regularV2 ||
      selectedSessions.length === 0
    )
      return

    const targetPeriod = selectedSessions[0]?.period
    if (targetPeriod === undefined || targetPeriod === null) return

    const selectedLessonIds = new Set(
      selectedSessions.map(session => session.id.toString())
    )
    const newLessons = regularV2Lessons.filter(
      lesson =>
        lesson.period === targetPeriod &&
        !selectedLessonIds.has(lesson.id.toString())
    )

    if (!newLessons.length) return

    setSelectedSessions(prev => {
      const uniqueLessons = [...prev, ...newLessons].reduce(
        (acc, lesson) => {
          const key = lesson.id.toString()
          if (!acc.map.has(key)) {
            acc.map.set(key, lesson)
            acc.list.push(lesson)
          }
          return acc
        },
        { map: new Map<string, LessonPreview>(), list: [] as LessonPreview[] }
      )
      return sortSessionsByLessonNumber(uniqueLessons.list)
    })
  }

  const showRecurringAddAllButton = useMemo(() => {
    if (classData?.type !== ClassTypeEnum.recurring) return false
    if (!selectedSessions.length) return false
    if (recurringLessonsRemaining <= 0) return false
    return true
  }, [classData?.type, recurringLessonsRemaining, selectedSessions.length])

  const addAllRecurringLessons = () => {
    if (selectedSessions.length === 0) return
    if (!classData) return

    if (recurringMaxLessons <= 0) return

    // Start from the latest selected lesson in the array (includes previously added lessons)
    const lastSelected = dayjs(
      selectedSessions[selectedSessions.length - 1].startTime
    )
    const lastSelectedWeek = lastSelected.startOf('week')

    // Generate dates for multiple months ahead if needed
    // Calculate how many months we need to look ahead (needed weeks / 4 weeks per month + buffer)
    const monthsToGenerate = Math.ceil(recurringLessonsRemaining / 4) + 2 // Add 2 months buffer
    const allAvailableDays: Date[] = []

    // Import getDatesForWeekdays dynamically or use it from context
    const weekdays = classData.recurringSchedules?.map(s => s.weekDay) || []
    const currentYear = lastSelected.year()
    const currentMonth = lastSelected.month() + 1

    // Generate dates for current and future months
    for (let monthOffset = 0; monthOffset <= monthsToGenerate; monthOffset++) {
      const targetMonth = currentMonth + monthOffset
      const targetYear =
        targetMonth > 12
          ? currentYear + Math.floor((targetMonth - 1) / 12)
          : currentYear
      const actualMonth =
        targetMonth > 12 ? ((targetMonth - 1) % 12) + 1 : targetMonth

      try {
        const monthDates = getDatesForWeekdays(
          weekdays,
          targetYear,
          actualMonth
        )
        allAvailableDays.push(...monthDates)
      } catch (error) {
        console.error(
          `Error generating dates for ${targetYear}-${actualMonth}:`,
          error
        )
      }
    }

    // Filter dates that are after today and within application period
    // Use the same logic as recurringAvailableDays calculation
    const sortedDays = [
      ...allAvailableDays
        .filter(date => dayjs(date).isAfter(dayjs(), 'day'))
        .filter(date => {
          // Check if within application period
          if (!classData.applicationPeriod) return true
          const dateDayjs = dayjs(date)
          const { startDatetime, endDatetime } = classData.applicationPeriod

          // Check if the date is after the start date
          if (startDatetime) {
            const apStart = dayjs(startDatetime)
            if (dateDayjs.isBefore(apStart, 'day')) return false
          }

          // Check if the date is before the end date
          if (endDatetime) {
            const apEnd = dayjs(endDatetime)
            if (dateDayjs.isAfter(apEnd, 'day')) return false
          }

          return true
        }),
    ].sort((a, b) => dayjs(a).unix() - dayjs(b).unix())

    // Filter dates that are strictly after the last selected date (not same day)
    // and ensure they're from a different week
    const datesAfterLastSelected = sortedDays.filter(date => {
      const dateDayjs = dayjs(date)
      const dateWeek = dateDayjs.startOf('week')
      // Must be after the last selected date AND from a different week
      return (
        dateDayjs.isAfter(lastSelected, 'day') &&
        dateWeek.isAfter(lastSelectedWeek)
      )
    })

    // Group dates by week (year-week) - using startOf('week') to group by week
    const datesByWeek = new Map<string, Date[]>()
    datesAfterLastSelected.forEach(date => {
      const weekStart = dayjs(date).startOf('week')
      // Use the week start's timestamp as a unique key for the week
      const weekKey = weekStart.format('YYYY-MM-DD')
      if (!datesByWeek.has(weekKey)) {
        datesByWeek.set(weekKey, [])
      }
      datesByWeek.get(weekKey)!.push(date)
    })

    // Get one lesson per week (first available date in each week, first schedule for that date)
    const nextLessons: Array<{
      id: number
      startTime: string
      endTime: string
      date: string
      lessonNumber: number
      isBlocked: boolean
      isOverride: boolean
      classItem: Classes
    }> = []
    const sortedWeeks = Array.from(datesByWeek.entries()).sort(
      ([weekA], [weekB]) => {
        const dateA = datesByWeek.get(weekA)?.[0]
        const dateB = datesByWeek.get(weekB)?.[0]
        if (!dateA || !dateB) return 0
        return dayjs(dateA).unix() - dayjs(dateB).unix()
      }
    )

    // Calculate the starting lesson number based on existing sessions
    const maxLessonNumber =
      selectedSessions.length > 0
        ? Math.max(...selectedSessions.map(s => s.lessonNumber ?? 0))
        : 0

    sortedWeeks.forEach(([, weekDates], weekIndex) => {
      if (nextLessons.length >= recurringLessonsRemaining) return

      // Sort dates in the week and take the first one
      const sortedWeekDates = [...weekDates].sort(
        (a, b) => dayjs(a).unix() - dayjs(b).unix()
      )
      const firstDateInWeek = sortedWeekDates[0]

      // Get the first schedule for this date (one lesson per week)
      const schedules =
        classData.recurringSchedules?.filter(
          s => s.weekDay === dayjs(firstDateInWeek).day()
        ) || []

      if (schedules.length === 0) return

      // Take only the first schedule for this date
      const schedule = schedules[0]
      const startTime = dayjs(schedule.startTime, 'HH:mm')
      const endTime = dayjs(schedule.endTime, 'HH:mm')

      const start = dayjs(firstDateInWeek)
        .hour(startTime.hour())
        .minute(startTime.minute())
        .toDate()
      const end = dayjs(firstDateInWeek)
        .hour(endTime.hour())
        .minute(endTime.minute())
        .toDate()

      if (!isWithinApplicationPeriodForEvent(start, end)) return

      // Use toISOString() to match manual selection behavior
      const startTimeISO = dayjs(start).toISOString()
      const endTimeISO = dayjs(end).toISOString()

      nextLessons.push({
        id: Number.parseInt(
          generateIdEventByTimeSlot(firstDateInWeek, startTime),
          10
        ),
        startTime: startTimeISO,
        endTime: endTimeISO,
        date: dayjs(firstDateInWeek).format('YYYY-MM-DD'),
        lessonNumber: maxLessonNumber + nextLessons.length + 1,
        isBlocked: false,
        isOverride: false,
        classItem: classData,
      })
    })

    if (nextLessons.length < recurringLessonsRemaining) {
      console.warn(
        `Not enough recurring lessons available. Need ${recurringLessonsRemaining}, but only ${nextLessons.length} available.`
      )
    }

    // Filter out any lessons that already exist in selectedSessions
    // Check by date and startTime to prevent duplicates
    setSelectedSessions(prev => {
      const existingLessons = new Set(
        prev.map(
          lesson => `${lesson.date}-${dayjs(lesson.startTime).format('HH:mm')}`
        )
      )

      const newLessonsToAdd = nextLessons.filter(lesson => {
        const lessonKey = `${lesson.date}-${dayjs(lesson.startTime).format(
          'HH:mm'
        )}`
        return !existingLessons.has(lessonKey)
      })

      return sortSessionsByLessonNumber([...prev, ...newLessonsToAdd])
    })
  }

  // Track the last student we loaded sessions for to detect student changes
  const lastLoadedStudentIdRef = useRef<number | null>(null)

  useEffect(() => {
    if (isEditLessonMode && currentActiveStudent && allInvoiceSessions) {
      // Only load sessions if this is a different student or class
      const shouldLoadSessions =
        lastLoadedStudentIdRef.current !== currentActiveStudent.id ||
        !selectedSessions.length

      if (shouldLoadSessions) {
        // Load this student's sessions for editing - create a deep copy to avoid shared references
        const studentClassSessions = allInvoiceSessions
          .filter(
            item =>
              item.studentItem?.id === currentActiveStudent.id &&
              item.classItem?.classId === classData?.id
          )
          .map(session => ({
            ...session,
            // Ensure we create a new object to avoid shared references
          }))
        setSelectedSessions(sortSessionsByLessonNumber(studentClassSessions))
        lastLoadedStudentIdRef.current = currentActiveStudent.id
      }
    } else if (lastLoadedStudentIdRef.current !== null) {
      // Reset selectedSessions when not in edit mode or when student changes
      setSelectedSessions([])
      lastLoadedStudentIdRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditLessonMode, classData?.id, currentActiveStudent?.id])

  const regularEvents = useMemo<CalendarEvent[]>(() => {
    // If showing all classes, merge lessons from all classes
    if (showAllClassesInCourse && allClassesLessonsData) {
      const allLessons: CalendarEvent[] = []

      allClassesLessonsData.classes.forEach(classItem => {
        classItem.lessons.forEach((lesson: LessonPreview) => {
          try {
            const start = getCurrentSiteTimeZoneDate(lesson.startTime)
            const end = getCurrentSiteTimeZoneDate(lesson.endTime)
            const isMultipleDays = !dayjs(start).isSame(end, 'day')

            allLessons.push({
              id: lesson.id.toString(),
              type: classItem.type as ClassTypeEnum,
              title: classItem.courseName,
              subtitle: classItem.className,
              classId: classItem.classId, // Important for color coding
              courseId: classItem.courseId,
              className: classItem.className,
              color: classItem.color, // Use color from API
              start,
              end,
              isMultipleDays,
              instructorEmail: classItem.instructor?.email,
              instructorId: classItem.instructor?.id,
              instructorName: classItem.instructor?.fullName,
              locationId: classItem.locationRoom?.id,
              locationName: classItem.locationRoom?.name ?? 'Online',
            } as CalendarEvent)
          } catch (error) {
            console.error(
              `Error parsing dates for lesson ${lesson.id} in class ${classItem.classId}:`,
              error
            )
          }
        })
      })

      return allLessons
    }

    // Original logic for single class
    const newLessons = (lessonsData?.lessons ?? []).map(
      (lesson: LessonPreview) => {
        try {
          const start = getCurrentSiteTimeZoneDate(lesson.startTime)
          const end = getCurrentSiteTimeZoneDate(lesson.endTime)
          const isMultipleDays = !dayjs(start).isSame(end, 'day')
          return {
            id: lesson.id.toString(),
            type: classData?.type || ClassTypeEnum.regularV2,
            title: classData?.course?.name ?? 'Untitled Course',
            subtitle: classData?.name ?? 'Untitled Class',
            classId: classData?.id,
            courseId: classData?.course?.id,
            className: classData?.name,
            color: 'border-green-500',
            start,
            end,
            isMultipleDays,
            instructorEmail: classData?.instructor?.email,
            instructorId: classData?.instructor?.id,
            instructorName: classData?.instructor?.fullName,
            locationId: classData?.locationRoom?.id,
            locationName: classData?.locationRoom?.name ?? 'Online',
          } as CalendarEvent
        } catch (error) {
          console.error(`Error parsing dates for lesson ${lesson.id}:`, error)
          return null
        }
      }
    )
    return newLessons.filter((event): event is CalendarEvent => event !== null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonsData?.lessons, classData])

  const workshopEvents = useMemo(() => {
    const newLessons = workshopLessons.map(lesson => {
      try {
        const start = getCurrentSiteTimeZoneDate(lesson.startTime)
        const end = getCurrentSiteTimeZoneDate(lesson.endTime)
        const isMultipleDays = !dayjs(start).isSame(end, 'day')
        return {
          id: lesson.id,
          type: classData?.type || ClassTypeEnum.workshop,
          title: classData?.course?.name ?? 'Untitled Course',
          subtitle: classData?.name ?? 'Untitled Class',
          color: 'border-yellow-500',
          start,
          end,
          isMultipleDays,
          instructorEmail: classData?.instructor?.email,
          instructorId: classData?.instructor?.id,
          instructorName: classData?.instructor?.fullName,
          locationId: classData?.locationRoom?.id,
          locationName: classData?.locationRoom?.name ?? 'Online',
        } as CalendarEvent
      } catch (error) {
        console.error(
          `Error parsing dates for workshop lesson ${lesson.id}:`,
          error
        )
        return null
      }
    })

    return newLessons.filter((event): event is CalendarEvent => event !== null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workshopLessons, classData])

  const recurringEvents = useMemo(() => {
    const newLessons = recurringAvailableDays.flatMap((date: Date) => {
      // Get ALL schedules for this weekday (not just the first one)
      const schedules =
        classData?.recurringSchedules?.filter(
          schedule => schedule.weekDay === dayjs(date).day()
        ) || []

      return schedules
        .map(schedule => {
          try {
            const startTime = dayjs(schedule.startTime, 'HH:mm')
            const endTime = dayjs(schedule.endTime, 'HH:mm')
            if (!startTime.isValid() || !endTime.isValid()) {
              console.error(`Invalid time format for recurring schedule`, {
                startTime: schedule.startTime,
                endTime: schedule.endTime,
              })
              return null
            }
            const start = dayjs(date)
              .hour(startTime.hour())
              .minute(startTime.minute())
              .toDate()
            const end = dayjs(date)
              .hour(endTime.hour())
              .minute(endTime.minute())
              .toDate()
            if (!isWithinApplicationPeriodForEvent(start, end)) return null

            return {
              id: generateIdEventByTimeSlot(date, startTime),
              type: classData?.type || ClassTypeEnum.recurring,
              title: classData?.course?.name ?? 'Untitled Course',
              subtitle: classData?.name ?? 'Untitled Class',
              color: 'border-yellow-500',
              start: dayjs(date)
                .hour(startTime.hour())
                .minute(startTime.minute())
                .toDate(),
              end: dayjs(date)
                .hour(endTime.hour())
                .minute(endTime.minute())
                .toDate(),
              instructorEmail: classData?.instructor?.email,
              instructorId: classData?.instructor?.id,
              instructorName: classData?.instructor?.fullName,
              locationId: classData?.locationRoom?.id,
              locationName: classData?.locationRoom?.name ?? 'Online',
            } as CalendarEvent
          } catch (error) {
            console.error(`Error parsing dates for recurring lesson`, error)
            return null
          }
        })
        .filter((event): event is CalendarEvent => event !== null)
    })
    return newLessons
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recurringAvailableDays, classData])

  const getTimeslot = useCallback(
    (selectedDate: Date) => {
      const opts = generateTimeslots(selectedDate, classData?.appointment)
      const timeSlotsOptions: RecurringScheduleWithKey[] = opts.map(
        (timeSlot, index) => {
          const startTime = dayjs(timeSlot.start).format('HH:mm')
          const endTime = dayjs(timeSlot.end).format('HH:mm')
          const weekDay = selectedDate.getDay() || 0
          const key = `${startTime}-${endTime}-${index}`

          return {
            ...timeSlot,
            startTime,
            endTime,
            weekDay,
            classId: classData?.id || 0,
            id: new Date(timeSlot.start).getTime() + index,
            key,
          }
        }
      )
      return timeSlotsOptions
    },
    [classData?.appointment, classData?.id]
  )

  const appointmentEvents = useMemo(() => {
    const newLessons = appointmentAvailableDays.map((date: Date, indexDate) => {
      const isOverrideDate = appointmentDateOverrides?.some(
        o => o.isAvailable && dayjs(o.date).isSame(date, 'day')
      )

      const schedule = appointmentSchedules.find(
        d => d.dayOfWeek === dayjs(date).day()
      )
      if (!schedule && !isOverrideDate) return null

      const timeslots = getTimeslot(date)

      return timeslots.map((slot, indexSlot) => {
        const startTime = dayjs(slot.startTime, 'HH:mm')
        const endTime = dayjs(slot.endTime, 'HH:mm')
        if (!startTime.isValid() || !endTime.isValid()) {
          console.error(`Invalid time format for schedule ${slot.id}`)
          return null
        }

        const start = dayjs(date)
          .hour(startTime.hour())
          .minute(startTime.minute())
          .toDate()
        const end = dayjs(date)
          .hour(endTime.hour())
          .minute(endTime.minute())
          .toDate()

        if (!isOverrideDate && !isWithinApplicationPeriodForEvent(start, end)) {
          return null
        }

        return {
          id: (startTime.toDate().getTime() + indexSlot + indexDate).toString(),
          type: classData?.type || ClassTypeEnum.recurring,
          title: classData?.course?.name ?? 'Untitled Course',
          subtitle: classData?.name ?? 'Untitled Class',
          color: 'border-yellow-500',
          start: dayjs(date)
            .hour(startTime.hour())
            .minute(startTime.minute())
            .toDate(),
          end: dayjs(date)
            .hour(endTime.hour())
            .minute(endTime.minute())
            .toDate(),
          instructorEmail: classData?.instructor?.email,
          instructorId: classData?.instructor?.id,
          instructorName: classData?.instructor?.fullName,
          locationId: classData?.locationRoom?.id,
          locationName: classData?.locationRoom?.name ?? 'Online',
        } as CalendarEvent
      })
    })
    return newLessons
      .flatMap(e => e)
      .filter((event): event is CalendarEvent => event !== null)
  }, [
    appointmentAvailableDays,
    appointmentDateOverrides,
    appointmentSchedules,
    classData,
    getTimeslot,
    isWithinApplicationPeriodForEvent,
  ])

  useEffect(() => {
    const lessonMap = {
      [ClassTypeEnum.regularV2]: regularEvents,
      [ClassTypeEnum.recurring]: recurringEvents,
      [ClassTypeEnum.appointment]: appointmentEvents,
      [ClassTypeEnum.workshop]: workshopEvents,
    }

    if (eventContext && classData && classData?.type in lessonMap) {
      eventContext.setEvents(lessonMap[classData.type] ?? [])
    }
  }, [
    classData,
    regularEvents,
    recurringEvents,
    appointmentEvents,
    workshopEvents,
  ])

  const sortedSessions = useMemo(
    () => sortSessionsByLessonNumber(selectedSessions),
    [selectedSessions, sortSessionsByLessonNumber]
  )

  // Create a unique identifier for each session to ensure proper deletion
  // Use index as fallback to ensure uniqueness even if date/time are the same
  const sessionsWithUniqueKeys = useMemo(
    () =>
      sortedSessions.map((session, index) => ({
        ...session,
        uniqueKey: `${session.id}-${session.startTime}-${index}`,
      })),
    [sortedSessions]
  )

  // Helper to get the correct class for a session (for multi-class mode)
  const getClassForSession = useCallback(
    (session: LessonPreview & { classId?: number }) => {
      // If showing all classes and session has classId, find the correct class
      if (showAllClassesInCourse && session.classId && allClassesLessonsData) {
        const classInfo = allClassesLessonsData.classes.find(
          c => c.classId === session.classId
        )
        if (classInfo) {
          // Return a partial Classes object with the info we have
          return {
            id: classInfo.classId,
            name: classInfo.className,
            type: classInfo.type as any,
            color: classInfo.color, // Add color for visual matching
            course: {
              id: classInfo.courseId,
              name: classInfo.courseName,
            },
            instructor: classInfo.instructor,
            locationRoom: classInfo.locationRoom,
          } as Classes & { color?: string }
        }
      }
      // Default to current class
      return classData
    },
    [showAllClassesInCourse, allClassesLessonsData, classData]
  )

  return (
    <div className="w-[30%] border-l">
      <div className="space-y-2 px-4 pb-4">
        <EditorAction />
        <div className="flex flex-col bg-background">
          {classData?.priceOptions && classData?.priceOptions.length > 1 && (
            <MultiplePriceInfo />
          )}
        </div>
        <div className="flex flex-col h-fit gap-2 overflow-y-auto max-h-[50vh] justify-start">
          {sortedSessions.length === 0 && <SessionEmpty />}
          {classData &&
            sessionsWithUniqueKeys.map(session => {
              const sessionClassItem = getClassForSession(session as any)
              return (
                <SessionItem
                  key={session.uniqueKey}
                  session={session}
                  classItem={sessionClassItem ?? undefined}
                  onDelete={() => {
                    handleRemoveSession(session.id, session.uniqueKey)
                  }}
                />
              )
            })}
        </div>
        {showRecurringAddAllButton && (
          // For recurring classes, always show the button if there are selected sessions and not at max
          <Button
            className="w-full border-primary text-primary min-h-[auto] py-2"
            variant="outline"
            onClick={addAllRecurringLessons}
          >
            <span className="whitespace-normal text-center leading-tight">
              {t('editor.addLessonsInNextWeeks', {
                count: Math.max(1, recurringLessonsRemaining),
              })}
            </span>
          </Button>
        )}
        {showRegularV2AddAllButton && regularV2WeeksToAdd > 0 && (
          <Button
            className="w-full border-primary text-primary min-h-[auto] py-2"
            variant="outline"
            onClick={addAllRegularV2Lessons}
          >
            <span className="whitespace-normal text-center leading-tight">
              {t('editor.addLessonsInNextWeeks', {
                count: regularV2WeeksToAdd,
              })}
            </span>
          </Button>
        )}
      </div>
    </div>
  )
}

export default SelectedSessionSide
