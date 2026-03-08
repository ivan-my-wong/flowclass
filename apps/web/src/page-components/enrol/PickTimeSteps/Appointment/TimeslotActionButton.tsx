import { useMemo } from 'react'

import useTranslation from 'next-translate/useTranslation'

import Button from '@/components/Buttons/Button'
import { RecurringSchedule } from '@/types'
import { CheckQuotaResponse } from '@/types/enrol'
import { cn } from '@/utils/cn'
import { formatTime } from '@/utils/format'

type Props = {
  isSelected: boolean
  timeSlot: RecurringSchedule
  isMaxTimeSlotSelected: boolean
  quotaData: CheckQuotaResponse[]
  isLoadingQuota: boolean
  handleSelectTimeSlot: (timeSlot: RecurringSchedule) => void
  handleRemoveTimeSlot: (timeSlot: RecurringSchedule) => void
  isOverlapping?: boolean
}

const TimeSlotActionButton = ({
  isSelected,
  timeSlot,
  quotaData,
  isLoadingQuota,
  isMaxTimeSlotSelected,
  handleSelectTimeSlot,
  handleRemoveTimeSlot,
  isOverlapping = false,
}: Props): JSX.Element => {
  const { t } = useTranslation()

  const quota = useMemo(() => {
    return quotaData.find(q => q.lessonId === timeSlot.id)
  }, [quotaData, timeSlot.id])

  const quotaPercentage = useMemo(() => {
    if (!quota || quota?.quota === 0) return 100
    if ((quota?.conflict?.length ?? 0) > 0) return 100
    return 100 - (quota.remainingQuota / quota.quota) * 100
  }, [quota])

  const remainingQuota = useMemo(() => {
    if (!quota) return undefined
    if ((quota?.conflict?.length ?? 0) > 0) return 0
    return quota.remainingQuota
  }, [quota])

  return (
    <div
      className={cn(
        'mb-2 block w-full min-w-full overflow-hidden md:min-w-[340px]',
        isSelected && 'flex gap-x-2'
      )}
    >
      <Button
        variant="outlined"
        data-testid={'recurring-time-slot'}
        disabled={
          isSelected ||
          isMaxTimeSlotSelected ||
          isLoadingQuota ||
          !!quota?.conflict?.length ||
          quotaPercentage >= 100 ||
          isOverlapping
        }
        aria-selected={isSelected}
        aria-busy={isLoadingQuota}
        aria-label={`Time slot ${formatTime(timeSlot.startTime)} to ${formatTime(
          timeSlot.endTime
        )}`}
        className={cn(
          'relative flex w-full flex-col py-3 duration-300',
          isSelected && '!text-background w-[48%] !bg-gray-500'
        )}
        onClick={() => {
          handleSelectTimeSlot(timeSlot)
        }}
      >
        <span>
          {formatTime(timeSlot.startTime)} - {formatTime(timeSlot.endTime)}
        </span>

        {typeof remainingQuota === 'number' && remainingQuota > 0 && (
          <span className="mt-1 text-xs opacity-70">
            {t('enrol:pickPeriodStep.seatsLeft')}: {remainingQuota}
          </span>
        )}

        {quota && (
          <div className="bg-backgroundDisabled absolute bottom-0 left-0 right-0 h-0.5 w-full">
            <div
              className={cn({
                'min-h-full': true,
                'bg-facebookBlue': quotaPercentage > 0 && quotaPercentage <= 50,
                'bg-tertiary':
                  (quotaPercentage > 50 && quotaPercentage <= 100) ||
                  (quota?.conflict?.length ?? 0) > 0,
              })}
              style={{ width: `${quotaPercentage}%` }}
            />
          </div>
        )}
      </Button>
      <Button
        className={cn(
          'text-background ml-2 h-0 !p-0 text-sm opacity-0 transition-transform duration-300',
          isSelected && 'h-auto w-[48%] opacity-100'
        )}
        disabled={isLoadingQuota}
        data-testid={'remove-recurring-time-slot'}
        onClick={() => {
          handleRemoveTimeSlot(timeSlot)
        }}
      >
        {t('enrol:pickPeriodStep.selectTimeSlot.removeFromList')}
      </Button>
    </div>
  )
}

export default TimeSlotActionButton
