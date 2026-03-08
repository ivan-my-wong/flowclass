import { atom } from 'recoil'

import { ATOM_KEY } from '@/constants/atomKey'
import { Availability, WorkingHours } from '@/types/availability.type'

import { persistLocalStorage } from './utils/recoilPersist'

// Default working hours
export const DEFAULT_WORKING_HOURS: WorkingHours = {
  Monday: { enabled: true, startTime: '09:00', endTime: '17:00' },
  Tuesday: { enabled: true, startTime: '09:00', endTime: '17:00' },
  Wednesday: { enabled: true, startTime: '09:00', endTime: '17:00' },
  Thursday: { enabled: true, startTime: '09:00', endTime: '17:00' },
  Friday: { enabled: true, startTime: '09:00', endTime: '17:00' },
  Saturday: { enabled: false, startTime: '09:00', endTime: '17:00' },
  Sunday: { enabled: false, startTime: '09:00', endTime: '17:00' },
}

type AvailabilityState = {
  availabilities: Availability[]
  currentAvailability: Availability | null
  workingHours: WorkingHours
}

const defaultAvailabilityState: AvailabilityState = {
  availabilities: [],
  currentAvailability: null,
  workingHours: DEFAULT_WORKING_HOURS,
}

export const availabilityState = atom<AvailabilityState>({
  key: ATOM_KEY.AvailabilityState,
  default: defaultAvailabilityState,
  effects: [persistLocalStorage],
})
