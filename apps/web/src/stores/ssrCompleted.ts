import { useEffect } from 'react'

import { atom, useRecoilState } from 'recoil'

import { AtomKey } from '@/constants/atomKey'

const ssrCompletedState = atom({
  key: AtomKey.ssrCompleted,
  default: false,
})

export const useSsrComplected = (): boolean => {
  const [ssrCompleted, setSsrCompleted] = useRecoilState(ssrCompletedState)
  useEffect(() => setSsrCompleted(true), [setSsrCompleted])

  return ssrCompleted
}
