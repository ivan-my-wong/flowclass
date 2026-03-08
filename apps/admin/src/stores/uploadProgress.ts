import { atom } from 'recoil'

import { ATOM_KEY } from '@/constants/atomKey'
import { UploadProgress } from '@/types/class-material'

type UploadProgressState = {
  [key: string]: UploadProgress
}

const defaultUploadProgressState: UploadProgressState = {}

export const uploadProgressState = atom<UploadProgressState>({
  key: ATOM_KEY.UploadProgressState,
  default: defaultUploadProgressState,
})

export const currentUploadProgressState = atom<UploadProgress | null>({
  key: ATOM_KEY.CurrentUploadProgressState,
  default: null,
})
