import { HOURS } from '@/constants/fullCalendar'
import { cn } from '@/utils/cn'
import { formatHourCalendar } from '@/utils/date.utils'

export default function Hour(): JSX.Element {
  return (
    <div
      className="w-16 flex-none bg-muted/5"
      role="rowheader"
      aria-label="Hour markers"
    >
      {HOURS.map(hour => (
        <div key={hour} className="relative h-14 text-xs ">
          <span
            className={cn(
              'absolute right-4 -top-2.5 text-muted-foreground',
              hour === 0 && 'opacity-0'
            )}
            role="cell"
            aria-label={`${formatHourCalendar(hour)} hour marker`}
          >
            {formatHourCalendar(hour)}
          </span>
        </div>
      ))}
    </div>
  )
}
