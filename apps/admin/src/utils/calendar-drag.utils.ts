import { Dispatch, SetStateAction } from 'react'

export type DragState = {
  isDragging: boolean
  dragStartTime: Date | null
  dragEndTime: Date | null
  isMouseDownRef: React.MutableRefObject<boolean>
}

export type DragStateActions = {
  setIsDragging: Dispatch<SetStateAction<boolean>>
  setDragStartTime: Dispatch<SetStateAction<Date | null>>
  setDragEndTime: Dispatch<SetStateAction<Date | null>>
}

export const handleDragStart = (
  hour: number,
  minute: number,
  date: Date,
  {
    isMouseDownRef,
    setIsDragging,
    setDragStartTime,
    setDragEndTime,
  }: DragState & DragStateActions
) => {
  const startTime = new Date(date)
  startTime.setHours(hour, minute, 0, 0)

  // eslint-disable-next-line no-param-reassign
  isMouseDownRef.current = true
  setIsDragging(true)
  setDragStartTime(startTime)
  setDragEndTime(startTime)
}

export const handleDragMove = (
  hour: number,
  minute: number,
  date: Date,
  {
    isMouseDownRef,
    dragStartTime,
    setDragEndTime,
  }: DragState & DragStateActions
) => {
  if (!isMouseDownRef.current || !dragStartTime) return

  const currentTime = new Date(date)
  currentTime.setHours(hour, minute)
  setDragEndTime(currentTime)
}

export const handleDragEnd = (
  onTimeSlotSelect: ((start: Date, end: Date) => void) | undefined,
  {
    isMouseDownRef,
    dragStartTime,
    dragEndTime,
    setIsDragging,
    setDragStartTime,
    setDragEndTime,
  }: DragState & DragStateActions
) => {
  if (
    isMouseDownRef.current &&
    dragStartTime &&
    dragEndTime &&
    onTimeSlotSelect
  ) {
    // Ensure start time is before end time
    if (dragStartTime.getTime() > dragEndTime.getTime()) {
      onTimeSlotSelect(dragEndTime, dragStartTime)
    } else {
      onTimeSlotSelect(dragStartTime, dragEndTime)
    }
  }

  // Reset drag state
  // eslint-disable-next-line no-param-reassign
  isMouseDownRef.current = false
  setIsDragging(false)
  setDragStartTime(null)
  setDragEndTime(null)
}

export const handleClick = (
  hour: number,
  minute: number,
  date: Date,
  onTimeSlotSelect: ((start: Date, end: Date) => void) | undefined,
  { isMouseDownRef }: DragState
) => {
  if (!isMouseDownRef.current && onTimeSlotSelect) {
    const startTime = new Date(date)
    startTime.setHours(hour, minute, 0, 0)
    const endTime = new Date(startTime)
    endTime.setMinutes(minute + 30, 0, 0) // Default 30-minute slot
    onTimeSlotSelect(startTime, endTime)
  }
}

export const getHighlightedMinutesForHour = (
  hour: number,
  date: Date,
  { isDragging, dragStartTime, dragEndTime }: DragState
): Set<number> => {
  if (!isDragging || !dragStartTime || !dragEndTime) return new Set()

  // Only highlight if we're on the same date
  if (
    date.getFullYear() !== dragStartTime.getFullYear() ||
    date.getMonth() !== dragStartTime.getMonth() ||
    date.getDate() !== dragStartTime.getDate()
  ) {
    return new Set()
  }

  const startHour = dragStartTime.getHours()
  const endHour = dragEndTime.getHours()
  const startMinute = dragStartTime.getMinutes()
  const endMinute = dragEndTime.getMinutes()

  const newHighlightedMinutes = new Set<number>()

  if (startHour === endHour) {
    // Within same hour
    if (hour === startHour) {
      const [minMinute, maxMinute] =
        startMinute < endMinute
          ? [startMinute, endMinute]
          : [endMinute, startMinute]

      for (let m = minMinute; m <= maxMinute; m += 5) {
        newHighlightedMinutes.add(m)
      }
    }
  } else if (startHour < endHour) {
    // Dragging downwards
    if (hour === startHour) {
      // First hour: highlight from start minute to end
      for (let m = startMinute; m < 60; m += 5) {
        newHighlightedMinutes.add(m)
      }
    } else if (hour === endHour) {
      // Last hour: highlight from start to end minute
      for (let m = 0; m <= endMinute; m += 5) {
        newHighlightedMinutes.add(m)
      }
    } else if (hour > startHour && hour < endHour) {
      // Middle hours: highlight all minutes
      for (let m = 0; m < 60; m += 5) {
        newHighlightedMinutes.add(m)
      }
    }
  } else {
    // Dragging upwards
    // eslint-disable-next-line no-lonely-if
    if (hour === endHour) {
      // First hour: highlight from start to end minute
      for (let m = 0; m <= endMinute; m += 5) {
        newHighlightedMinutes.add(m)
      }
    } else if (hour === startHour) {
      // Last hour: highlight from start minute to end
      for (let m = startMinute; m < 60; m += 5) {
        newHighlightedMinutes.add(m)
      }
    } else if (hour > endHour && hour < startHour) {
      // Middle hours: highlight all minutes
      for (let m = 0; m < 60; m += 5) {
        newHighlightedMinutes.add(m)
      }
    }
  }

  return newHighlightedMinutes
}
