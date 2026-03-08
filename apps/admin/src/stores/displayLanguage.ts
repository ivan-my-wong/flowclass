import { atom } from 'recoil'

import { ATOM_KEY } from '../constants/atomKey'

import { localStorageEffect } from './utils/storageEffect'

export type SupportedLang = 'en' | 'zh'
export const displayLanguageState = atom<SupportedLang>({
  key: ATOM_KEY.DisplayLanguageState,
  default: 'en',
  effects: [localStorageEffect(ATOM_KEY.DisplayLanguageState)],
})
