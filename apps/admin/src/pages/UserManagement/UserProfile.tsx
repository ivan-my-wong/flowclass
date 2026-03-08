import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Outlet, useNavigate, useSearchParams } from 'react-router-dom'

import { ColDef } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import {
  addMonths,
  endOfDay,
  endOfMonth,
  format,
  isBefore,
  parseISO,
  startOfMonth,
} from 'date-fns'
import { CSVLink } from 'react-csv'
import { useTranslation } from 'react-i18next'
import { LuBookOpen, LuClock, LuDollarSign, LuUsers } from 'react-icons/lu'
import { useRecoilValue } from 'recoil'

import ChartDatePicker from '@/components/DatePickers/ChartDatePicker'
import SkeletonLoader from '@/components/Loaders/SkeletonLoader'
import CourseAndClassSelector from '@/components/Selector/CourseAndClassSelector'
import LabelSelector, {
  LabelSelectorRef,
} from '@/components/Selector/LabelSelector'
import { SelectItemValuesProps } from '@/components/Selector/Select'
import QuickFilterTable from '@/components/Tables/QuickFilterTable'
import Heading from '@/components/Texts/Heading'
import { Button } from '@/components/ui/Button'
import {
  InstructorLessonTableField,
  lessonTableColumns as lessonTableColumnsConst,
} from '@/constants/userManagement'
import useCourseData from '@/hooks/useCourseData'
import useDynamicHeight from '@/hooks/useDynamicHeight'
import useInstructorRates from '@/hooks/useInstructors'
import { useLocationRoom } from '@/hooks/useRoomLocation'
import useSiteData from '@/hooks/useSiteData'
import useUsersManagement from '@/hooks/useUsersManagement'
import ContentLayout from '@/layouts/ContentLayout'
import { userPermissionState, UserRole } from '@/stores/userPermissionData'
import { ChartDate } from '@/types/chartDate.type'
import { Course } from '@/types/course'
import { UpcomingClasses, UpcomingClassesDto } from '@/types/user'
import { formatCurrency, formatCurrencyWithName } from '@/utils/currency'
import { getRowId } from '@/utils/misc'
import { courseListToCourseOptions, getCourseIcon } from '@/utils/options'

import TeacherWidget from './components/TeacherWidget'

