import { FC } from 'react'

import { useTranslation } from 'react-i18next'

import { bgQuotaAvailability } from '@/constants/course'
import { QuotaTypeEnum } from '@/types/classes'
import { cn } from '@/utils/cn'

type Props = {
  type: QuotaTypeEnum
  indicatorClass?: string
}

const QuotaIndicator: FC<Props> = ({ type, indicatorClass }) => {
  const { t } = useTranslation()
  const labelKeyMap: Record<QuotaTypeEnum, string> = {
    [QuotaTypeEnum.AVAILABLE]: 'calendar:legend.available',
    [QuotaTypeEnum.LIMITED]: 'calendar:legend.limited',
    [QuotaTypeEnum.FULL]: 'calendar:legend.full',
  }

  return (
    <div className="flex gap-2 items-center justify-center">
      <div
        aria-hidden="true"
        className={cn(
          'w-3 h-3 rounded-full',
          bgQuotaAvailability[type] ?? 'bg-background-layer-4',
          indicatorClass
        )}
      />
      <span className="capitalize">{t(labelKeyMap[type])}</span>
    </div>
  )
}
export default QuotaIndicator
