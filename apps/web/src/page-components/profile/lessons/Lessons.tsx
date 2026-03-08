import { FC, useCallback, useEffect, useMemo, useState } from 'react'

import _ from 'lodash'
import { DateRange } from 'react-day-picker'

import { useGetUpcomingLessons } from '@/hooks/useProfile'
import useResponsive from '@/hooks/useResponsive'
import { Course, School } from '@/types'
import { FilterPaymentReports, UpcomingLesson } from '@/types/profile'
import dayjs from '@/utils/dayjs'

import LessonDetail from './LessonDetail'
import LessonList from './LessonList'

export type FileData = {
  id: number
  name: string
  fileSize: number
  uploadedAt: string
}

type AllLessonsProps = {
  school: School
  courses?: Course[]
}

const Lessons: FC<AllLessonsProps> = ({ school }): JSX.Element => {
  const { isMobile, isTablet } = useResponsive()
  const [selectedLesson, setSelectedLesson] = useState<UpcomingLesson>()
  const [range, setRange] = useState<DateRange | undefined>({
    from: dayjs().set('date', 1).toDate(),
    to: dayjs().endOf('month').toDate(),
  })
  const [isInitialized, setIsInitialized] = useState(false)
  const [selectedClassIds, setSelectedClassIds] = useState<number[]>([])

  // Memoize payload to prevent unnecessary re-renders
  const payload: FilterPaymentReports = useMemo(() => {
    const start = range?.from
    const end = range?.to
    const [s, e] = start && end && dayjs(start).isAfter(end) ? [end, start] : [start, end]
    return {
      institutionId: school.id,
      startDate: s ? dayjs(s).format('YYYY-MM-DD') : undefined,
      endDate: e ? dayjs(e).format('YYYY-MM-DD') : undefined,
    }
  }, [school.id, range?.from, range?.to])

  const { data, isLoading } = useGetUpcomingLessons(payload)

  const classOptions = useMemo(() => {
    if (!data) return []
    const uniqueClasses = new Map<number, string>()
    Object.values(data)
      .flat()
      .forEach(lesson => {
        if (lesson.class?.id != null) {
          uniqueClasses.set(lesson.class.id, lesson.class.name)
        }
      })
    return Array.from(uniqueClasses.entries()).map(([value, label]) => ({ value, label }))
  }, [data])

  useEffect(() => {
    setSelectedClassIds(prev => {
      const filtered = prev.filter(id => classOptions.some(option => option.value === id))
      return filtered.length === prev.length ? prev : filtered
    })
  }, [classOptions])

  const handleClassFilterChange = useCallback((classIds: number[]) => {
    setSelectedClassIds(classIds)
  }, [])

  // Extract URL parameter logic into separate functions
  const getUrlParams = () => {
    if (typeof window === 'undefined') return {}
    const url = new URL(window.location.href)
    return {
      lessonId: url.searchParams.get('lessonId'),
      from: url.searchParams.get('from'),
      to: url.searchParams.get('to'),
    }
  }

  const updateUrlParams = useCallback(
    (updates: Record<string, string | null>, opts?: { replace?: boolean }) => {
      try {
        if (typeof window === 'undefined') return
        const url = new URL(window.location.href)
        Object.entries(updates).forEach(([key, value]) => {
          if (value != null) {
            url.searchParams.set(key, value)
          } else {
            url.searchParams.delete(key)
          }
        })
        const method: 'pushState' | 'replaceState' = opts?.replace ? 'replaceState' : 'pushState'
        window.history[method]({}, '', url.toString())
      } catch (error) {
        console.error('Error updating URL:', error)
      }
    },
    []
  )

  // Initialize state from URL params on mount
  useEffect(() => {
    const { lessonId, from, to } = getUrlParams()

    if (lessonId && /^\d+$/.test(lessonId)) {
      setSelectedLesson({ id: Number(lessonId) } as UpcomingLesson)
    }

    if (from || to) {
      setRange({
        from: from ? dayjs(from).toDate() : dayjs().set('date', 1).toDate(),
        to: to ? dayjs(to).toDate() : dayjs().endOf('month').toDate(),
      })
    }

    setIsInitialized(true)
  }, []) // Empty dependency array - only run on mount

  // Update URL when range changes (but not on initial load)
  useEffect(() => {
    if (!isInitialized) return

    updateUrlParams(
      {
        from: range?.from ? dayjs(range.from).format('YYYY-MM-DD') : null,
        to: range?.to ? dayjs(range.to).format('YYYY-MM-DD') : null,
      },
      { replace: true }
    )
  }, [range, updateUrlParams, isInitialized])

  // Keep internal state in sync with URL when using browser navigation
  useEffect(() => {
    const onPopState = () => {
      const { lessonId, from, to } = getUrlParams()
      if (lessonId && /^\d+$/.test(lessonId)) {
        setSelectedLesson({ id: Number(lessonId) } as UpcomingLesson)
      } else {
        setSelectedLesson(undefined)
      }
      if (from || to) {
        setRange({
          from: from ? dayjs(from).toDate() : dayjs().set('date', 1).toDate(),
          to: to ? dayjs(to).toDate() : dayjs().endOf('month').toDate(),
        })
      }
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  // Optimize responsive logic
  const isMobileOrTablet = useMemo(() => isMobile || isTablet, [isMobile, isTablet])

  const showDetail = useMemo(() => {
    return isMobileOrTablet ? Boolean(selectedLesson) : true
  }, [isMobileOrTablet, selectedLesson])

  const showList = useMemo(() => {
    return !isMobileOrTablet || !selectedLesson
  }, [isMobileOrTablet, selectedLesson])

  // Optimize lesson grouping logic
  const lessonsDate = useMemo(() => {
    if (!data) return []

    const allLessons = Object.values(data)
      .flat()
      .map(lesson => ({
        ...lesson,
        date: dayjs(lesson.startTime).format('YYYY-MM-DD'),
      }))

    const filteredLessons =
      selectedClassIds.length > 0
        ? allLessons.filter(lesson => {
            const classId = lesson.class?.id
            if (classId == null) return false
            return selectedClassIds.includes(classId)
          })
        : allLessons

    const lessonsByDate = _.groupBy(filteredLessons, 'date')

    return Object.entries(lessonsByDate)
      .map(([date, lessons]) => ({
        date,
        lessons: lessons.sort((a, b) => dayjs(a.startTime).diff(dayjs(b.startTime))),
      }))
      .sort((a, b) => dayjs(a.date).diff(dayjs(b.date)))
  }, [data, selectedClassIds])

  const handleChangeLesson = useCallback(
    (lesson: UpcomingLesson) => {
      if (selectedLesson?.id === lesson.id) return

      setSelectedLesson(lesson)
      updateUrlParams({ lessonId: lesson.id.toString() })
    },
    [selectedLesson?.id, updateUrlParams]
  )

  const handleBackToList = useCallback(() => {
    setSelectedLesson(undefined)
    updateUrlParams({ lessonId: null })
  }, [updateUrlParams])

  return (
    <div className="flex flex-col gap-6 md:flex-row">
      {showList && (
        <div className="w-full lg:w-5/12">
          <LessonList
            lessonDate={lessonsDate}
            selectedLesson={selectedLesson}
            onSelect={handleChangeLesson}
            range={range}
            setRange={setRange}
            isLoading={isLoading}
            classOptions={classOptions}
            selectedClassIds={selectedClassIds}
            onClassFilterChange={handleClassFilterChange}
          />
        </div>
      )}
      {showDetail && (
        <div className="w-full lg:w-7/12">
          <LessonDetail
            lessonData={selectedLesson}
            onBack={handleBackToList}
            schoolId={school.id}
            school={school}
          />
        </div>
      )}
    </div>
  )
}

export default Lessons
