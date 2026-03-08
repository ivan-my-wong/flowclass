import { atom } from 'recoil'

import { ATOM_KEY } from '../constants/atomKey'
import { ApplicationFormTypes } from '../types/applicationForm'

import { persistLocalStorage } from './utils/recoilPersist'

export type ApplicationFormState = {
  applicationForms: ApplicationFormTypes[]
  currentApplicationForm: ApplicationFormTypes | null
  initFetch: boolean
}

const defaultApplicationFormState: ApplicationFormState = {
  applicationForms: [],
  currentApplicationForm: null,
  initFetch: false,
}

export const applicationFormState = atom<ApplicationFormState>({
  key: ATOM_KEY.ApplicationFormState,
  default: defaultApplicationFormState,
  effects: [persistLocalStorage],
})
