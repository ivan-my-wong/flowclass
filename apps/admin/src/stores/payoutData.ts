import { atom } from 'recoil'

import { MetaType } from '@/types/pagination'
import { Payout } from '@/types/payout'

import { ATOM_KEY } from '../constants/atomKey'

import { persistLocalStorage } from './utils/recoilPersist'

type PayoutState = {
  payouts: Payout[]
  payout: Payout | null
  meta?: MetaType | null
}

const defaultPayoutState: PayoutState = {
  payouts: [],
  payout: null,
  meta: null,
}

export default atom<PayoutState>({
  key: ATOM_KEY.PayoutState,
  default: defaultPayoutState,
  effects: [persistLocalStorage],
})
