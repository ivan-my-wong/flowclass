import { atom } from 'recoil'

import { ATOM_KEY } from '../constants/atomKey'
import { BlockTime } from '../types/settingBlockTime'

import { persistLocalStorage } from './utils/recoilPersist'

type BlockTimeState = {
  blockTimes: BlockTime[]
  currentBlockTime: BlockTime | null
  initFetch: boolean
}

const defaultBlockTimeState: BlockTimeState = {
  blockTimes: [],
  currentBlockTime: null,
  initFetch: false,
}

export const blockTimeState = atom<BlockTimeState>({
  key: ATOM_KEY.BlockTimeState,
  default: defaultBlockTimeState,
  effects: [persistLocalStorage],
})
