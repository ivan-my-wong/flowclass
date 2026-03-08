import { atom } from 'recoil'

import ATOM_KEY from '@/constants/atomKey'

import { localStorageEffect } from './storageEffect'

export const siteThemeState = atom<boolean>({
  key: ATOM_KEY.siteTheme,
  default: true,
  effects: [localStorageEffect(ATOM_KEY.siteTheme)],
})
