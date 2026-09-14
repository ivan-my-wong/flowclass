import { useMemo } from 'react'

import { ClientSubscriptionPlanT } from '@/types/schoolSubscriptionPlan'
import { formatCurrency, getCurrencyPrefix } from '@/utils/currency'

export const useSubscriptionStepPrice = (
  stepOptions: ClientSubscriptionPlanT[] | undefined,
  count: number,
  selectedKey: string,
  deductionAmount: number
) => {
  return useMemo(() => {
    const plan = stepOptions?.find(item => item.name === selectedKey)

    if (plan && count > 0) {
      const { stripeProduct } = plan
      const qtyAfterDeduction = selectedKey.includes('UNLIMITED')
        ? 1
        : count - deductionAmount

      const price =
        (Number(stripeProduct?.unitAmount || 0) || 0) * qtyAfterDeduction
      const currency = stripeProduct?.currency || 'usd'
      const priceLabel =
        price > 0
          ? `${getCurrencyPrefix(currency)}${formatCurrency(price, currency)}`
          : 'FREE'

      return {
        planId: plan.id,
        currency,
        price,
        priceLabel,
      }
    }

    return { planId: 0, currency: '', price: 0, priceLabel: 'FREE' }
  }, [stepOptions, count, selectedKey, deductionAmount])
}
