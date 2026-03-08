import { atom } from 'recoil'

import ATOM_KEY from '@/constants/atomKey'

export const textVersionState = atom<string | null>({
  key: ATOM_KEY.textVersionState,
  default: null,
})

let serverTextVersion: string | null = null

export const setServerTextVersion = (version: string | null) => {
  serverTextVersion = version
  if (typeof window !== 'undefined') {
    if (version) {
      localStorage.setItem('textVersion', version)
    } else {
      localStorage.removeItem('textVersion')
    }
  }
}

export const getTextVersion = () => {
  if (typeof window === 'undefined') {
    return serverTextVersion
  }

  return localStorage.getItem('textVersion')
}
