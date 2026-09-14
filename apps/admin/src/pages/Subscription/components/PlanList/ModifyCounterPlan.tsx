import { useEffect, useMemo, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { FaArrowRight } from 'react-icons/fa'
import { FiUsers } from 'react-icons/fi'

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
} from '@/types/schoolSubscriptionPlan'
import { formatCurrency, getCurrencyPrefix } from '@/utils/currency'
import { isNumberInRange } from '@/utils/number.utils'

const multipleAdminPlanRange = {
  MULTIPLE_ADMIN_1: {
    lowest: 1,
    highest: 3,
  },
  MULTIPLE_ADMIN_4: {
    lowest: 4,
    highest: 10,
  },
  MULTIPLE_ADMIN_20: {
    lowest: 11,
    highest: 20,
  },
  MULTIPLE_ADMIN_30: {
    lowest: 21,
    highest: 30,
  },
  MULTIPLE_ADMIN_UNLIMITED: {
    lowest: 31,
    highest: 1000,
  },
}

const multipleSchoolPlanRange = {
  MULTIPLE_INSTITUTION_1: {
    lowest: 1,
    highest: 1,
  },
  MULTIPLE_INSTITUTION_4: {
    lowest: 2,
    highest: 4,
  },
  MULTIPLE_INSTITUTION_10: {
    lowest: 5,
    highest: 10,
  },
  MULTIPLE_INSTITUTION_20: {
    lowest: 11,
    highest: 20,
  },
  MULTIPLE_INSTITUTION_50: {
    lowest: 21,
    highest: 50,
  },
  MULTIPLE_INSTITUTION_UNLIMITED: {
    lowest: 51,
    highest: 1000,
  },
}

const multipleTutorPlanRange = {
  MULTIPLE_TUTOR_2: {
    lowest: 0,
    highest: 2,
  },
  MULTIPLE_TUTOR_5: {
    lowest: 3,
    highest: 5,
  },
  MULTIPLE_TUTOR_10: {
    lowest: 6,
    highest: 10,
  },
  MULTIPLE_TUTOR_20: {
    lowest: 11,
    highest: 20,
  },
  MULTIPLE_TUTOR_UNLIMITED: {
    lowest: 21,
    highest: 1000,
  },
}

const keys = {
  MULTIPLE_ADMIN: {
    freeKey: 'MULTIPLE_ADMIN_1',
    multipleKey: 'MULTIPLE_ADMIN_UNLIMITED',
    usedRange: multipleAdminPlanRange,
    deduction: 3,
    title: 'Admin Users',
    desc: 'Number of administrator accounts',
  },
  MULTIPLE_SCHOOL: {
    freeKey: 'MULTIPLE_INSTITUTION_1',
    multipleKey: 'MULTIPLE_INSTITUTION_UNLIMITED',
    usedRange: multipleSchoolPlanRange,
    deduction: 1,
    title: 'Multiple Schools',
    desc: 'Number of schools you can manage',
  },
  MULTIPLE_TUTOR: {
    freeKey: 'MULTIPLE_TUTOR_2',
    multipleKey: 'MULTIPLE_TUTOR_UNLIMITED',
    usedRange: multipleTutorPlanRange,
    deduction: 2,
    title: 'Multiple Tutors',
    desc: 'Number of tutors you can manage',
  },
}

