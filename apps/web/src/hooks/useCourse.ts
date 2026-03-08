import { useState } from 'react'

import constate from 'constate'

import { Course, School, Site } from '@/types'

type CourseContextType = {
  school: School
  course: Course
  site: Site
}

export const [CourseStateProvider, useCourseState] = constate(
  ({ value }: { value: CourseContextType }) => {
    const [coursePage] = useState<CourseContextType>(value)
    return coursePage
  }
)
