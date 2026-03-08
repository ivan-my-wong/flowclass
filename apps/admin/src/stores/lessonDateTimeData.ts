import { atom } from 'recoil'

import { ATOM_KEY } from '@/constants/atomKey'
import { ClassLessonType } from '@/types/lessonDateTime'
import { ClassLesson } from '@/types/student'

import { persistLocalStorage } from './utils/recoilPersist'

type LessonDateTimeState = {
  lessons: ClassLesson[]
  currentLesson: ClassLessonType | null
  initFetch: boolean
}

const defaultLessonDateTimeState: LessonDateTimeState = {
  lessons: [],
  currentLesson: null,
  initFetch: false,
}

export const lessonDateTimeState = atom<LessonDateTimeState>({
  key: ATOM_KEY.LessonDateTimeState,
  default: defaultLessonDateTimeState,
  effects: [persistLocalStorage],
})
