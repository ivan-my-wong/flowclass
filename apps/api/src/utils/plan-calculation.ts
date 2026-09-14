import { StripeProductPricesEntity } from '@/models/stripe-product-prices.entity'
import { PlanPriceMode, PlanType, SubscriptionPlan } from '@/models/subscription-plans.entity'

export const validateCalculatePlanPriceParams = (
  plan: SubscriptionPlan | undefined,
  price: StripeProductPricesEntity | undefined,
  qty: number
) => {
  if (!plan || !price) {
    throw new Error('Missing required parameters: plan, price, or quantity')
  }
  if (qty < 1) {
    throw new Error('Quantity must be at least 1')
  }
}
/***
 * Finds the deducted value for a specific plan type
 * @param plans - Array of subscription plans, recommended to be already filtered by priceMode PER_ITEM
 * @param plan - The plan to find the deducted value for
 * @returns The deducted value for the specified plan type, or 0 if not found
 */
export const findDeductedByValue = (
  plans: SubscriptionPlan[],
  plan: SubscriptionPlan
): {
  deductedBy: number
  plans: SubscriptionPlan[]
} => {
  const { type: planType } = plan
  const isUnlimited = plan.name.includes('UNLIMITED')
  if (isUnlimited) {
    return { deductedBy: 0, plans: [] }
  }
  const isSpecialPlanType = [PlanType.BASE_USER, PlanType.NOTIFICATION_CHANNEL].includes(planType)
  const filteredPlans = plans.filter((plan) => {
    if (plan.type !== planType) return false
    if (isSpecialPlanType) return true
    return plan.priceMode === PlanPriceMode.PER_ITEM && plan.typeQuantity != null
  })

  if (filteredPlans.length === 0) {
    return {
      deductedBy: 0,
      plans: [],
    }
  }
  const deductedBy = filteredPlans
    .map((d) => d.typeQuota)
    .reduce((acc, current) => Math.min(acc, current), Infinity)
  return {
    deductedBy: deductedBy || 0,
    plans: filteredPlans,
  }
}
/**
 * Finds the target plan and price based on the deducted quantity
 * @param plans - Array of subscription plans, recommended to be already filtered by priceMode PER_ITEM
 * @param deductedBy - The quantity to deduct from the plan
 * @param price - The Stripe price entity with unitAmount
 * @returns An object containing the target plan and target price, or undefined if not found
 */
const findTargetPlan = (
  plans: SubscriptionPlan[],
  qty: number,
  price: StripeProductPricesEntity
) => {
  const targetPlan = plans.sort((a, b) => a.typeQuota - b.typeQuota).find((p) => p.typeQuota >= qty)
  const targetPrice = targetPlan?.stripeProductPrices?.find(
    (p) => p.currency === price.currency && p.interval === price.interval
  )
  return {
    targetPlan,
    targetPrice,
  }
}
/**
 * Calculates the total price and effective quantity for a subscription plan
 * @param relatedPlans - Array of subscription plans, recommended to be already filtered by price mode PER_ITEM
 * @param plan - The subscription plan entity
 * @param price - The Stripe price entity with unitAmount
 * @param qty - The requested quantity (must be >= 1)
 * @returns Object containing totalPrice and effective quantity
 * @throws Error when quantity is less than 1 or required parameters are missing
 */
export const calculatePlanPrice = (
  relatedPlans: SubscriptionPlan[],
  plan: SubscriptionPlan,
  price: StripeProductPricesEntity,
  qty: number
): {
  totalPrice: number
  qty: number
  metadata?: Record<string, any>
  deductedBy?: number
} => {
  validateCalculatePlanPriceParams(plan, price, qty)
  const { deductedBy, plans } = findDeductedByValue(relatedPlans, plan)
  let unitAmount = price.unitAmount
  const metadata: Record<string, any> = {
    planId: plan.id,
    priceId: price.stripePriceId,
    productId: price.stripeProductId,
    planType: plan.type,
    planName: plan.name,
    lookupKey: price.lookupKey,
  }
  if (plan.type === 'SETUP_FEE') {
    return {
      totalPrice: Number(unitAmount) || 0,
      qty,
      metadata,
      deductedBy: 0,
    }
  }

  const deduction = Math.max(1, qty - deductedBy)
  const { targetPlan, targetPrice } = findTargetPlan(plans, deduction, price)
  if (targetPlan && targetPrice) {
    metadata.planId = targetPlan.id
    metadata.priceId = targetPrice.stripePriceId
    metadata.productId = targetPrice.stripeProductId
    metadata.planType = targetPlan.type
    metadata.planName = targetPlan.name
    metadata.lookupKey = targetPrice.lookupKey
    unitAmount = targetPrice.unitAmount
  }
  return {
    totalPrice: (Number(unitAmount) || 0) * deduction,
    qty: deduction,
    deductedBy,
    metadata,
  }
}
