import { useState } from 'react'

import { useTranslation } from 'react-i18next'
import { FaArrowRight, FaCheck } from 'react-icons/fa'
import { FiUsers } from 'react-icons/fi'
import { IoCheckmark } from 'react-icons/io5'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import {
  DialogBody,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog'
import {
  NewPlanPayload,
  SubscriptionRecordPlan,
  SubscriptionReview,
  SupportedActions,
} from '@/types/schoolSubscriptionPlan'
import { formatCurrency, getCurrencyPrefix } from '@/utils/currency'

const rangeLabel = {
  BASE_USER_100: '1 - 100',
  BASE_USER_500: '101 - 500',
  BASE_USER_1500: '501 - 1500',
  BASE_USER_3000: '1501 - 3000',
  BASE_USER_5000: '3001 - 5000',
  BASE_USER_UNLIMITED: 'More than 5000',
}

interface Props {
  currentPlan: SubscriptionRecordPlan
  availablePlans: SubscriptionRecordPlan[]
  onProceed: (selected: SubscriptionReview) => void
}
const ModifyUsers: React.FC<Props> = ({
  currentPlan,
  availablePlans,
  onProceed,
}): JSX.Element => {
  const { t } = useTranslation()
  const currentPlanCurrency = currentPlan.price?.currency || 'usd'
  const currencyPrefix = getCurrencyPrefix(currentPlanCurrency)
  const [selected, setSelected] = useState<SubscriptionRecordPlan>()

  const handleProceed = () => {
    const selectedPrice = Number(selected?.price?.unitAmount) || 0
    const currentPrice = Number(currentPlan?.price?.unitAmount) || 0
    const diff = selectedPrice - currentPrice

    let actionType: SupportedActions = 'substitute'
    if (diff > 0) {
      actionType = 'upgrade'
    } else {
      actionType = 'downgrade'
    }

    const targetedPlans: NewPlanPayload[] = [
      {
        planId: selected?.id || 0,
        priceId: selected?.price?.id || 0,
        planQuantity: 1,
        targetedPlans: selected,
      },
    ]

    const priceLabel = `${getCurrencyPrefix(
      selected?.price?.currency
    )}${formatCurrency(selectedPrice, selected?.price?.currency || 'usd')}`
    onProceed({
      actionType,
      targetTotalPrice: selectedPrice,
      targetTotalPriceLabel: priceLabel,
      targetedPlans,
    })
  }

  return (
    <>
      <DialogBody>
        <Card className="p-5 shadow-none bg-green-50 border-green-300 relative">
          <div className="flex items-center gap-3 ">
            <FiUsers
              size={40}
              className="bg-green-200 text-green-400 p-2 rounded-sm"
            />
            <div>
              <div className="text-gray-800 font-medium capitalize">
                {currentPlan.name.replaceAll('_', ' ').toLowerCase()}
              </div>
              <div className="text-sm text-gray-600">
                {rangeLabel[currentPlan.name]}
              </div>
            </div>
            <div className="text-right ml-auto">
              <div className="text-sm text-gray-600">
                {t(`subscription:totalPrice`)}
              </div>
              <div className="text-lg font-medium">{`${currencyPrefix}${formatCurrency(
                currentPlan.price?.unitAmount || 0,
                currentPlanCurrency
              )}`}</div>
            </div>
          </div>
          <Card className="bg-green-200 shadow-none border-none p-3 rounded-lg text-green-800 text-sm mt-4 font-medium flex items-start flex-col md:items-center md:flex-row">
            <div>{t(`subscription:planCurrentlyActiveLabel`)}</div>
          </Card>
          <div className="px-3 py-1 flex items-center gap-2 text-xs text-white font-medium bg-green-500 rounded-full w-fit absolute top-[-13px] right-8">
            <FaCheck size={12} /> {t(`subscription:subscribed`)}
          </div>
        </Card>
        <div className="font-medium text-sm mt-6 mb-2">
          {t(`subscription:availablePlans`)}
        </div>
        {availablePlans.map(availablePlan => (
          <Card
            key={availablePlan.id}
            className="p-5 shadow-none cursor-pointer border-gray-300 mb-3 flex items-center gap-3 relative"
            onClick={() => setSelected(availablePlan)}
          >
            <FiUsers
              size={40}
              className="bg-blue-100 text-blue-400 p-2 rounded-sm"
            />
            <div>
              <div className="text-gray-800 font-medium capitalize mb-1">
                {availablePlan.name.replaceAll('_', ' ').toLowerCase()}
              </div>
              <div className="text-sm text-gray-600">
                {rangeLabel[availablePlan.name]}
              </div>
            </div>
            <div className="text-right ml-auto">
              <div className="text-sm text-gray-600">
                {t(`subscription:totalPrice`)}
              </div>
              <div className="text-lg font-medium">{`${getCurrencyPrefix(
                availablePlan.price?.currency
              )}${formatCurrency(
                availablePlan.price?.unitAmount || 0,
                availablePlan.price?.currency || 'usd'
              )}`}</div>
            </div>
            {selected === availablePlan && (
              <div className="w-5 h-5 absolute right-3 top-1 rounded-full bg-primary text-gray-50 flex items-center justify-center">
                <IoCheckmark size={17} />
              </div>
            )}
          </Card>
        ))}
      </DialogBody>
      <DialogFooter className="border-t border-gray-200 sticky bottom-0 bg-white">
        <div className="flex items-center justify-between gap-2">
          <Button
            iconAfter={<FaArrowRight />}
            disabled={!selected}
            onClick={() => handleProceed()}
          >
            {t(`subscription:actions.proceedReview`)}
          </Button>
        </div>
      </DialogFooter>
    </>
  )
}

export default ModifyUsers
