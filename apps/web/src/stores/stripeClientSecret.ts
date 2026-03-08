import { atom } from 'recoil'

import ATOM_KEY from '@/constants/atomKey'

import { localStorageEffect } from './storageEffect'

export const stripeClientSecret = atom<string>({
  key: ATOM_KEY.stripeClientSecret,
  default: '',
  effects: [localStorageEffect(ATOM_KEY.stripeClientSecret)],
})
