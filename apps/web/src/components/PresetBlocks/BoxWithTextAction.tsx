// import Text from '@/components/Texts/Text'
import useTranslation from 'next-translate/useTranslation'

import { cn } from '@/utils/cn'
import { generateDataTestId } from '@/utils/string.utils'

type BoxWithTextActionProps = {
  textId?: string
  text: string
  categoryIcon?: JSX.Element
  description?: string | JSX.Element
  icon: JSX.Element
  action?: (...props: any) => any
  disabled?: boolean
  type?: 'submit' | undefined
  percentage?: number
  quotaLeft?: number
  prefix?: string | JSX.Element
  insufficient?: boolean
}

const BoxWithTextAction = ({
  textId,
  categoryIcon,
  text,
  description = '',
  icon,
  action,
  disabled = false,
  prefix,
  percentage,
  quotaLeft,
  insufficient,
}: BoxWithTextActionProps): JSX.Element => {
  const { t } = useTranslation()

  const adjustedPercentage = Math.max(percentage ?? 0, ADJUST_THRESHOLD)
  const progressStatus = getProgressStatus(adjustedPercentage)

  let isDisabledDueToNoQuota = false

  if (percentage !== undefined && percentage >= 100 && quotaLeft !== undefined && quotaLeft <= 0) {
    isDisabledDueToNoQuota = true
  }

  const totalDisabled = disabled || isDisabledDueToNoQuota

  const buttonClassName = cn(
    'group box-row flex-wrap w-full justify-between rounded px-4 py-5 relative overflow-hidden',
    totalDisabled
      ? 'bg-backgroundLayer3 cursor-default text-textDisabled'
      : 'bg-backgroundLayer2 cursor-pointer text-text'
  )

  const renderBoxActionText = () => {
    if (insufficient) {
      return (
        <p className="text-left text-lg" id={textId ?? 'option-text'}>
          {t('enrol:pickPriceOptionStep.insufficientLessonsWithinPeriod')}
        </p>
      )
    }
    if (isDisabledDueToNoQuota) {
      let quotaText = ''
      if (progressStatus === ProgressStatus.GOOD_THRESHOLD) {
        quotaText = 'openingsAvailable'
      } else if (progressStatus === ProgressStatus.AVERAGE_THRESHOLD) {
        quotaText = 'limitedOpenings'
      } else if (progressStatus === ProgressStatus.POOR_THRESHOLD) {
        quotaText = 'onlyAFewOpeningsLeft'
      } else if (progressStatus === ProgressStatus.ALMOST_FULL) {
        quotaText = 'seatLeft'
      } else {
        quotaText = 'noSeatLeft'
      }
      return `${t(`enrol:pickPeriodStep.${quotaText}`)} ${
        progressStatus === ProgressStatus.ALMOST_FULL ? quotaLeft : ''
      }`
    }

    if (disabled) {
      if (isDisabledDueToNoQuota) {
        return (
          <p className="text-left text-lg" id={textId ?? 'option-text'}>
            {t('enrol:pickPeriodStep.noSeatLeft')}
          </p>
        )
      }
      return (
        <p className="text-left text-lg" id={textId ?? 'option-text'}>
          {t('enrol:pickPeriodStep.noAvailableTimeSlot')}
        </p>
      )
    }

    return (
      <p className="text-left text-lg" id={textId ?? 'option-text'}>
        {t(`enrol:pickPeriodStep.openingsAvailable`)}
      </p>
    )
  }
  return (
    <button
      className={buttonClassName}
      onClick={action}
      disabled={totalDisabled}
      id="option"
      data-testid={generateDataTestId('selection-button', text)}
    >
      {typeof percentage === 'number' && (
        <div className="bg-backgroundDisabled absolute bottom-0 left-0 h-1 w-full bg-black">
          <div
            style={{ width: `${adjustedPercentage}%` }}
            className={`${getProgressBarColor(progressStatus)} min-h-full`}
          />
        </div>
      )}
      <div className="flex items-center gap-x-2">
        <div>{prefix}</div>
        <div>
          <p className="text-left text-lg" id={textId ?? 'option-text'}>
            {text}
          </p>
          {!!description && (
            <div className="text-left text-sm" id="lesson-price">
              {description}
            </div>
          )}
          {categoryIcon && <div className="mt-2">{categoryIcon}</div>}
        </div>
      </div>
      <div
        className={`flex flex-row items-center transition ${
          !totalDisabled
            ? `${getProgressStatusTextColor(progressStatus)} group-hover:translate-x-2`
            : 'text-textDisabled'
        }`}
      >
        {typeof percentage === 'number' && (
          <div className={`mr-2 ${getProgressStatusTextColor(progressStatus)}`}>
            {renderBoxActionText()}

            <div className="flex flex-col items-end">
              {typeof quotaLeft === 'number' && quotaLeft >= 0 && (
                <div className="text-textSecondary mt-1 text-xs">
                  {`${t('enrol:pickPeriodStep.seatsLeft')}: ${quotaLeft}`}
                </div>
              )}
            </div>
          </div>
        )}
        {icon}
      </div>
    </button>
  )
}

export default BoxWithTextAction

const getProgressBarColor = (progressStatus: ProgressStatus): string => {
  if (progressStatus === ProgressStatus.GOOD_THRESHOLD) {
    return 'bg-facebookBlue'
  } else if (progressStatus === ProgressStatus.AVERAGE_THRESHOLD) {
    return 'bg-tertiary'
  } else if (progressStatus === ProgressStatus.POOR_THRESHOLD) {
    return 'bg-secondary'
  } else if (progressStatus === ProgressStatus.ALMOST_FULL) {
    return 'bg-warn'
  } else {
    return 'bg-backgroundLayer3'
  }
}

const getProgressStatusTextColor = (progressStatus: ProgressStatus): string => {
  if (progressStatus === ProgressStatus.GOOD_THRESHOLD) {
    return 'text-facebookBlue'
  } else if (progressStatus === ProgressStatus.AVERAGE_THRESHOLD) {
    return 'text-tertiary'
  } else if (progressStatus === ProgressStatus.POOR_THRESHOLD) {
    return 'text-secondary'
  } else if (progressStatus === ProgressStatus.ALMOST_FULL) {
    return 'text-warn'
  } else {
    return 'text-textDisabled'
  }
}

const getProgressStatus = (percentage: number): ProgressStatus => {
  if (percentage < GOOD_THRESHOLD) {
    return ProgressStatus.GOOD_THRESHOLD
  } else if (percentage < AVERAGE_THRESHOLD) {
    return ProgressStatus.AVERAGE_THRESHOLD
  } else if (percentage < POOR_THRESHOLD) {
    return ProgressStatus.POOR_THRESHOLD
  } else if (percentage < ALMOST_FULL_THRESHOLD) {
    return ProgressStatus.ALMOST_FULL
  } else {
    return ProgressStatus.FULL
  }
}

const ADJUST_THRESHOLD = 10
const ALMOST_FULL_THRESHOLD = 100
const POOR_THRESHOLD = 90
const AVERAGE_THRESHOLD = 70
const GOOD_THRESHOLD = 40

enum ProgressStatus {
  FULL = 'FULL',
  ALMOST_FULL = 'ALMOST_FULL_THRESHOLD',
  POOR_THRESHOLD = 'POOR_THRESHOLD',
  AVERAGE_THRESHOLD = 'AVERAGE_THRESHOLD',
  GOOD_THRESHOLD = 'GOOD_THRESHOLD',
}
