import { atom } from 'recoil'

import { ATOM_KEY } from '../constants/atomKey'
import { School } from '../types/school'

import { persistLocalStorage } from './utils/recoilPersist'

export type SchoolState = {
  schools: School[]
  currentSchool: School | null
  initFetch: boolean
}

const defaultSchoolState: SchoolState = {
  schools: [],
  currentSchool: null,
  initFetch: false,
}

export const schoolState = atom<SchoolState>({
  key: ATOM_KEY.SchoolState,
  default: defaultSchoolState,
  effects: [persistLocalStorage],
})
