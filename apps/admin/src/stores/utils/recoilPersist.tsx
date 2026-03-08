import { recoilPersist } from 'recoil-persist'

export const { persistAtom: persistLocalStorage } = recoilPersist({
  key: 'recoil-persist',
})
