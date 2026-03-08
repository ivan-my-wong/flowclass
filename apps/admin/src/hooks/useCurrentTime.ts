import { useCallback, useEffect, useMemo, useState } from 'react'

import { HOUR_HEIGHT_PX, MINUTES_IN_HOUR } from '@/constants/fullCalendar'

type ReturnType = {
  currentTime: {
    hours: number
    minutes: number
    seconds: number
  }
  currentTimePosition: {
    top: string
  }
  currentDateTime: Date
}
export const useCurrentTime = (refreshIntervalMs = 1000): ReturnType => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date())

  const refreshTime = useCallback(() => {
    setCurrentDateTime(new Date())
  }, [])

  useEffect(() => {
    const interval = setInterval(refreshTime, refreshIntervalMs)
    return () => clearInterval(interval)
  }, [refreshTime, refreshIntervalMs])

  const currentTime = useMemo(() => {
    const hours = currentDateTime.getHours()
    const minutes = currentDateTime.getMinutes()
    const seconds = currentDateTime.getSeconds()
    return {
      hours,
      minutes,
      seconds,
    }
  }, [currentDateTime])

  const currentTimePosition = useMemo(() => {
    const { hours } = currentTime
    const { minutes } = currentTime
    return {
      top: `${
        hours * HOUR_HEIGHT_PX + (minutes * HOUR_HEIGHT_PX) / MINUTES_IN_HOUR
      }px`,
    }
  }, [currentTime])

  return {
    currentTime,
    currentTimePosition,
    currentDateTime,
  }
}

export default useCurrentTime
