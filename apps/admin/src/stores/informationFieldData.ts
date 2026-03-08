import { atom } from 'recoil'

import { ATOM_KEY } from '../constants/atomKey'
import { InformationFieldTypes } from '../types/applicationForm'

import { persistLocalStorage } from './utils/recoilPersist'

type InformationFieldState = {
  informationFields: InformationFieldTypes[]
  currentInformationField: InformationFieldTypes | null
  initFetch: boolean
}

const defaultInformationFieldState: InformationFieldState = {
  informationFields: [],
  currentInformationField: null,
  initFetch: false,
}

export const informationFieldState = atom<InformationFieldState>({
  key: ATOM_KEY.InformationFieldState,
  default: defaultInformationFieldState,
  effects: [persistLocalStorage],
})
