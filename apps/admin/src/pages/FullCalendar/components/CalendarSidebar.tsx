import { useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'

import { useDebounce } from '@uidotdev/usehooks'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { LuMenu, LuX } from 'react-icons/lu'
import Select, { MultiValue, StylesConfig } from 'react-select'
import { useRecoilValue } from 'recoil'

import CourseAndClassSelector from '@/components/Selector/CourseAndClassSelector'
import { selectCustomStyles } from '@/components/Selector/LabelSelector'
import { Button } from '@/components/ui/Button'
import { Calendar } from '@/components/ui/Calendar'
import Form, {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/Form'
import { useCalendar } from '@/components/ui/FullCalendar/CalendarProvider'
import { useCalendarSidebar } from '@/components/ui/FullCalendar/CalendarSidebarContext'
import { useEvents } from '@/components/ui/FullCalendar/EventProvider'
import { Input } from '@/components/ui/Inputs/Input'
import { Separator } from '@/components/ui/Separator'
import { Switch } from '@/components/ui/Switch'
import { DEBOUNCE_TIME } from '@/constants/common'
import { FEATURE_FLAG } from '@/constants/featureFlags'
import useBlockTimeData from '@/hooks/useBlockTimeData'
import useCourseData from '@/hooks/useCourseData'
import useLessonDateTimeData from '@/hooks/useLessonDateTimeData'
import usePromotionData from '@/hooks/usePromotionData'
import { useLocationRoom } from '@/hooks/useRoomLocation'
import useSiteData from '@/hooks/useSiteData'
import useUsersManagement from '@/hooks/useUsersManagement'
import QRCodeAttendanceModal, {
  QRCodeAttendanceModalHandle,
} from '@/pages/StudentCRM/QRCode/QRCodeAttendanceModal'
import { userState } from '@/stores/userData'
import {
  AboveInstructorRoles,
  userPermissionState,
  UserRole,
} from '@/stores/userPermissionData'
import { CourseSelectorItem, OptionProps } from '@/types/courseSelector.type'
import { CalendarEvent, CalendarEventFilter } from '@/types/fullCalendar.type'
import { ClassLesson } from '@/types/student'
import { cn } from '@/utils/cn'
import {
  getEarliestDayOfDifferentUnit,
  getNextEndDateFromCalendarView,
} from '@/utils/date.utils'
import dayjs from '@/utils/dayjs'
import { getCurrentWeek } from '@/utils/timeFormat'

import CheckConflict from './CheckConflict'

type CalendarSidebarProps = {
  className?: string
}

export function CalendarSidebar({
  className,
}: CalendarSidebarProps): JSX.Element {
  const [params, setSearchParams] = useSearchParams()
  const { setEvents } = useEvents()
  const { getCurrentSiteTimeZoneDate } = useSiteData()
  const { getFilteredCourseOptions } = useCourseData()
  const { view, currentDate, setCurrentDate, setIsLoading } = useCalendar()
  const { t } = useTranslation('calendar')

  const userPermission = useRecoilValue(userPermissionState)
  const currentUser = useRecoilValue(userState)

  const { useFetchCourseData } = usePromotionData()
  const { data: listCourses = [] } = useFetchCourseData()

  const { useFetchAllblockTimeData } = useBlockTimeData()
  const { data: blockTimeData } = useFetchAllblockTimeData()

  const { useFetchLocationRooms } = useLocationRoom()
  const { data: locationRooms } = useFetchLocationRooms()

  const options = getFilteredCourseOptions()

  const locationRoomsOptions = useMemo(() => {
    return (locationRooms || []).map(location => ({
      label: location.name,
      value: location.id?.toString() || '',
    }))
  }, [locationRooms])

  const { useGetInstructors } = useUsersManagement()
  const { data: instructors } = useGetInstructors()

  const instructorsOptions = useMemo(() => {
    return (instructors || []).map(instructor => ({
      label: `${instructor.user?.firstName} ${
        instructor.user?.lastName || ''
      } - ${instructor.user?.email}`,
      value: instructor.id?.toString() || '',
    }))
  }, [instructors])

  const { useFetchAllLessonData } = useLessonDateTimeData()

  const startDate = useMemo(() => {
    const date = params.get('startDate')
    return date ? new Date(date) : dayjs().startOf('month').toDate()
  }, [params])

  // Initialize end date with date from url query params
  const endDate = useMemo(() => {
    const date = params.get('endDate')
    return date ? new Date(date) : dayjs().endOf('month').toDate()
  }, [params])

  const form = useForm<CalendarEventFilter>({
    defaultValues: {
      onlyWithApplications: false,
      classes: [],
      student: '',
      location: [],
      teachers:
        AboveInstructorRoles.includes(userPermission) ||
        userPermission === UserRole.Guest
          ? []
          : [
              {
                label: `${currentUser.firstName} ${
                  currentUser.lastName || ''
                } - ${currentUser.email}`,
                value: currentUser.id.toString(),
              },
            ],
    },
  })
  const selectedClasses = form.watch('classes')

  const searchByStudent = form.watch('student')
  const isShowOnlyWithApplicant = form.watch('onlyWithApplications')
  const debouncedSearchByStudent = useDebounce(searchByStudent, DEBOUNCE_TIME)
  const debouncedSearchByCourseAndClass = useDebounce(
    selectedClasses,
    DEBOUNCE_TIME
  )
  const isDebouncedOnlyWithApplicant = useDebounce(
    isShowOnlyWithApplicant,
    DEBOUNCE_TIME
  )

  const searchByLocation = form.watch('location')
  const debouncedSearchByLocation = useDebounce(searchByLocation, DEBOUNCE_TIME)

  const searchByTeachers = form.watch('teachers')
  const debouncedSearchByTeachers = useDebounce(searchByTeachers, DEBOUNCE_TIME)

  const filter = {
    startDate,
    endDate,
    classIdSelected: selectedClasses?.map(o => +o.value),
    student: debouncedSearchByStudent,
    onlyWithApplications: isDebouncedOnlyWithApplicant,
    locationIds: searchByLocation?.map(o => +o.value),
    teacherIds: searchByTeachers?.map(o => +o.value),
  }

  const {
    refetch,
    data: classLessons,
    isLoading,
    isRefetching,
  } = useFetchAllLessonData(filter)

  const determineEventColor = (
    attendedCount: string | undefined,
    studentCount: string | undefined
  ) => {
    if (!attendedCount || !studentCount) return 'border-green-500'

    const numAttendedCount = Number(attendedCount) ?? 0
    const numStudentCount = Number(studentCount) ?? 0

    if (
      !Number.isFinite(numAttendedCount) ||
      !Number.isFinite(numStudentCount) ||
      numStudentCount <= 0
    )
      return undefined

    if (numAttendedCount <= 0) return 'border-gray-500' // all PENDING
    if (numAttendedCount >= numStudentCount) return 'border-green-500' // none PENDING
    return 'border-yellow-500' // some PENDING
  }

  const events = useMemo<CalendarEvent[]>(() => {
    const newLesson = (classLessons || []).map((lesson: ClassLesson) => {
      const color = determineEventColor(
        lesson.attendedCount,
        lesson.studentCount
      )
      try {
        const start = lesson.changeStartTime
          ? getCurrentSiteTimeZoneDate(lesson.changeStartTime)
          : getCurrentSiteTimeZoneDate(lesson.start as unknown as string)
        const end = lesson.changeEndTime
          ? getCurrentSiteTimeZoneDate(lesson.changeEndTime)
          : getCurrentSiteTimeZoneDate(lesson.end as unknown as string)
        const isMultipleDays = !dayjs(start).isSame(end, 'day')
        return {
          id: lesson.id.toString(),
          title: lesson.courseName,
          subtitle: lesson.class,
          color,
          start,
          end,
          isMultipleDays,
          instructorEmail: lesson.instructorEmail,
          instructorId: lesson.instructorId,
          instructorName: lesson.instructorName,
          locationId: lesson.locationId,
          locationName: lesson.locationName,
        } as CalendarEvent
      } catch (error) {
        console.error(`Error parsing dates for lesson ${lesson.id}:`, error)
        return null
      }
    })
    const validNewLesson = newLesson.filter(Boolean) as CalendarEvent[]

    if (blockTimeData) {
      const newBlockTime = blockTimeData.map(blockTime => {
        const start = getCurrentSiteTimeZoneDate(
          blockTime.startTime as unknown as string
        )
        const end = getCurrentSiteTimeZoneDate(
          blockTime.endTime as unknown as string
        )
        const isMultipleDays = !dayjs(start).isSame(end, 'day')
        return {
          start,
          end,
          isMultipleDays,
          blockTime: true,
          title: `${t('setting:systemSettings.blockTimeSetting')}`,
          color: 'bg-gray-500',
        } as CalendarEvent
      })
      return validNewLesson.concat(newBlockTime)
    }
    return validNewLesson
  }, [classLessons, blockTimeData])

  useEffect(() => {
    form.handleSubmit(onSubmit)()
  }, [
    debouncedSearchByStudent,
    debouncedSearchByCourseAndClass,
    isDebouncedOnlyWithApplicant,
    debouncedSearchByLocation,
    debouncedSearchByTeachers,
  ])

  const onSubmit = (data: CalendarEventFilter) => {
    setSearchParams({
      student: data.student,
      classes: data.classes.map(o => o.value).join(','),
      onlyWithApplications: data.onlyWithApplications ? 'true' : 'false',
      location: data.location.map(o => o.value).join(','),
      teachers: data.teachers.map(o => o.value).join(','),
    })
  }

  const qrCodeModalHandle = useRef<QRCodeAttendanceModalHandle>(null)
  const handleQrCodeScan = () => {
    qrCodeModalHandle.current?.handleOpenChange?.()
  }

  useEffect(() => {
    refetch()
  }, [params])

  useEffect(() => {
    setIsLoading(isLoading || isRefetching)
  }, [isLoading, isRefetching])

  useEffect(() => {
    setEvents(events)
  }, [events])

  const handleSetCurrentDateFromSideBar = (date: Date) => {
    const earliestDay = getEarliestDayOfDifferentUnit(date, view)
    setSearchParams({
      ...params,
      startDate: earliestDay.toISOString(),
      endDate: getNextEndDateFromCalendarView(earliestDay, view).toISOString(),
    })
    setCurrentDate(date)
  }

  const { isCollapsed, toggleSidebar } = useCalendarSidebar()

  return (
    <Form {...form}>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'fixed -left-1 top-1/2 z-10 h-8 w-8 rounded-l-none border bg-background shadow-md flex md:hidden'
          // isCollapsed && '-right-6'
        )}
        onClick={toggleSidebar}
      >
        {isCollapsed ? (
          <LuMenu className="h-4 w-4" />
        ) : (
          <LuX className="h-4 w-4" />
        )}
      </Button>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn(
          'transition-all duration-300 md:transition-none relative',
          isCollapsed
            ? 'w-0 translate-x-[-100%] md:translate-x-0 md:w-72'
            : 'w-72'
        )}
      >
        <div
          className={cn(
            className,
            'flex flex-col',
            isCollapsed && 'overflow-hidden'
          )}
        >
          <div>
            <Calendar
              mode="single"
              id="calendar-sidebar"
              selected={currentDate}
              onSelect={date => date && handleSetCurrentDateFromSideBar(date)}
              className="!m-0"
              aria-label={t('sidebar.filterByDate')}
              disabled={isLoading}
              data-testid="calendar-sidebar"
            />
          </div>
          <Separator className="my-2" />
          <div className="px-4 space-y-4 h-full overflow-y-auto">
            <FormField
              control={form.control}
              name="student"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">
                    {t('sidebar.searchByStudent')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('sidebar.searchByStudent').toString()}
                      {...field}
                      data-testid="search-by-student"
                      disabled={isLoading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="classes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">
                    {t('sidebar.filterByCourseAndClass')}
                  </FormLabel>
                  <FormControl>
                    <CourseAndClassSelector
                      value={field.value as OptionProps[]}
                      options={options}
                      onChange={(selectedOptions: MultiValue<OptionProps>) => {
                        field.onChange(selectedOptions)
                      }}
                      width="100%"
                      isDisabled={isLoading}
                      id="filter-by-course-and-class"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">
                    {t('sidebar.filterByLocation')}
                  </FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      options={locationRoomsOptions}
                      styles={selectCustomStyles('100%') as StylesConfig}
                      onChange={(opt: any) => {
                        field.onChange(opt)
                      }}
                      name="location-selector"
                      inputId="location-selector"
                      placeholder={t('teachingService:basic.selectLocation')}
                      isMulti
                      data-testid="filter-by-location"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div
              className={cn(
                !AboveInstructorRoles.includes(userPermission) && 'hidden'
              )}
            >
              <FormField
                control={form.control}
                name="teachers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">
                      {t('sidebar.filterByTeacher')}
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        options={instructorsOptions}
                        styles={selectCustomStyles('100%') as StylesConfig}
                        onChange={(opt: any) => {
                          field.onChange(opt)
                        }}
                        name="instructor-selector"
                        inputId="instructor-selector"
                        placeholder={t(
                          'teachingService:basic.selectInstructor'
                        )}
                        isDisabled={
                          !AboveInstructorRoles.includes(userPermission)
                        }
                        isMulti
                        data-testid="filter-by-instructor"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            {FEATURE_FLAG.ONLY_SHOW_CLASS_WITH_APPLICATION && (
              <FormField
                control={form.control}
                name="onlyWithApplications"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="font-bold">
                      {t('sidebar.showOnlyClassesWithApplications')}
                    </FormLabel>
                    <FormControl>
                      <Switch
                        disabled={isLoading}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="show-only-classes-with-applications"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            {FEATURE_FLAG.CHECK_CONFLICT_IN_CALENDAR && (
              <div className="box-col-full">
                <CheckConflict />
                <Button
                  onClick={() => handleQrCodeScan()}
                  variant="primary-outline"
                  className="w-full"
                  aria-haspopup="dialog"
                  aria-controls="qrCodeAttendanceModal"
                >
                  {t('student:qrCodeAttendance.scanQrCode')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </form>
      <QRCodeAttendanceModal ref={qrCodeModalHandle} />
    </Form>
  )
}
