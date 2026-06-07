import { useEffect, useMemo, useState } from 'react'

import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { FiCheck, FiSearch, FiUsers } from 'react-icons/fi'
import { MultiValue } from 'react-select'

import ChartDatePicker from '@/components/DatePickers/ChartDatePicker'
import CourseAndClassSelector from '@/components/Selector/CourseAndClassSelector'
import Heading from '@/components/Texts/Heading'
import { Input } from '@/components/ui/Inputs/Input'
import { AttendanceStatus } from '@/constants/course'
import useCourseData from '@/hooks/useCourseData'
import useLessonDateTimeData from '@/hooks/useLessonDateTimeData'
import useSiteData from '@/hooks/useSiteData'
import ContentLayout from '@/layouts/ContentLayout'
import { ChartDate } from '@/types/chartDate.type'
import { OptionProps } from '@/types/courseSelector.type'

import StatusAttendance from './components/StatusAttendance'

type Student = {
  id: number
  name: string
  searchKey: string
  statuses: Record<string, AttendanceStatus>
}

const LessonMatrixPage = () => {
  const { t } = useTranslation()

  const { timeZone, getCurrentSiteTimeZoneDate } = useSiteData()
  dayjs.tz.setDefault(timeZone)

  const [classSelected, setClassSelected] = useState<string | undefined>()
  // Default window: 1 month back through 1 month forward. Wider than just
  // "this month" so users land on a non-empty view when their lessons
  // straddle month boundaries (the most common case).
  const [chartDate, setChartDate] = useState<ChartDate>(() => ({
    startDate: dayjs().subtract(1, 'month').startOf('month').toISOString(),
    endDate: dayjs().add(1, 'month').endOf('month').toISOString(),
  }))

  const [students, setStudents] = useState<Student[]>([])
  const [query, setQuery] = useState('')

  const { getFilteredCourseOptions } = useCourseData()

  const { useGetLessonMatrix } = useLessonDateTimeData()
  const { data: lessonMatrix, isLoading: isLoadingLessons } =
    useGetLessonMatrix({
      startDate: new Date(chartDate.startDate),
      endDate: new Date(chartDate.endDate),
      classIdSelected: classSelected ? [+classSelected] : undefined,
      enabled: !!classSelected,
    })

  const classLessons = useMemo(
    () => lessonMatrix?.lessons ?? [],
    [lessonMatrix]
  )

  useEffect(() => {
    const newStudent: Student[] =
      (lessonMatrix?.studentLessons ?? []).map(o => {
        const {
          preferredName = '',
          preferredEmail = '',
          preferredPhone = '',
        } = o.enrollCourse ?? {}

        const searchKey = `${preferredName}${preferredEmail}${preferredPhone}`

        const statuses: Record<string, AttendanceStatus> = {}

        try {
          ;(lessonMatrix?.lessons ?? []).forEach(p => {
            if (!p.studentLessons) return
            const student = p.studentLessons?.find(
              q => q.aliases?.id === o.aliases?.id
            )
            if (!student) return
            statuses[p.id] = student.attendance as AttendanceStatus
          })
        } catch (error) {
          // Error parsing attendances
        }

        return {
          id: o.aliases?.id ?? o.id,
          name: preferredName ?? '-',
          searchKey,
          statuses,
        }
      }) ?? ([] as Student[])
    setStudents(newStudent)
  }, [lessonMatrix])

  const options = useMemo(() => {
    return getFilteredCourseOptions()
  }, [getFilteredCourseOptions])

  const selectedValue = useMemo(() => {
    if (!classSelected) return []
    // Find the selected class in the options
    const foundOption = options
      .flatMap(group => group.options)
      .find(opt => opt.value.toString() === classSelected)
    return foundOption ? [foundOption] : []
  }, [classSelected, options])

  const handleCourseClassChange = (selected: MultiValue<OptionProps>): void => {
    const selectedArray = Array.isArray(selected) ? selected : []
    if (selectedArray.length === 0) {
      setClassSelected(undefined)
      return
    }

    // Filter out "All Classes" options and keep only class selections
    const classSelections = selectedArray.filter(
      opt => !opt.label.includes('(All Classes)')
    )

    // If multiple classes are selected, keep only the last one (most recently selected)
    if (classSelections.length > 1) {
      const lastSelected = classSelections[classSelections.length - 1]
      setClassSelected(lastSelected.value.toString())
    } else if (classSelections.length === 1) {
      setClassSelected(classSelections[0].value.toString())
    } else {
      // If only "All Classes" is selected, clear the selection
      setClassSelected(undefined)
    }
  }

  const setStatus = (
    studentId: number,
    sessionId: number,
    status: AttendanceStatus
  ) => {
    setStudents(prev =>
      prev.map(s => {
        if (s.id !== studentId) return s
        return { ...s, statuses: { ...s.statuses, [sessionId]: status } }
      })
    )
  }

  const attendedBySession = (sessionId: number) =>
    students.reduce((acc, s) => {
      const status = s.statuses[sessionId]
      return acc + (!!status && status !== AttendanceStatus.PENDING ? 1 : 0)
    }, 0)

  const filtered = useMemo(() => {
    return students.filter(s =>
      s.name.toLowerCase().includes(query.toLowerCase())
    )
  }, [students, query])

  const avgAttendance = useMemo(() => {
    const totalAttendance =
      classLessons?.reduce((acc, s) => {
        return acc + (s.studentLessons?.length ?? 0)
      }, 0) ?? 0

    let attendance = 0
    students.forEach(o => {
      Object.keys(o.statuses).forEach(p => {
        const status = o.statuses[p]
        attendance += !!status && status !== AttendanceStatus.PENDING ? 1 : 0
      })
    })
    if (totalAttendance === 0) return '0%'
    return `${((attendance / totalAttendance) * 100).toFixed(2)}%`
  }, [students, classLessons])

  return (
    <ContentLayout
      leftHeader={<Heading>{t('component:menubar.lessonMatrix')}</Heading>}
      rightHeader={
        <div className="md:flex gap-3 justify-start w-full space-y-2 md:space-y-0">
          <CourseAndClassSelector
            options={options}
            value={selectedValue}
            onChange={handleCourseClassChange}
            width="100%"
            isMulti
            hideSelectAll
            placeholder={
              (t(
                'student:teachingService.placeholderSelectCourse'
              ) as string) || ''
            }
          />
          <ChartDatePicker
            chartDate={chartDate}
            handleChartDateChange={(data: ChartDate) => {
              const { startDate, endDate } = data
              setChartDate({
                startDate: dayjs(startDate).startOf('day').toISOString(),
                endDate: dayjs(endDate).endOf('day').toISOString(),
              })
            }}
            includeFuture
          />
        </div>
      }
    >
      <div className="p-4 w-full space-y-3" hidden={!!classSelected}>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500 text-center">
            {t('lessonMatrix:selectCourseAndClassFirst')}
          </div>
        </div>
      </div>
      <div className="p-4 w-full space-y-3" hidden={!classSelected}>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <FiUsers size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">
                  {t('lessonMatrix:totalStudents')}
                </span>
                <span className="text-2xl font-semibold text-gray-900">
                  {students.length ?? 0}
                </span>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <FiCheck size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">
                  {t('lessonMatrix:avgAttendance')}
                </span>
                <span className="text-2xl font-semibold text-gray-900">
                  {avgAttendance}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-2 md:p-4 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-2">
              <div className="font-bold">
                {t('lessonMatrix:attendanceGrid')}
              </div>
              <div className="text-sm text-gray-500">
                {t('lessonMatrix:descriptionAttendanceGrid')}
              </div>
            </div>
            <div className="relative mb-4 w-full md:w-1/3">
              <FiSearch className="pointer-events-none absolute left-3 top-3 text-gray-400 z-10" />
              <Input
                placeholder="Search students..."
                className="w-full pl-9"
                onChange={e => setQuery(e.target.value)}
              />
            </div>
          </div>

          <div hidden={!isLoadingLessons} className="w-full mb-10">
            <span className="text-gray-500 absolute text-center w-full">
              {t('common:action.loading')}
            </span>
          </div>

          {!classLessons?.length && !isLoadingLessons && (
            <div className="rounded-lg border border-gray-200 bg-white p-4 text-center text-sm text-gray-500 shadow-sm">
              {t('lessonMatrix:noLessonsInThisClass')}
            </div>
          )}

          <div
            className="w-full overflow-auto"
            hidden={isLoadingLessons || !classLessons?.length}
          >
            <table className="min-w-[900px] w-full table-fixed">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="w-[15vw] md:w-56 px-1 py-2 md:px-4 md:py-3 font-bold text-sm bg-white sticky left-0 z-20 border-r border-gray-200">
                    {t('lessonMatrix:students')}
                  </th>
                  {classLessons?.map(s => {
                    const startTime = getCurrentSiteTimeZoneDate(s.start)!
                    const endTime = getCurrentSiteTimeZoneDate(s.end)!

                    const time = `${dayjs(startTime).format('HH:mm')} - ${dayjs(
                      endTime
                    ).format('HH:mm')}`

                    return (
                      <th
                        key={`th-lesson-${s.id}`}
                        className="px-1 py-2 md:px-4 md:py-3 w-[220px] border-r border-gray-200"
                      >
                        <div className="flex flex-col items-center">
                          <div className="text-sm font-bold">
                            {dayjs(startTime).format('YYYY-MM-DD')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {dayjs(startTime).format('dddd')}
                          </div>
                          <div className="text-xs text-gray-500">{time}</div>
                          <div className="pt-1 text-xs text-primary">
                            {t('lessonMatrix:calculatedAttended', {
                              attended: attendedBySession(s.id),
                              total: s.studentLessons?.length ?? 0,
                            })}
                          </div>
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {filtered.map(student => (
                  <tr
                    key={`student-${student.id}`}
                    className="border-t border-gray-100 w-[220px]"
                  >
                    <td className="w-[15vw] md:w-56 px-1 py-2 md:px-4 md:py-3 text-sm bg-white sticky left-0 z-10 border-r border-gray-200 break-words">
                      {student.name}
                    </td>
                    {classLessons?.map(s => {
                      const studentLesson = s.studentLessons?.find(
                        o => o.aliases?.id === student.id
                      )
                      if (!studentLesson) return null
                      return (
                        <td
                          key={`status-${student.id}-${s.id}`}
                          className="px-1 py-2 md:px-4 md:py-3 border-r border-gray-200"
                        >
                          <StatusAttendance
                            studentLesson={{
                              ...studentLesson,
                              attendance:
                                student.statuses[s.id] ??
                                AttendanceStatus.PENDING,
                            }}
                            onChange={st => setStatus(student.id, s.id, st)}
                          />
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ContentLayout>
  )
}

export default LessonMatrixPage
