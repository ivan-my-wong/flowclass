import { atom, selectorFamily } from 'recoil'

import { DEFAULT_TZ } from '@/constants/fullCalendar'
import type { TimeSlotQuota } from '@/types/classes'
import dayjs from '@/utils/dayjs'

import { ATOM_KEY, GENERATOR_KEY, SELECTOR_KEY } from '../constants/atomKey'

import { siteState } from './siteData'

export const locationRoomQuotaState = atom<TimeSlotQuota | null>({
  key: ATOM_KEY.LocationRoomTimeSlotQuotaState,
  default: null,
})

export const generateKeyQuotaTimeSlot = selectorFamily<
  string | null,
  {
    start: Date
    end: Date
    timeSlotQuota: TimeSlotQuota
  }
>({
  key: GENERATOR_KEY.GenerateKeyQuotaTimeSlot,
  get:
    ({ start, end, timeSlotQuota }) =>
    ({ get }) => {
      if (!timeSlotQuota) return null
      const { currentSite } = get(siteState)
      const timeZone = currentSite?.timeZone?.id || DEFAULT_TZ
      const keys = Object.keys(timeSlotQuota)
      // eslint-disable-next-line no-restricted-syntax
      for (const key of keys) {
        const [startTimeSlot, endTimeSlot] = key.split(' ')
        const isStartOverlap = dayjs(startTimeSlot)
          .tz(timeZone as string)
          .isBetween(start, end, 'minute', '[]')
        const isEndOverlap = dayjs(endTimeSlot)
          .tz(timeZone as string)
          .isBetween(start, end, 'minute', '[]')
        if (isStartOverlap || isEndOverlap) {
          return key
        }
      }
      return null
    },
})

export const selectLocationRoomQuota = selectorFamily<
  TimeSlotQuota | null,
  {
    start: Date
    end: Date
  }
>({
  key: SELECTOR_KEY.LocationRoomQuotaByTimeSlotSelector,
  get:
    ({ start, end }) =>
    ({ get }) => {
      const timeSlotQuota = get(locationRoomQuotaState)
      if (!timeSlotQuota) return null
      const key = get(
        generateKeyQuotaTimeSlot({
          start,
          end,
          timeSlotQuota,
        })
      )
      return key ? timeSlotQuota[key] ?? null : null
    },
})
