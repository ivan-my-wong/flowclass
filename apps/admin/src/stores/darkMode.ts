import { atom } from 'recoil'

import { ATOM_KEY } from '../constants/atomKey'

import { localStorageEffect } from './utils/storageEffect'

export const darkModeState = atom<boolean>({
  key: ATOM_KEY.DarkMode,
  default: false,
  effects: [localStorageEffect(ATOM_KEY.DarkMode)],
})
