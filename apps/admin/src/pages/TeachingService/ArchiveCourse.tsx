import { useMemo, useState } from 'react'

import { useTranslation } from 'react-i18next'

import CollapsibleWrapper from '@/components/Accordions/Collapsible'
import { Course } from '@/types/course'

import CourseCard from './CourseCard'

interface ArchivedCoursesSectionProps {
  archivedCourses: Array<{
    id: number
    value: number
    label: string | null
    obj: Course
    status: string
  }>
  archivedCount: number
  handleSuccessfulDelete: (course: Course) => void
  handleSuccessfulDuplicate: (course: Course) => void
  handleSuccessfulArchiveToggle: (course: Course) => void
}

const ArchivedCoursesSection = ({
  archivedCourses,
  archivedCount,
  handleSuccessfulDelete,
  handleSuccessfulDuplicate,
  handleSuccessfulArchiveToggle,
}: ArchivedCoursesSectionProps): JSX.Element | null => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  // Move all hook calls before any conditional logic
  const hiddenChildren = useMemo(
    () =>
      archivedCourses.map(course => (
        <CourseCard
          key={course.obj.id}
          course={course.obj}
          deleteSuccessfulCallback={handleSuccessfulDelete}
          duplicateSuccessfulCallback={handleSuccessfulDuplicate}
          archiveSuccessfulCallback={handleSuccessfulArchiveToggle}
        />
      )),
    [
      archivedCourses,
      handleSuccessfulArchiveToggle,
      handleSuccessfulDelete,
      handleSuccessfulDuplicate,
    ]
  )

  const title = useMemo(
    () =>
      t('teachingService:publishCourse.countArchived', {
        count: archivedCount,
      }),
    [t, archivedCount]
  )

  // Now do the conditional return after all hooks
  if (archivedCourses.length === 0) return null

  const visibleChildren: JSX.Element[] = []

  return (
    <div className="mt-8 w-full">
      <CollapsibleWrapper
        title={title}
        visibleChildren={visibleChildren}
        hiddenChildren={hiddenChildren}
        collapsibleOpen={isOpen}
        setCollapsibleOpen={setIsOpen}
      />
    </div>
  )
}

export default ArchivedCoursesSection