interface Props {
  currentPlan: SubscriptionRecordPlan
  availablePlans: SubscriptionRecordPlan[]
  onProceed: (selected: SubscriptionReview) => void
}
const DialogModifyCount: React.FC<Props> = ({
  currentPlan,
  availablePlans,
  onProceed,
}): JSX.Element => {
  const { t } = useTranslation()
  const [quota, setQuota] = useState<number>(currentPlan.qty)
  const { multipleKey, freeKey, usedRange, deduction, title, desc } =
    keys[currentPlan.type]
  const [selectedPlan, setSelectedPlan] =
    useState<SubscriptionRecordPlan | null>()

  const findSelectedKey = (q: number): string => {
    if (currentPlan.type === 'MULTIPLE_ADMIN') {
      if (isNumberInRange(q, 1, 3)) {
        return 'MULTIPLE_ADMIN_1'
      }
      if (isNumberInRange(q, 4, 10)) {
        return 'MULTIPLE_ADMIN_4'
      }
      if (isNumberInRange(q, 11, 20)) {
        return 'MULTIPLE_ADMIN_20'
      }
      if (isNumberInRange(q, 21, 30)) {
        return 'MULTIPLE_ADMIN_30'
      }
      return 'MULTIPLE_ADMIN_UNLIMITED'
    }
    if (currentPlan.type === 'MULTIPLE_SCHOOL') {
      if (isNumberInRange(q, 1, 1)) {
        return 'MULTIPLE_INSTITUTION_1'
      }
      if (isNumberInRange(q, 2, 4)) {
        return 'MULTIPLE_INSTITUTION_4'
      }
      if (isNumberInRange(q, 5, 10)) {
        return 'MULTIPLE_INSTITUTION_10'
      }
      if (isNumberInRange(q, 11, 20)) {
        return 'MULTIPLE_INSTITUTION_20'
      }
      if (isNumberInRange(q, 21, 50)) {
        return 'MULTIPLE_INSTITUTION_50'
      }
      return 'MULTIPLE_INSTITUTION_UNLIMITED'
    }
    if (currentPlan.type === 'MULTIPLE_TUTOR') {
      if (isNumberInRange(q, 0, 2)) {
        return 'MULTIPLE_TUTOR_2'
      }
      if (isNumberInRange(q, 3, 5)) {
        return 'MULTIPLE_TUTOR_5'
      }
      if (isNumberInRange(q, 6, 10)) {
        return 'MULTIPLE_TUTOR_10'
      }
      if (isNumberInRange(q, 11, 20)) {
        return 'MULTIPLE_TUTOR_20'
      }
      return 'MULTIPLE_INSTITUTION_UNLIMITED'
    }

    return ''
  }

  const currentPlanPrice = useMemo(() => {
    const { name, price, qty } = currentPlan
    if (name === multipleKey) {
      return Number(price?.unitAmount)
    }
    if (name === freeKey) {
      return 0
    }
    return (qty - deduction) * Number(price?.unitAmount)
  }, [currentPlan, freeKey, multipleKey, deduction])

  const rangeLabel = useMemo(() => {
    if (selectedPlan) {
      const selectedKey = findSelectedKey(quota)
      const { lowest, highest } = usedRange[findSelectedKey(quota)]
      if (selectedKey.includes('UNLIMITED')) {
        return 'Unlimited'
      }
      return `${lowest}-${highest}`
    }

    return ''
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlan, usedRange, quota])

  const pricePerUnit = useMemo(() => {
    let price = 0
    if (selectedPlan) {
      price = Number(selectedPlan.price?.unitAmount || 0)
    }

    const priceLabel =
      price > 0
        ? `${getCurrencyPrefix(
            selectedPlan?.price?.currency || 'usd'
          )}${formatCurrency(
            price,
            selectedPlan?.price?.currency || 'usd'
          )}/unit`
        : 'Free'

    return {
      price,
      label: priceLabel,
    }
  }, [selectedPlan])

  const totalPrice = useMemo(() => {
    let priceTemp = 0
    if (selectedPlan) {
      const { name, price } = selectedPlan
      if (name === multipleKey) {
        priceTemp = Number(price?.unitAmount)
      }
      priceTemp = (quota - deduction) * Number(price?.unitAmount || 0)
    }

    const priceLabel =
      priceTemp > 0
        ? `${getCurrencyPrefix(selectedPlan?.price?.currency)}${formatCurrency(
            priceTemp,
            selectedPlan?.price?.currency || 'usd'
          )}`
        : 'FREE'
    return {
      price: priceTemp,
      label: priceLabel,
    }
  }, [selectedPlan, quota, multipleKey, deduction])

  const totalPriceCange = useMemo(() => {
    const diff = totalPrice.price - currentPlanPrice
    return {
      diff,
      label: `${getCurrencyPrefix(
        selectedPlan?.price?.currency
      )}${formatCurrency(diff, currentPlan.price?.currency || 'usd')} change`,
    }
  }, [
    totalPrice.price,
    currentPlanPrice,
    selectedPlan?.price?.currency,
    currentPlan.price?.currency,
  ])

  const handleProceed = () => {
    const actionType = totalPriceCange.diff < 0 ? 'downgrade' : 'upgrade'
    if (selectedPlan) {
      const paylod: NewPlanPayload[] = [
        {
          planId: actionType === 'upgrade' ? selectedPlan.id : currentPlan.id,
          targetedPlans: selectedPlan,
          planQuantity: quota,
        },
      ]
      onProceed({
        actionType,
        targetTotalPrice: totalPrice.price,
        targetTotalPriceLabel: totalPrice.label,
        targetedPlans: paylod,
      })
    }
  }

  useEffect(() => {
    const planName = findSelectedKey(quota)
    const plan = availablePlans.find(item => item.name === planName)
    if (plan) {
      setSelectedPlan(plan)
    } else {
      setSelectedPlan(currentPlan)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availablePlans, quota])

  return (
    <>
      <DialogBody>
        <DialogDescription className="mb-6 text-gray-600">
          {t('subscription:planType.counterPlanDesc')}
        </DialogDescription>
        <Card className="p-5 bg-gray-50 border-gray-200 shadow-none">
          <div className="flex items-center gap-3 mb-4">
            <FiUsers
              size={45}
              className="bg-blue-100 text-blue-500 p-2 rounded-lg"
            />
            <div>
              <div className="text-sm font-semibold">{title}</div>
              <div className="text-sm text-gray-600">{desc}</div>
            </div>
            <div className="text-sm font-medium ml-auto text-gray-600">
              {pricePerUnit.label}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                className="border-gray-200 font-semibold"
                onClick={() => {
                  const newQuota = quota - 1
                  if (newQuota > 0) {
                    setQuota(newQuota)
                  }
                }}
              >
                -
              </Button>
              <div className="text-center w-14">
                <div className="font-semibold text-lg">{quota}</div>
                <div className="text-sm text-gray-600">{rangeLabel}</div>
              </div>
              <Button
                variant="outline"
                className="border-gray-200 font-semibold"
                onClick={() => setQuota(quota + 1)}
              >
                +
              </Button>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold">{totalPrice.label}</div>
              <div className="text-sm text-gray-600">
                {t('subscription:total')}
              </div>
            </div>
          </div>
        </Card>
      </DialogBody>
      <DialogFooter className="flex items-center bg-white justify-between border-t border-gray-300">
        <div>
          <div className="text-sm font-medium text-gray-600">
            {t('subscription:totalPrice')}
          </div>
          <div className="text-2xl font-medium">{totalPrice.label}</div>
          <div className="text-red-600 text-sm font-medium">
            {totalPriceCange.label}
          </div>
        </div>
        <div>
          <Button
            disabled={totalPriceCange.diff === 0}
            iconAfter={<FaArrowRight />}
            onClick={() => handleProceed()}
          >
            {t('subscription:actions.proceedReview')}
          </Button>
        </div>
      </DialogFooter>
    </>
  )
}

export default DialogModifyCount