const UserProfile: React.FC = () => {
  const [param, setParam] = useSearchParams()
  const userId = Number(param.get('userId') || '0')

  const { currency } = useSiteData()

  const dynamicHeight = useDynamicHeight()
  const userPermission = useRecoilValue(userPermissionState)
  const { t } = useTranslation()
  const locationRef = useRef<LabelSelectorRef>(null)

  const gridRef = useRef<AgGridReact<UpcomingClasses>>(null)
  const { useGetInstructorRates } = useInstructorRates()

  const getDefaultChartDate = (): ChartDate => {
    const today = new Date()
    const start = startOfMonth(today)
    const end = endOfMonth(addMonths(today, 1))
    return {
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd'),
    }
  }

  const [selectedDateRange, setSelectedDateRange] = useState<ChartDate>(
    getDefaultChartDate()
  )
  // Filter states
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [hideEmptyLessons, setHideEmptyLessons] = useState(false)
  const [filterParams, setFilterParams] = useState<{
    courses: SelectItemValuesProps[]
    classes: SelectItemValuesProps[]
  }>({
    courses: [],
    classes: [],
  })

  const {
    useGetInstructorAnalytics,
    useGetClassLessonsOfInstructor,
    useGetUserRole,
  } = useUsersManagement()

  const { data: userData, isLoading: isLoadingUser } = useGetUserRole(
    Number(userId)
  )

  // Check if instructor has rates enabled
  const hasRatesEnabled = userData?.instructorProfile?.isRatesEnabled ?? false
  // Read params and update filter state
  const locationsParam = param.get('locationIds') || ''
  const courseParam = param.get('courseIds') || ''
  const classParam = param.get('classIds') || ''
  const dateStart = param.get('dateStart')
  const dateEnd = param.get('dateEnd')

  const classesApiParams: Omit<UpcomingClassesDto, 'siteId' | 'institutionId'> =
    useMemo(() => {
      return {
        instructorId: userId,
        ...(courseParam && courseParam.trim() !== ''
          ? { courseIds: courseParam.split(',').map(Number).filter(Boolean) }
          : {}),
        ...(classParam && classParam.trim() !== ''
          ? { classIds: classParam.split(',').map(Number).filter(Boolean) }
          : {}),
        locationIds: locationsParam.split(',').map(Number).filter(Boolean),
        startDate: dateStart
          ? parseISO(dateStart).toISOString()
          : parseISO(selectedDateRange.startDate).toISOString(),
        endDate: dateEnd
          ? endOfDay(parseISO(dateEnd)).toISOString()
          : endOfDay(parseISO(selectedDateRange.endDate)).toISOString(),
      }
    }, [
      courseParam,
      classParam,
      selectedDateRange,
      userId,
      locationsParam,
      dateStart,
      dateEnd,
    ])

  const {
    data: classesData,
    isLoading: isLoadingClasses,
    refetch: refetchClasses,
  } = useGetClassLessonsOfInstructor(classesApiParams)

  const {
    data: instructorAnalytics,
    isFetching: isLoadingInstructorAnalytics,
    refetch: refetchInstructorAnalytics,
  } = useGetInstructorAnalytics(userId, classesApiParams)

  const processedClassesData = useMemo(() => {
    if (!classesData) return []
    const processedData = classesData
      ?.map(item => {
        const start = item.startTime ? parseISO(item.startTime) : null
        const end = item.endTime ? parseISO(item.endTime) : null
        return {
          ...item,
          isPast: start ? isBefore(start, new Date()) : false,
          numberOfStudents: item.numberOfStudents || 0,
          duration:
            start && end
              ? `${Math.max(
                  0,
                  Math.round((end.getTime() - start.getTime()) / 60000)
                )} ${t('common:unit.minutes')}`
              : '',
        }
      })
      .sort((a, b) => {
        const aStart = a.startTime ? parseISO(a.startTime) : null
        const bStart = b.startTime ? parseISO(b.startTime) : null
        if (aStart && bStart) return aStart.getTime() - bStart.getTime()
        return 0
      })

    // Filter out lessons with no students if hideEmptyLessons is enabled
    if (hideEmptyLessons) {
      return processedData.filter(lesson => lesson.numberOfStudents > 0)
    }

    return processedData
  }, [classesData, hideEmptyLessons, t])

  const navigate = useNavigate()

  const { useFetchLocationRooms } = useLocationRoom()
  const { data: locationRooms } = useFetchLocationRooms()

  const locationRoomsOptions = useMemo(() => {
    return (locationRooms || []).map(location => ({
      label: location.name,
      value: location.id?.toString() || '',
    }))
  }, [locationRooms])

  const isUserTeacher = userPermission === UserRole.Instructor

  const { courseData, getFilteredCourseOptions } = useCourseData()

  const options = getFilteredCourseOptions()

  const onChangeFilterParams = useCallback(
    (key: 'courses' | 'classes', value: SelectItemValuesProps[]) => {
      const valueString = value.map(d => d.value).join(',')
      setFilterParams(prev => ({
        ...prev,
        [key]: value,
      }))
      setParam(prev => {
        const newParams = new URLSearchParams(prev)
        if (valueString) {
          newParams.set(
            key === 'courses' ? 'courseIds' : 'classIds',
            valueString
          )
        } else {
          newParams.delete(key === 'courses' ? 'courseIds' : 'classIds')
        }
        return newParams
      })
      refetchAll()
    },
    [setParam]
  )

  // Filter course options to only those present in the current lessons
  const courseOptions = useMemo(() => {
    // Filter courseData.courses to only those in courseIds
    const filteredCourses = (courseData.courses ?? []).filter(
      (course: Course) => typeof course.id === 'number'
    )
    return courseListToCourseOptions(filteredCourses, true)
  }, [courseData.courses])

  const classOptions = useMemo(() => {
    const options: SelectItemValuesProps[] = []
    courseData?.courses
      .filter(o => {
        if (filterParams.courses.length) {
          return filterParams.courses.map(p => +p.value).includes(o.id)
        }
        return o
      })
      .forEach(co => {
        if (co.classes?.length) {
          co.classes.forEach(cl => {
            options.push({ label: cl.name, value: cl.id })
          })
        }
      })
    return options
  }, [courseData.courses, filterParams.courses])

  const refetchAll = () => {
    refetchClasses()
    refetchInstructorAnalytics()
  }

  // CSV headers based on whether rates are enabled
  const csvHeaders = useMemo(() => {
    const baseHeaders = [
      { label: 'Date', key: InstructorLessonTableField.DATE },
      { label: 'Status', key: InstructorLessonTableField.STATUS },
      { label: 'Course', key: InstructorLessonTableField.COURSE },
      { label: 'Class', key: InstructorLessonTableField.CLASS },
      { label: 'Location', key: InstructorLessonTableField.LOCATION },
      {
        label: 'Number of Students',
        key: InstructorLessonTableField.NUMBER_OF_STUDENTS,
      },
      { label: 'Duration', key: InstructorLessonTableField.DURATION },
    ]

    if (hasRatesEnabled) {
      baseHeaders.push(
        { label: 'Hourly Rate', key: InstructorLessonTableField.HOURLY_RATE },
        { label: 'Total Amount', key: InstructorLessonTableField.SALARY }
      )
    }

    return baseHeaders
  }, [hasRatesEnabled])

  // Format lesson data for CSV export
  const formatLessonDataForCsv = useMemo(() => {
    return processedClassesData.map(lesson => {
      const baseData = {
        date:
          lesson.startTime && lesson.endTime
            ? `${format(
                parseISO(lesson.startTime),
                'dd/MM/yyyy hh:mm a'
              )} - ${format(parseISO(lesson.endTime), 'dd/MM/yyyy hh:mm a')}`
            : '',
        status: lesson.isPast ? 'Past' : 'Upcoming',
        course: lesson.course?.name || '',
        class: lesson.class?.name || '',
        location: lesson.locationRoom?.name || '',
        numberOfStudents: lesson.numberOfStudents || 0,
        duration: lesson.duration || '',
      }

      if (hasRatesEnabled) {
        return {
          ...baseData,
          hourlyRate: currency
            ? formatCurrencyWithName(lesson.hourlyRate || 0, currency)
            : lesson.hourlyRate,
          salary: currency
            ? formatCurrencyWithName(lesson.lessonSalary || 0, currency)
            : lesson.lessonSalary,
        }
      }

      return baseData
    })
  }, [processedClassesData, hasRatesEnabled, currency])

  const csvFileName = useMemo(() => {
    const timestamp = new Date().toISOString().split('T')[0]
    return `instructor_lessons_${userId}_${timestamp}.csv`
  }, [userId])

  // Sync filter state with URL params on mount and when params change
  useEffect(() => {
    if (locationsParam) {
      setSelectedLocations(locationsParam.split(','))
    } else {
      setSelectedLocations([])
    }

    if (courseParam) {
      const selectedCourses = courseOptions.filter(opt =>
        courseParam.split(',').includes(String(opt.value))
      )
      setFilterParams(prev => ({ ...prev, courses: selectedCourses }))
    } else {
      setFilterParams(prev => ({ ...prev, courses: [] }))
    }
    if (classParam) {
      const selectedClasses = classOptions.filter(opt =>
        classParam.split(',').includes(String(opt.value))
      )
      setFilterParams(prev => ({ ...prev, classes: selectedClasses }))
    } else {
      setFilterParams(prev => ({ ...prev, classes: [] }))
    }
    if (dateStart && dateEnd) {
      setSelectedDateRange({ startDate: dateStart, endDate: dateEnd })
    }

    refetchAll()
    // If not present, do not reset date range (keep default)
  }, [param])

  const lessonTableColumns = useMemo<ColDef[]>(() => {
    // Filter columns based on whether rates are enabled
    const filteredColumns = lessonTableColumnsConst.filter(col => {
      if (
        !hasRatesEnabled &&
        (col.field === InstructorLessonTableField.SALARY ||
          col.field === InstructorLessonTableField.HOURLY_RATE)
      ) {
        return false
      }
      return true
    })

    return filteredColumns.map(col => ({
      ...col,
      headerName: t(col.headerName as string) as string,
      filter: false,
      valueGetter: ({ data }) => {
        switch (col.field) {
          case InstructorLessonTableField.STATUS:
            return data.isPast
              ? t('setting:userManagement.lessonTable.past')
              : t('setting:userManagement.lessonTable.upcoming')
          case InstructorLessonTableField.COURSE:
            return data.course?.name || ''
          case InstructorLessonTableField.CLASS:
            return data.class?.name || ''
          case InstructorLessonTableField.NUMBER_OF_STUDENTS:
            return data.numberOfStudents
          case InstructorLessonTableField.DATE: {
            if (!data.startTime || !data.endTime) return ''
            const start = parseISO(data.startTime)
            const end = parseISO(data.endTime)
            return `${format(start, 'dd/MM/yyyy hh:mm a')} - ${format(
              end,
              'dd/MM/yyyy hh:mm a'
            )}`
          }
          case InstructorLessonTableField.LOCATION:
            return data.locationRoom?.name || ''
          case InstructorLessonTableField.HOURLY_RATE:
            return formatCurrency(data.hourlyRate || 0, currency)
          case InstructorLessonTableField.DURATION:
            return data.duration || ''
          case InstructorLessonTableField.SALARY:
            return formatCurrency(data.lessonSalary || 0, currency)

          default:
            return ''
        }
      },
      width: col.minWidth ?? 150,
      cellRenderer:
        col.field === 'class'
          ? (params: any) => {
              return (
                <div className="box-row-full justify-start">
                  {getCourseIcon(params.data.class?.type)}
                  {params.data.class?.name}
                </div>
              )
            }
          : undefined,
    }))
  }, [t, currency, hasRatesEnabled])

  return (
    <>
      <ContentLayout
        headerBackButton={
          userData && !isUserTeacher
            ? {
                mode: 'back',
                title: t('setting:userManagement.userProfile'),
                action: () => {
                  navigate('/settings/users')
                },
              }
            : undefined
        }
        leftHeaderCSS="ml-4"
        leftHeader={
          <Heading>{t('setting:userManagement.userProfile')}</Heading>
        }
        // rightHeader={
        //   <div className="flex items-center gap-2 whitespace-nowrap">
        //     <Switch
        //       checked={hideEmptyLessons}
        //       onCheckedChange={setHideEmptyLessons}
        //       id="hide-empty-lessons"
        //     />
        //     <label
        //       htmlFor="hide-empty-lessons"
        //       className="text-sm font-medium cursor-pointer"
        //     >
        //       {t(
        //         'setting:userManagement.hideEmptyLessons',
        //         'Hide Empty Lessons'
        //       )}
        //     </label>
        //   </div>
        // }
      >
        <div className="box-responsive-full p-4 gap-lg flex-wrap lg:flex-nowrap">
          <div className="w-full">
            {/* Filters always visible */}
            <div className="mb-4 box-responsive-full items-center justify-start">
              <ChartDatePicker
                className="w-full"
                chartDate={selectedDateRange}
                handleChartDateChange={(data: ChartDate) => {
                  setSelectedDateRange(data)
                  setParam(prev => {
                    prev.set('dateStart', data.startDate)
                    prev.set('dateEnd', data.endDate)
                    return prev
                  })
                  refetchAll()
                }}
                includeFuture
              />
              <CourseAndClassSelector
                options={options}
                value={[
                  ...filterParams.courses.map(course => ({
                    value: parseInt(course.value.toString(), 10),
                    label: String(course.label),
                    course: String(course.label),
                    courseId: parseInt(course.value.toString(), 10),
                    previewImageUrl: null,
                  })),
                  ...filterParams.classes.map(cls => {
                    const course = courseData.courses?.find(c =>
                      c.classes?.some(
                        classItem =>
                          classItem.id === parseInt(cls.value.toString(), 10)
                      )
                    )
                    return {
                      value: parseInt(cls.value.toString(), 10),
                      label: String(cls.label),
                      course: course?.name || 'Unknown Course',
                      courseId: course?.id || 0,
                      previewImageUrl: null,
                    }
                  }),
                ]}
                onChange={selected => {
                  if (selected) {
                    const courses = selected
                      .filter(option => option.label.includes('(All Classes)'))
                      .map(option => ({
                        value: option.value.toString(),
                        label: option.course,
                      }))

                    const classes = selected
                      .filter(option => !option.label.includes('(All Classes)'))
                      .map(option => ({
                        value: option.value.toString(),
                        label: option.label,
                      }))

                    onChangeFilterParams('courses', courses)
                    onChangeFilterParams('classes', classes)
                  } else {
                    onChangeFilterParams('courses', [])
                    onChangeFilterParams('classes', [])
                  }
                }}
                width="100%"
              />
              <LabelSelector
                options={locationRoomsOptions}
                inputId="filterLocation"
                selectOption={locationRoomsOptions.filter(opt =>
                  selectedLocations.includes(opt.value)
                )}
                onChange={(opts: { value: string }[]) => {
                  setSelectedLocations(opts.map(opt => opt.value))
                  setParam(prev => {
                    prev.set(
                      'locationIds',
                      opts.map(opt => opt.value).join(',')
                    )
                    return prev
                  })
                  refetchAll()
                }}
                placeHolder={t(
                  'setting:userManagement.filterByLocation'
                ).toString()}
                ref={locationRef}
                isMulti
              />
              <div className="box-row-full w-fit">
                <Button
                  type="button"
                  onClick={() => {
                    refetchAll()
                  }}
                >
                  {t('common:action.filter')}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSelectedDateRange(getDefaultChartDate())
                    setSelectedLocations([])
                    setFilterParams({ courses: [], classes: [] })
                    setParam(prev => {
                      prev.delete('locationIds')
                      prev.delete('courseIds')
                      prev.delete('classIds')
                      prev.delete('dateStart')
                      prev.delete('dateEnd')
                      return prev
                    })
                    refetchAll()
                  }}
                >
                  {t('common:action.reset').toString()}
                </Button>
                <CSVLink
                  headers={csvHeaders}
                  data={formatLessonDataForCsv}
                  filename={csvFileName}
                  target="_blank"
                  style={{
                    textDecoration: 'none',
                    flexShrink: 0,
                  }}
                >
                  <Button type="button" variant="outline">
                    {t('student:exportCSV.title', 'Export Data')}
                  </Button>
                </CSVLink>
              </div>
            </div>
            {/* Main content area: widgets and lessons table */}
            {(() => {
              if (isLoadingUser && !userData) {
                return <SkeletonLoader height="60vh" />
              }

              if (!userData) {
                return null
              }

              return (
                <>
                  <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
                    <TeacherWidget
                      icon={<LuBookOpen />}
                      title={t('setting:userManagement.lessonAssigned')}
                      value={instructorAnalytics?.numberOfLessons || 0}
                      isLoading={isLoadingInstructorAnalytics}
                    />
                    <TeacherWidget
                      icon={<LuUsers />}
                      title={t('setting:userManagement.students')}
                      value={instructorAnalytics?.numberOfStudents || 0}
                      isLoading={isLoadingInstructorAnalytics}
                    />
                    <TeacherWidget
                      icon={hasRatesEnabled ? <LuDollarSign /> : <LuClock />}
                      title={
                        hasRatesEnabled
                          ? t('setting:userManagement.totalSalary')
                          : t('setting:userManagement.totalHours')
                      }
                      value={
                        hasRatesEnabled
                          ? formatCurrency(
                              instructorAnalytics?.totalSalary || 0,
                              currency
                            )
                          : `${instructorAnalytics?.totalHours || 0} Hours`
                      }
                      isLoading={isLoadingInstructorAnalytics}
                    />
                  </div>
                  <div className="w-full space-y-2 mt-4">
                    {(() => {
                      if (isLoadingClasses) {
                        return <SkeletonLoader height="60vh" />
                      }
                      return (
                        <QuickFilterTable
                          getRowId={row => getRowId('id', row)}
                          isLoading={isLoadingClasses}
                          rowData={processedClassesData}
                          showFilterBox={false}
                          height={dynamicHeight}
                          gridRef={gridRef}
                          columns={lessonTableColumns}
                        />
                      )
                    })()}
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      </ContentLayout>
      <Outlet />
    </>
  )
}
export default UserProfile
