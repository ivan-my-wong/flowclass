import { useState } from 'react'

import dayjs from 'dayjs'
import { LucideLoader } from 'lucide-react'
import useTranslation from 'next-translate/useTranslation'

import PaginatedItems from '@/components/Containters/Pagination'
import { useGetPastLessons, useGetUpcomingLessons } from '@/hooks/useProfile'
import { Course, School } from '@/types'
import { FilterPaymentReports, UpcomingLesson } from '@/types/profile'

import FilterForm from './FilterForm'
import UpcomingLessonsItem from './UpcomingLessonsItem'

type UpcomingLessonsProps = {
  school: School
  courses?: Course[]
  isPastLesson?: boolean
}

// Define additional properties we want to add to lessons
type LessonExtension = {
  lessonIndex: number
  totalLessons: number
  courseId: number
}

// Combined type for lessons with added properties
type ExtendedLesson = UpcomingLesson & Partial<LessonExtension>

const UpcomingLessons = ({
  school,
  courses = [],
  isPastLesson,
}: UpcomingLessonsProps): React.ReactElement => {
  const { t } = useTranslation()

  const [filter, setFilter] = useState<FilterPaymentReports>()

  const payload: FilterPaymentReports = { institutionId: school.id, ...(filter ?? {}) }

  const pastLessData = useGetPastLessons(payload)
  const upcomingLessData = useGetUpcomingLessons(payload)

  const { data, isLoading, refetch } = isPastLesson ? pastLessData : upcomingLessData

  // Flatten the lessons data structure from { courseId: lesson[] } to flat lesson[]
  const flattenedLessons = Object.entries(data || {}).reduce<ExtendedLesson[]>(
    (acc, [courseId, lessons]) => {
      // First step: group lessons by classId
      const lessonsByClass: Record<string, ExtendedLesson[]> = {}

      // Group all lessons by their classId
      ;(lessons || []).forEach(lesson => {
        const classId = String(lesson.class?.id || 0)
        if (!lessonsByClass[classId]) {
          lessonsByClass[classId] = []
        }
        lessonsByClass[classId].push({
          ...lesson,
          courseId: lesson.course?.id || parseInt(courseId, 10),
        })
      })

      // Second step: process each class group separately
      const processedLessons = Object.entries(lessonsByClass).flatMap(([classId, classLessons]) => {
        // Sort lessons within this class by startTime
        const sortedLessons = [...classLessons].sort((a, b) => {
          const aTime = a.startTime ? new Date(a.startTime).getTime() : 0
          const bTime = b.startTime ? new Date(b.startTime).getTime() : 0
          return aTime - bTime
        })

        // Add sequence information to each lesson in this class
        return sortedLessons.map((lesson, lessonIdx) => ({
          ...lesson,
          lessonIndex: lessonIdx + 1, // 1-based index for sequence within class
          totalLessons: sortedLessons.length, // total lessons in this class
        }))
      })

      return [...acc, ...processedLessons]
    },
    []
  )

  // Group lessons by date for better organization
  const groupedLessons = flattenedLessons.reduce<Record<string, ExtendedLesson[]>>(
    (acc, lesson) => {
      // Use startTime as the key for grouping
      const dateObj = lesson.startTime ? new Date(lesson.startTime) : new Date()
      const dateKey = dayjs(dateObj).format('YYYY-MM-DD')

      if (!acc[dateKey]) {
        acc[dateKey] = []
      }

      acc[dateKey].push(lesson)
      return acc
    },
    {}
  )

  // Get the keys for rendering
  const groupKeys = Object.keys(groupedLessons).sort((a, b) => {
    // Sort dates in ascending or descending order based on isPastLesson
    return isPastLesson
      ? new Date(b).getTime() - new Date(a).getTime()
      : new Date(a).getTime() - new Date(b).getTime()
  })

  const fixData: UpcomingLesson[] = []
  groupKeys.forEach(dateKey => {
    fixData.push(...groupedLessons[dateKey])
  })

  return (
    <div className="space-y-4">
      <FilterForm courses={courses} currentFilter={filter} setCurrentFilter={setFilter} />
      {isLoading && (
        <div className="flex items-center justify-center gap-x-2">
          <LucideLoader className="animate-spin" /> Loading...
        </div>
      )}
      {flattenedLessons.length === 0 && !isLoading && (
        <div className="text-center">{t('profile:noData')}</div>
      )}

      <PaginatedItems itemsPerPage={5} hidePaginationIfOnePage>
        {fixData.map(row => (
          <UpcomingLessonsItem
            key={`lesson-date-${row.id}`}
            data={[row]}
            refetch={refetch}
            school={school}
            isPastLesson={isPastLesson}
          />
        ))}
      </PaginatedItems>
    </div>
  )
}

export default UpcomingLessons
