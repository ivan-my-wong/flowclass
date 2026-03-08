import { FIVE_MINUTES_INTERVALS } from '@/constants/fullCalendar'

import { MinutesDropzone } from './MinutesDropzone'

type DayViewGridItemProps = {
  hour: number
  date: Date
  highlightedMinutes: Set<number>
  onDragStart: (hour: number, minute: number) => void
  onDragMove: (hour: number, minute: number) => void
  onClick: (hour: number, minute: number) => void
}

export function DayViewGridItem({
  hour,
  date,
  highlightedMinutes,
  onDragStart,
  onDragMove,
  onClick,
}: DayViewGridItemProps): JSX.Element {
  return (
    <div className="z-4 h-14 border-b border-gray-300 relative">
      {FIVE_MINUTES_INTERVALS.map(minute => (
        <MinutesDropzone
          key={minute}
          hour={hour}
          minute={minute}
          date={date}
          isHighlighted={highlightedMinutes.has(minute)}
          onMouseDown={() => onDragStart(hour, minute)}
          onMouseMove={() => onDragMove(hour, minute)}
          onClick={() => onClick(hour, minute)}
        />
      ))}
    </div>
  )
}
