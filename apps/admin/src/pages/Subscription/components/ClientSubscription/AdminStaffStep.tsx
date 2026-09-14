import { useEffect, useMemo, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { RxDotFilled } from 'react-icons/rx'

import { Card } from '@/components/ui/Card'
import { useSubscriptionStepPrice } from '@/hooks/useSubscriptionStepPrice'
import {
  ClientSubscriptionPlanT,
  SubscriptionOverviewT,
} from '@/types/schoolSubscriptionPlan'
import { formatCurrency, getCurrencyPrefix } from '@/utils/currency'
import { getStaffPlanKey } from '@/utils/getStaffPlanKey'

import InputCounter from './InputCounter'

interface Props {
  currentStep: number
  stepOptions: ClientSubscriptionPlanT[] | undefined
  onEmitResult: (result: SubscriptionOverviewT) => void
}

const AdminStaffStep: React.FC<Props> = ({
  currentStep,
  stepOptions,
  onEmitResult,
}): JSX.Element => {
  const { t } = useTranslation()
  const [staffCount, setStaffCount] = useState<number>(0)

  const deductionAmount = useMemo(() => {
    const a = stepOptions?.find(item => item.stripeProduct === null)
    if (a) {
      return a.typeQuota || 0
    }
    return 0
  }, [stepOptions])

  const selectedKey = useMemo(() => {
    return getStaffPlanKey(staffCount)
  }, [staffCount])

  const pricePerUnit = useMemo(() => {
    const plan = stepOptions?.find(item => item.name === selectedKey)
    if (plan?.stripeProduct) {
      const { currency, unitAmount } = plan.stripeProduct
      return {
        label: `${getCurrencyPrefix(currency)}${formatCurrency(
          unitAmount,
          currency
        )}`,
        price: unitAmount,
      }
    }
    return { label: 'FREE', price: 0 }
  }, [stepOptions, selectedKey])

  const staffPrice = useSubscriptionStepPrice(
    stepOptions,
    staffCount,
    selectedKey,
    deductionAmount
  )

  useEffect(() => {
    if (staffCount > 0) {
      const { planId, price, currency } = staffPrice
      const data: SubscriptionOverviewT = {
        planId,
        stepIndex: 3,
        stepValid: staffCount > 0,
        category: 'Admin Staff',
        label: `${staffCount} admins`,
        calculation: null,
        count: staffCount,
        annual: price,
        currency,
      }
      onEmitResult(data)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onEmitResult excluded to prevent circular re-renders
  }, [staffCount, staffPrice])

  return (
    <div className={currentStep === 3 ? 'block' : 'hidden'}>
      <div className="text-xl font-medium text-left mb-1">
        {t(`subscription:client.section.adminStaff.question`)}
      </div>
      <div className="text-sm mb-4 text-gray-700">
        {t(`subscription:client.section.adminStaff.description`)}
        <ol className="mt-2">
          <li className="flex items-center gap-1">
            <RxDotFilled />
            {t(`subscription:client.section.adminStaff.schoolManagers`)}
          </li>
          <li className="flex items-center gap-1">
            <RxDotFilled />
            {t(`subscription:client.section.adminStaff.receptionists`)}
          </li>
          <li className="flex items-center gap-1">
            <RxDotFilled />
            {t(`subscription:client.section.adminStaff.financeAdmin`)}
          </li>
          <li className="flex items-center gap-1">
            <RxDotFilled />
            {t(`subscription:client.section.adminStaff.coordinators`)}
          </li>
        </ol>
      </div>
      <div className="mb-2 text-gray-700 text-sm font-medium">
        {t(`subscription:client.section.adminStaff.inputLabel`)}
      </div>
      <Card className="p-5 shadow-none border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between flex-col gap-3 md:flex-row">
          <InputCounter
            count={staffCount}
            priceLabel={pricePerUnit.label}
            setCount={setStaffCount}
          />
          <div className="md:text-right text-center">
            <div className="text-sm text-gray-500">Total price</div>
            <div className="text-3xl font-semibold text-gray-800">
              {staffPrice.priceLabel}
            </div>
            <div className="text-sm text-gray-500">
              {t(`subscription:perYear`)}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default AdminStaffStep
