import { atom } from 'recoil'

import { CalendarViewType } from '@/types/fullCalendar.type'

import { ATOM_KEY } from '../constants/atomKey'

import { persistLocalStorage } from './utils/recoilPersist'

type FullCalendarState = {
  view: CalendarViewType
}

const defaultFullCalendarState: FullCalendarState = {
  view: 'week',
}

export const fullCalendarState = atom<FullCalendarState>({
  key: ATOM_KEY.FullCalendarState,
  default: defaultFullCalendarState,
  effects: [persistLocalStorage],
})
