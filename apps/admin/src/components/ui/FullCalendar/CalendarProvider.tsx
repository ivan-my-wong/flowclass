import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'

import { useRecoilState } from 'recoil'

import { fullCalendarState as fullCalendarStateAtom } from '@/stores/full-calendar'
import type { CalendarViewType } from '@/types/fullCalendar.type'

type CalendarContextType = {
  view: CalendarViewType
  setView: (view: CalendarViewType) => void
  setIsLoading: Dispatch<SetStateAction<boolean>>
  isLoading: boolean
  currentDate: Date
  enableDragAndDrop: boolean
  numDays: number
  setNumDays: (numDays: number) => void
  setCurrentDate: (date: Date) => void
  goToNextDay: () => Date
  goToPreviousDay: () => Date
  goToNextWeek: () => Date
  goToPreviousWeek: () => Date
  goToNextMonth: () => Date
  goToPreviousMonth: () => Date
  goToNextYear: () => Date
  goToPreviousYear: () => Date
  goToToday: () => Date
}

const CalendarContext = createContext<CalendarContextType | undefined>(
  undefined
)

export function CalendarProvider({
  children,
  enableDragAndDrop,
}: {
  children: ReactNode
  enableDragAndDrop?: boolean
}): JSX.Element {
  const [fullCalendarState, setFullCalendarState] = useRecoilState(
    fullCalendarStateAtom
  )
  const [numDays, setNumDays] = useState(3)

  const setView = useCallback(
    (view: CalendarViewType) => {
      setFullCalendarState(prev => ({ ...prev, view }))
    },
    [setFullCalendarState]
  )
  const view = useMemo(() => fullCalendarState.view, [fullCalendarState.view])
  const [isLoading, setIsLoading] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const goToNextDay = useCallback(() => {
    let newDateReturn: Date = new Date()

    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate)
      newDate.setDate(newDate.getDate() + 1)
      newDateReturn = newDate
      return newDate
    })
    return newDateReturn
  }, [])

  const goToPreviousDay = useCallback(() => {
    let newDateReturn: Date = new Date()
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate)
      newDate.setDate(newDate.getDate() - 1)
      newDateReturn = newDate
      return newDate
    })
    return newDateReturn
  }, [])

  const goToNextWeek = useCallback(() => {
    let newDateReturn: Date = new Date()
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate)
      newDate.setDate(newDate.getDate() + 7)
      newDateReturn = newDate
      return newDate
    })
    return newDateReturn
  }, [])

  const goToPreviousWeek = useCallback(() => {
    let newDateReturn: Date = new Date()
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate)
      newDate.setDate(newDate.getDate() - 7)
      newDateReturn = newDate
      return newDate
    })
    return newDateReturn
  }, [])

  const goToNextMonth = useCallback(() => {
    let newDateReturn: Date = new Date()
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate)
      newDate.setMonth(newDate.getMonth() + 1)
      newDateReturn = newDate
      return newDate
    })
    return newDateReturn
  }, [])

  const goToPreviousMonth = useCallback(() => {
    let newDateReturn: Date = new Date()
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate)
      newDate.setMonth(newDate.getMonth() - 1)
      newDateReturn = newDate
      return newDate
    })
    return newDateReturn
  }, [])

  const goToNextYear = useCallback(() => {
    let newDateReturn: Date = new Date()
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate)
      newDate.setFullYear(newDate.getFullYear() + 1)
      newDateReturn = newDate
      return newDate
    })
    return newDateReturn
  }, [])

  const goToPreviousYear = useCallback(() => {
    let newDateReturn: Date = new Date()
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate)
      newDate.setFullYear(newDate.getFullYear() - 1)
      newDateReturn = newDate
      return newDate
    })
    return newDateReturn
  }, [])

  const goToToday = useCallback(() => {
    setCurrentDate(new Date())
    return new Date()
  }, [])

  return (
    <CalendarContext.Provider
      value={{
        view,
        setView,
        isLoading,
        setIsLoading,
        currentDate,
        setCurrentDate,
        enableDragAndDrop: enableDragAndDrop ?? false,
        numDays,
        setNumDays,
        goToNextDay,
        goToPreviousDay,
        goToNextWeek,
        goToPreviousWeek,
        goToNextMonth,
        goToPreviousMonth,
        goToNextYear,
        goToPreviousYear,
        goToToday,
      }}
    >
      {children}
    </CalendarContext.Provider>
  )
}

export function useCalendar() {
  const context = useContext(CalendarContext)
  if (!context) {
    throw new Error('useCalendar must be used within a CalendarProvider')
  }
  return context
}
