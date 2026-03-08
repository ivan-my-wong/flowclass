import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/HoverCard'
import { dateFormatOptions } from '@/constants/fullCalendar'
import useCurrentTime from '@/hooks/useCurrentTime'
import { useLanguage } from '@/hooks/useLanguage'

export const TimeCursor = (): JSX.Element => {
  const { currentTimePosition, currentDateTime } = useCurrentTime()
  const { language } = useLanguage()
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div
          className="absolute inset-0 bg-red-500 h-0.5 w-64 z-5 hover:z-20"
          style={{ top: currentTimePosition.top }}
          role="presentation"
          aria-label="Current time indicator"
        >
          <div className="relative">
            <div className="absolute h-4 w-4 rounded-full bg-red-500 -left-2 -top-2" />
          </div>
        </div>
      </HoverCardTrigger>
      <HoverCardContent>
        <div className="flex flex-col">
          <div className="text-sm font-medium">
            {currentDateTime.toLocaleString(
              language,
              dateFormatOptions.dateMonthName
            )}
          </div>
          <div className="text-sm font-medium">
            {currentDateTime.toLocaleString(language, dateFormatOptions.clock)}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
