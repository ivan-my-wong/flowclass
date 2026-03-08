import { atom } from 'recoil'

import { ATOM_KEY } from '@/constants/atomKey'

export type RequiredParams = {
  userId: number
  institutionId: number
  userAliasId: number
  siteId?: number
}

export const defaultRequiredParams: RequiredParams = {
  userId: 0,
  institutionId: 0,
  userAliasId: 0,
  siteId: 0,
}

export const requiredParamsState = atom<RequiredParams>({
  key: ATOM_KEY.RequiredParamsState,
  default: defaultRequiredParams,
})
