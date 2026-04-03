import { atom } from 'recoil'

import { BulkAssignCourseType } from '@/types/studentAddTeachingService'

import { ATOM_KEY } from '../constants/atomKey'
import {
  StudentEnrolmentRecord,
  StudentLesson,
  TypeTeachingServiceDetail,
} from '../types/student'
import { StudentUser, UserState } from '../types/user'

import { persistLocalStorage } from './utils/recoilPersist'

export enum AddTeachingServiceMode {
  generateCourseLink = 'generateCourseLink',
  changeLesson = 'changeLesson',
  addLesson = 'addLesson',
  addCourseDirectly = 'addCourseDirectly',
  addStudentOnly = 'addStudentOnly',
}

export type StudentState = {
  currentEnrolId: number | null
  students: UserState[] | StudentEnrolmentRecord[]
  currentStudent: StudentUser | null
  currentStudentLesson: StudentLesson | null
  currentEnrol: TypeTeachingServiceDetail | null
  initFetch: boolean
  tableDrawers: StudentTableDrawerType
}

export type StudentTableDrawerType = {
  isOpenCreateCoupon: boolean
  isOpenAssignCourse: boolean
  isOpenCustomFieldFilter: boolean
  assignCourseMode: string
  isOpenImportCsv: boolean
  isOpenExportCsv: boolean
  bulkAssignCourse?: BulkAssignCourseType[]
}

const initialDrawerState = {
  isOpenCreateCoupon: false,
  isOpenAssignCourse: false,
  isOpenCustomFieldFilter: false,
  assignCourseMode: AddTeachingServiceMode.generateCourseLink,
  isOpenImportCsv: false,
  isOpenExportCsv: false,
  bulkAssignCourse: [],
}

const defaultStudentState: StudentState = {
  currentEnrolId: null,
  students: [],
  currentStudent: null,
  currentEnrol: null,
  currentStudentLesson: null,
  tableDrawers: initialDrawerState,
  initFetch: false,
}
export const studentState = atom<StudentState>({
  key: ATOM_KEY.StudentState,
  default: defaultStudentState,
  effects: [persistLocalStorage],
})
