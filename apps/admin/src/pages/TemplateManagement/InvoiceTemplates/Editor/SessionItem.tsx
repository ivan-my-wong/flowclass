import { useTranslation } from 'react-i18next'
import { LuCalendar, LuTimer, LuUser2, LuX } from 'react-icons/lu'

import { Badge } from '@/components/ui/Badge'
import useSiteData from '@/hooks/useSiteData'
import { Classes } from '@/types/classes'
import { LessonPreview } from '@/types/regularClass'
import dayjs from '@/utils/dayjs'

import ClassInfoItem from '../components/CourseAssigment/Course/ClassInfoItem'

type SessionItemProps = {
  session: LessonPreview
  classItem?: Classes & { color?: string }
  onDelete?: () => void
}
const SessionItem = ({
  session,
  onDelete,
  classItem,
}: SessionItemProps): JSX.Element => {
  const { t } = useTranslation(['invoiceCampaign'])
  const { getCurrentSiteTimeZoneDate } = useSiteData()
  const start = getCurrentSiteTimeZoneDate(session.startTime)
  const end = getCurrentSiteTimeZoneDate(session.endTime)
  const diffMin = dayjs(end).diff(start, 'minute')
  const timeInMinutes = Number.isFinite(diffMin) ? Math.max(diffMin, 0) : 0

  // Get color for the class indicator
  const indicatorColor = classItem?.color || '#3B82F6' // Default blue

  return (
    <div
      className="bg-white rounded-lg p-2 border-l-4"
      style={{ borderLeftColor: indicatorColor }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: indicatorColor }}
          />
          <div className="flex flex-col gap-1">
            <span className="font-medium text-gray-900">
              {dayjs(start).format('ddd, MMM D')}
            </span>
            {/* Show class name badge if available (for multi-class mode) */}
            {classItem?.name && (
              <Badge
                variant="outline"
                className="text-xs font-semibold w-fit"
                style={{
                  borderColor: indicatorColor,
                  color: indicatorColor,
                }}
              >
                {classItem.name}
              </Badge>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onDelete}
          aria-label={t('editor.removeSession') as string}
          className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
        >
          <LuX className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
      <div className="flex items-center text-sm text-gray-600 mb-1 gap-x-2">
        <LuTimer aria-hidden="true" />
        {dayjs(start).format('h:mm A')} - {dayjs(end).format('h:mm A')} (
        {t('editor.minutes', { count: timeInMinutes })})
      </div>

      {/* Show course name if class has course info */}
      {classItem?.course?.name && (
        <div className="text-xs text-gray-500 mb-2 italic">
          {classItem.course.name}
        </div>
      )}

      <div className="flex items-center gap-2">
        {classItem?.instructor && (
          <ClassInfoItem
            icon={<LuUser2 aria-hidden="true" />}
            label={classItem?.instructor?.fullName ?? t('editor.noInstructor')}
          />
        )}
        {session.period && (
          <ClassInfoItem
            icon={<LuCalendar aria-hidden="true" />}
            label={t('editor.regularV2periodLabel', { period: session.period })}
          />
        )}
      </div>
    </div>
  )
}

export default SessionItem
