import { type FC, useMemo } from 'react'

import { useTranslation } from 'react-i18next'
import { useRecoilValue } from 'recoil'

import { selectClassQuota } from '@/stores/classQuotaData'
import { selectLocationRoomQuota } from '@/stores/locationRoomQuotaData'
import { ClassTypeEnum } from '@/types/course'
import type { CalendarEvent } from '@/types/fullCalendar.type'
import { LessonPreview } from '@/types/regularClass'
import { cn } from '@/utils/cn'
import dayjs from '@/utils/dayjs'
import { quotaToBgString } from '@/utils/misc'

const LessonCampaignItem: FC<{
  event: CalendarEvent
  isDragging: boolean
  onClick?: (event: CalendarEvent) => void
  selectedSessions: LessonPreview[]
}> = ({ event, isDragging, onClick, selectedSessions }) => {
  const { t } = useTranslation(['invoiceCampaign'])
  const quotaParam = {
    start: event.start,
    end: event.end,
  }
  const locationRoomTimeSlotQuota = useRecoilValue(
    selectLocationRoomQuota(quotaParam)
  )
  const classTimeSlotQuota = useRecoilValue(selectClassQuota(quotaParam))

  // Convert hex color to Tailwind classes
  const hexToTailwindClasses = (hexColor: string) => {
    const colorMap: Record<string, string> = {
      '#3B82F6': 'bg-blue-50 border-blue-500 text-blue-800',
      '#10B981': 'bg-green-50 border-green-500 text-green-800',
      '#8B5CF6': 'bg-purple-50 border-purple-500 text-purple-800',
      '#F59E0B': 'bg-yellow-50 border-yellow-500 text-yellow-800',
      '#EC4899': 'bg-pink-50 border-pink-500 text-pink-800',
      '#6366F1': 'bg-indigo-50 border-indigo-500 text-indigo-800',
      '#EF4444': 'bg-red-50 border-red-500 text-red-800',
      '#F97316': 'bg-orange-50 border-orange-500 text-orange-800',
    }
    return colorMap[hexColor] || 'bg-blue-50 border-blue-500 text-blue-800'
  }

  const classNameByType = useMemo(() => {
    // If event has a color (from all classes view), use that
    if (event.color && event.color.startsWith('#')) {
      return hexToTailwindClasses(event.color)
    }

    // Otherwise use default color based on type
    switch (event.type) {
      case ClassTypeEnum.regularV2:
        return 'bg-blue-50 border-blue-500 text-blue-800'
      case ClassTypeEnum.recurring:
        return 'bg-green-50 border-green-500 text-green-800'
      case ClassTypeEnum.appointment:
        return 'bg-purple-50 border-purple-500 text-purple-800'
      case ClassTypeEnum.workshop:
        return 'bg-yellow-50 border-yellow-500 text-yellow-800'
      default:
        return 'bg-gray-50 border-gray-500 text-gray-800'
    }
  }, [event?.type, event?.color])
  const isLessonSelected = useMemo(() => {
    const studentLesson = selectedSessions.find(
      lesson => lesson?.id === Number(event.id)
    )
    return !!studentLesson
  }, [selectedSessions, event.id])
  const isOverlapping = useMemo(() => {
    return selectedSessions.some(t => {
      if (event.id === t.id.toString()) return false
      const { start, end } = event
      const isStartOverlap = dayjs(t.startTime).isBetween(
        start,
        end,
        'minute',
        '()'
      )
      const isEndOverlap = dayjs(t.endTime).isBetween(
        start,
        end,
        'minute',
        '()'
      )
      return isStartOverlap || isEndOverlap
    })
  }, [selectedSessions, event])
  const duration = useMemo(() => {
    return dayjs(event.end).diff(event.start, 'minutes')
  }, [event.start, event.end])

  const quotaRoomPercentage = useMemo(() => {
    if (!locationRoomTimeSlotQuota) return 0
    const { quotaUsage, quota } = locationRoomTimeSlotQuota
    // Treat zero/negative quota as fully booked; clamp to [0, 100]
    if (!Number.isFinite(quota) || quota <= 0) return 100
    const percentage = (quotaUsage / quota) * 100
    return Math.max(0, Math.min(100, percentage))
  }, [locationRoomTimeSlotQuota])

  const quotaLocationIndicatorClass = useMemo(() => {
    return quotaToBgString(quotaRoomPercentage)
  }, [quotaRoomPercentage])

  const quotaClassPercentage = useMemo(() => {
    if (!classTimeSlotQuota) return 0
    const { quotaUsage, quota } = classTimeSlotQuota
    if (!Number.isFinite(quota) || quota <= 0) return 100
    const percentage = (quotaUsage / quota) * 100
    return Math.max(0, Math.min(100, percentage))
  }, [classTimeSlotQuota])

  const quotaClassIndicatorClass = useMemo(() => {
    return quotaToBgString(quotaClassPercentage)
  }, [quotaClassPercentage])
  const isNoQuota = useMemo(() => {
    // quota percentages represent USED capacity (usage/total), not remaining
    return quotaClassPercentage >= 100 || quotaRoomPercentage >= 100
  }, [quotaClassPercentage, quotaRoomPercentage])
  const isActionDisabled = useMemo(() => {
    return isOverlapping || isLessonSelected || isNoQuota
  }, [isLessonSelected, isOverlapping, isNoQuota])
  return (
    <div
      className={cn(
        'rounded h-full px-2 pt-1 pb-4 text-xs border-l-4 w-full cursor-pointer transition-all duration-200',
        classNameByType,
        isLessonSelected &&
          'cursor-not-allowed border-green-300 opacity-4 select-none',
        (isOverlapping || isNoQuota) &&
          'cursor-not-allowed border-gray-300 opacity-45 text-gray-300 select-none',
        isDragging ? 'opacity-50' : 'hover:shadow-md'
      )}
      onClick={e => {
        e.preventDefault()
        e.stopPropagation()
        if (isActionDisabled) return
        onClick?.(event)
      }}
      onKeyDown={e => {
        if (isActionDisabled) {
          e.stopPropagation()
          e.preventDefault()
          return
        }
        if (e.key === 'Enter' || e.key === ' ') {
          e.stopPropagation()
          e.preventDefault()
          onClick?.(event)
        }
      }}
      aria-label={event.title ?? 'Lesson'}
      aria-disabled={isActionDisabled}
      role="button"
      tabIndex={0}
    >
      {/* Show class name if available (when showing all classes) */}
      {event.className && (
        <div className="font-semibold text-xs mb-1 truncate">
          {event.className}
        </div>
      )}

      <div className="text-xs opacity-75 mt-1 flex flex-col">
        <span>
          {event.start.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
        <span>({t('editor.minutes', { count: duration })})</span>
        <div className="absolute flex gap-x-1 -bottom-3 pointer-events-none">
          <div
            className={cn('w-2 h-2 rounded-full', quotaClassIndicatorClass)}
          />
          <div
            className={cn('w-2 h-2 rounded-full', quotaLocationIndicatorClass)}
          />
        </div>
      </div>
    </div>
  )
}
export default LessonCampaignItem
