import { atom } from 'recoil'

import { ATOM_KEY } from '../constants/atomKey'
import { Classes } from '../types/classes'
import { Course } from '../types/course'

import { persistLocalStorage } from './utils/recoilPersist'

type CourseState = {
  courses: Course[]
  currentCourse: Course | null
  currentClass: Classes | null
  initFetch: boolean
}

const defaultCourseState: CourseState = {
  courses: [],
  currentCourse: null,
  currentClass: null,
  initFetch: false,
}

export const courseState = atom<CourseState>({
  key: ATOM_KEY.CourseState,
  default: defaultCourseState,
  effects: [persistLocalStorage],
})
