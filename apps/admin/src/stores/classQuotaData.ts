import { atom, selectorFamily } from 'recoil'

import type { TimeSlotQuota } from '@/types/classes'

import { ATOM_KEY, SELECTOR_KEY } from '../constants/atomKey'

import { generateKeyQuotaTimeSlot } from './locationRoomQuotaData'

export const classQuotaState = atom<TimeSlotQuota | null>({
  key: ATOM_KEY.ClassTimeSlotQuotaState,
  default: null,
})

export const selectClassQuota = selectorFamily<
  TimeSlotQuota | null,
  {
    start: Date
    end: Date
  }
>({
  key: SELECTOR_KEY.ClassQuotaByTimeSlotSelector,
  get:
    ({ start, end }) =>
    ({ get }) => {
      const timeSlotQuota = get(classQuotaState)
      if (!timeSlotQuota) return null
      const key = get(
        generateKeyQuotaTimeSlot({
          start,
          end,
          timeSlotQuota,
        })
      )
      return key && timeSlotQuota[key] ? timeSlotQuota[key] : null
    },
})
