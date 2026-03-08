import { atom } from 'recoil'

import { UploadProgressResponse } from '@/api/student-submission'
import { AtomKey } from '@/constants/atomKey'

type UploadProgressState = {
  [key: string]: UploadProgressResponse
}

const defaultUploadProgressState: UploadProgressState = {}

export const uploadProgressState = atom<UploadProgressState>({
  key: AtomKey.uploadProgressState,
  default: defaultUploadProgressState,
})

export const currentUploadProgressState = atom<UploadProgressResponse | null>({
  key: AtomKey.currentUploadProgressState,
  default: null,
})
