import { useTranslation } from 'react-i18next'
import { BsWindowDesktop } from 'react-icons/bs'
import { FaCheck, FaTimes, FaTrashAlt } from 'react-icons/fa'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { SubscriptionRecordPlan } from '@/types/schoolSubscriptionPlan'
import { cn } from '@/utils/cn'
import { formatCurrency, getCurrencyPrefix } from '@/utils/currency'

interface Props {
  currentPlan: SubscriptionRecordPlan
  onCancel: () => void
  onSelect?: () => void
  children?: React.ReactNode
}

const CardSubscribedPlan: React.FC<Props> = ({
  currentPlan,
  onCancel,
  onSelect,
  children,
}): JSX.Element => {
  const { t } = useTranslation()
  return (
    <Card
      className="px-5 py-5 mb-6 shadow-none bg-green-50 border-green-300 relative"
      onClick={() => onSelect && onSelect()}
    >
      <div className="flex items-center gap-3">
        <BsWindowDesktop
          size={40}
          className="p-3 rounded-lg bg-green-200 text-green-800"
        />
        <div className="text-sm font-semibold">
          {t(`subscription:stripeProduct.${currentPlan?.name}`, {
            defaultValue: currentPlan?.name,
          })}
        </div>
        <div className="text-right ml-auto">
          <div className="text-2xl font-semibold">
            {`${getCurrencyPrefix(currentPlan.price?.currency)}${formatCurrency(
              currentPlan.price?.unitAmount || 0,
              currentPlan.price?.currency || 'usd'
            )}`}
          </div>
          <div className="text-sm text-gray-600">
            {t('subscription:perYear')}
          </div>
        </div>
      </div>
      <Card
        className={cn(
          'bg-green-200 shadow-none border-none p-3 rounded-lg text-green-800 text-sm mt-4 font-medium flex items-start flex-col md:items-center md:flex-row',
          currentPlan.isCanceled && 'bg-red-200 text-red-800'
        )}
      >
        <div>
          {currentPlan.isCanceled
            ? t('subscription:cancelNextBilling')
            : t('subscription:planCurrentlyActiveLabel')}
        </div>
        {!currentPlan.isCanceled && currentPlan.price && (
          <Button
            variant="ghost"
            size="xs"
            iconBefore={<FaTrashAlt />}
            className="self-end border-red-400 text-red-600 ml-auto"
            onClick={() => onCancel()}
          >
            {t('subscription:actions.cancelSubscriptions')}
          </Button>
        )}
      </Card>
      {currentPlan.isCanceled && (
        <>
          <div className="px-3 py-1 flex items-center gap-1 text-xs text-white font-medium bg-red-500 rounded-full w-fit absolute top-[-13px] right-[130px]">
            <FaTimes size={15} /> {t('subscription:cancelled')}
          </div>
        </>
      )}
      <div className="px-3 py-1 flex items-center gap-1 text-xs text-white font-medium bg-green-500 rounded-full w-fit absolute top-[-13px] right-5">
        <FaCheck size={12} /> {t('subscription:subscribed')}
      </div>
      {children}
    </Card>
  )
}

export default CardSubscribedPlan
