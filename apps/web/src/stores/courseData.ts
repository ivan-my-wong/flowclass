import { atom } from 'recoil'

import { Course } from '@/types'

import AtomKey from '../constants/atomKey'

// for any fields, will defined later

type CourseState = {
  courses: Course[]
  currentCourse: Course | null
  initFetch: boolean
}

const defaultCourseState: CourseState = {
  courses: [],
  currentCourse: null,
  initFetch: false,
}

export const courseFilterOpenState = atom<boolean>({
  key: AtomKey.tagFilterModalOpen,
  default: false,
})
