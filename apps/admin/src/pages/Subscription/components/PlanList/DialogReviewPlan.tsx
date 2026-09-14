import { useEffect, useMemo } from 'react'

import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { FaArrowLeft } from 'react-icons/fa'
import { FiAlertCircle } from 'react-icons/fi'
import { LuDot } from 'react-icons/lu'

import Skeleton from 'react-loading-skeleton'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Separator } from '@/components/ui/Separator'
import usePlanData from '@/hooks/useSubscriptionPlanData'
import {
  NewPlanPayload,
  SubscriptionRecordPlan,
  SubscriptionReview,
} from '@/types/schoolSubscriptionPlan'
import { formatCurrency, getCurrencyPrefix } from '@/utils/currency'

interface Props {
  open: boolean
  nextBillingDate: string
  currentPlan: SubscriptionRecordPlan
  changes: SubscriptionReview
  onClose: () => void
  onBackToPlan: () => void
  onSubmitted: () => void
}

const modifyByCountPlan = [
  'MULTIPLE_SCHOOL',
  'MULTIPLE_ADMIN',
  'MULTIPLE_TUTOR',
]

const counterPlanDeduction = {
  MULTIPLE_SCHOOL: 1,
  MULTIPLE_TUTOR: 2,
  MULTIPLE_ADMIN: 3,
}

const DialogReviewPlan: React.FC<Props> = ({
  open,
  nextBillingDate,
  currentPlan,
  changes,
  onClose,
  onBackToPlan,
  onSubmitted,
}): JSX.Element => {
  const { t } = useTranslation()
  const {
    useGetPreviewUpgradePlan,
    useUpgradeSubscriptionPlan,
    useDowngradeSubscriptionPlan,
    useSubstituteSubscriptionPlan,
  } = usePlanData()
  const actionType = changes.actionType || 'upgrade'

  const formatCalculatedPrice = (
    price: number | undefined,
    currency: string | undefined
  ): string => {
    const curr = currency || 'hkd'
    return `${getCurrencyPrefix(curr)}${formatCurrency(price || 0, curr)}`
  }

  const currentPlanInfo = useMemo(() => {
    const { type, name, price, qty } = currentPlan
    const isModifyByCount = modifyByCountPlan.indexOf(type) >= 0

    let totalPrice = 0
    let totalPriceLabel = 'FREE'
    const label = isModifyByCount
      ? `${qty} ${t(`subscription:stripeProduct.${type}`)}`
      : t(`subscription:stripeProduct.${name}`)

    if (price) {
      const { currency, unitAmount } = price
      if (isModifyByCount) {
        totalPrice =
          (qty - counterPlanDeduction[type]) * Number(unitAmount || 0)
      } else {
        totalPrice = Number(unitAmount || 0)
      }

      if (totalPrice > 0) {
        totalPriceLabel = formatCalculatedPrice(totalPrice, currency)
      }
    }

    return {
      label,
      totalPrice,
      totalPriceLabel,
    }
  }, [currentPlan, t])

  const upgradingToInfo = useMemo(() => {
    const labels: string[] = []
    const { targetTotalPrice, targetTotalPriceLabel, targetedPlans } = changes

    targetedPlans.forEach(plan => {
      const { targetedPlans: targeted } = plan
      if (targeted?.name !== currentPlan.name) {
        labels.push(t(`subscription:stripeProduct.${targeted?.name}`))
      }
    })

    let stringLabel: string | number = ''
    if (
      modifyByCountPlan.indexOf(targetedPlans[0].targetedPlans?.type || '') >= 0
    ) {
      stringLabel = `${targetedPlans[0].planQuantity} ${t(
        `subscription:stripeProduct.${targetedPlans[0].targetedPlans?.type}`
      )}`
    } else {
      stringLabel = labels.join(', ')
    }

    return {
      label: stringLabel,
      price: targetTotalPrice,
      priceLabel: targetTotalPriceLabel,
    }
  }, [currentPlan.name, changes, t])

  const payload = useMemo(() => {
    const { targetedPlans } = changes
    const newPlans: NewPlanPayload[] = []
    if (targetedPlans && targetedPlans.length > 0) {
      targetedPlans.forEach(item => {
        newPlans.push({
          planId: item.planId,
          priceId: item.priceId,
          planQuantity: item.planQuantity,
        })
      })
    }
    return {
      interval: 'year',
      newPlans,
    }
  }, [changes])

  const {
    data: upgradeCalculation,
    isFetching: isLoadingProrationInfo,
    refetch: fetchProrationInfo,
  } = useGetPreviewUpgradePlan(payload)

  const { isLoading: isUpgradingPlan, mutateAsync: upgradePlan } =
    useUpgradeSubscriptionPlan(data => {
      const { status } = data
      if (status === 'payment_required') {
        const { checkoutUrl } = data
        if (checkoutUrl) {
          window.location.replace(checkoutUrl)
        }
      } else {
        onSubmitted()
      }
    })

  const { isLoading: isDowngradingPlan, mutateAsync: downGradePlan } =
    useDowngradeSubscriptionPlan(onSubmitted)

  const { mutateAsync: substitutePlan, isLoading: isSubstitutingPlan } =
    useSubstituteSubscriptionPlan(() => {
      onSubmitted()
    })
  const substitutePayload = useMemo(() => {
    return {
      targetPlanId: changes.targetedPlans[0].targetedPlans?.id || 0,
      currentPlanId: currentPlan.id,
    }
  }, [changes, currentPlan.id])
  const handleSubmission = async () => {
    switch (actionType) {
      case 'upgrade':
        await upgradePlan(payload)
        break
      case 'downgrade':
        await downGradePlan(payload)
        break
      case 'substitute':
        await substitutePlan(substitutePayload)
        break
      default:
        break
    }
  }

  useEffect(() => {
    if (actionType === 'upgrade') {
      fetchProrationInfo()
    }
  }, [actionType, fetchProrationInfo])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="lg:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{t('subscription:reviewChanges')}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <DialogDescription />
          <div className="flex items-center gap-3">
            <Card className="w-1/2 p-5 rounded-lg shadow-none border-gray-300">
              <div className="text-gray-600 text-sm font-medium mb-2">
                {t('subscription:subscriptionDetail.currentPlan')}
              </div>
              <div className="text-lg text-gray-900 font-medium">
                {currentPlanInfo.label}
              </div>
              <div className="text-sm font-medium text-gray-600">
                {currentPlanInfo.totalPriceLabel}
              </div>
            </Card>
            <Card className="w-1/2 p-5 rounded-lg bg-blue-50 shadow-none border-2 border-blue-400">
              <div className="text-blue-600 text-sm font-medium mb-2 capitalize">
                {t(`subscription:actionType.${actionType}`)}
              </div>
              <div className="text-lg text-blue-900 font-medium">
                {upgradingToInfo.label}
              </div>
              <div className="text-sm font-medium text-gray-600">
                {upgradingToInfo.priceLabel}
              </div>
            </Card>
          </div>
          {actionType === 'upgrade' && (
            <>
              <Card className="p-5 mt-8 rounded-lg shadow-none border border-gray-200 bg-gray-50">
                <div className="font-medium mb-4">
                  {t('subscription:addPlan.billDetail')}
                </div>
                {isLoadingProrationInfo ? (
                  <>
                    <Skeleton className="bg-gray-200 h-4" />
                    <Skeleton className="bg-gray-200 h-4 mb-3 mt-2" />
                  </>
                ) : (
                  <>
                    <div className="text-sm flex items-center justify-between">
                      <div className="text-gray-600">
                        {t('subscription:prorateAmountLabel', {
                          days: upgradeCalculation?.daysRemaining,
                        })}
                      </div>
                      <div className="font-medium">
                        {formatCalculatedPrice(
                          upgradeCalculation?.proRatedAmount,
                          currentPlan.price?.currency
                        )}
                      </div>
                    </div>
                    <div className="text-sm mt-1 mb-2 flex items-center justify-between">
                      <div className="text-gray-600">
                        {t('subscription:nextRenewalDate', {
                          date: dayjs(
                            upgradeCalculation?.currentCycleEndDate
                          ).format('MMMM DD, YYYY'),
                        })}
                      </div>
                      <div className="font-medium">
                        {formatCalculatedPrice(
                          upgradeCalculation?.stripeProrationDetails
                            .nextInvoiceAmount,
                          currentPlan.price?.currency
                        )}
                      </div>
                    </div>
                  </>
                )}
                <Separator className="bg-gray-200" />
                {isLoadingProrationInfo ? (
                  <div className="flex items-center justify-between">
                    <Skeleton className="bg-gray-200 h-4 mb-3 mt-2 w-56" />
                    <Skeleton className="bg-gray-200 h-4 mb-3 mt-2 w-20" />
                  </div>
                ) : (
                  <div className="font-medium my-1 flex items-center justify-between">
                    <div className="text-gray-900">
                      {t(`subscription:addPlan.amountDueToday`)}
                    </div>
                    <div className="font-medium text-lg text-blue-700">
                      {formatCalculatedPrice(
                        upgradeCalculation?.proRatedAmount,
                        currentPlan.price?.currency
                      )}
                    </div>
                  </div>
                )}
              </Card>
              <div className="bg-yellow-50 mt-8 border-yellow-200 border rounded-sm p-4">
                <div className="flex items-start gap-2">
                  <FiAlertCircle size={20} className="text-yellow-800" />
                  <div>
                    <div className="text-yellow-800 font-medium mb-2">
                      {t(`subscription:importantNote.title`)}
                    </div>
                    <div className="text-sm flex flex-col gap-1 text-yellow-700">
                      <div className="flex items-center gap-1">
                        <LuDot size={25} />
                        {t(`subscription:importantNote.updatedImmediately`)}
                      </div>
                      <div className="flex items-center gap-1">
                        <LuDot size={25} />
                        {t(`subscription:importantNote.proratedAmountCover`)}
                      </div>
                      <div className="flex items-center gap-1">
                        <LuDot size={25} />
                        {t(`subscription:importantNote.futureRenewal`)}
                      </div>
                      <div className="flex items-center gap-1">
                        <LuDot size={25} />
                        {t(`subscription:importantNote.downGradeAnytime`)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          {actionType === 'downgrade' && (
            <div className="bg-yellow-50 mt-8 border-yellow-200 border rounded-sm p-4">
              <div className="flex items-start gap-2">
                <FiAlertCircle size={20} className="text-yellow-800" />
                <div>
                  <div className="text-yellow-800 font-medium mb-2">
                    {t(`subscription:importantNote.title`)}
                  </div>
                  <div className="text-sm flex flex-col gap-1 text-yellow-700">
                    <div className="flex items-center gap-1">
                      <LuDot size={25} />
                      {t(`subscription:importantNote.downGradeEffectiveOn`, {
                        nextBillingDate,
                      })}
                    </div>
                    <div className="flex items-center gap-1">
                      <LuDot size={25} />
                      {t(`subscription:importantNote.cancelDownGrade`)}
                    </div>
                    <div className="flex items-center gap-1">
                      <LuDot size={25} />
                      {t(`subscription:importantNote.upgradeBack`)}
                    </div>
                    <div className="flex items-center gap-1">
                      <LuDot size={25} />
                      {t(`subscription:importantNote.noRefund`)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {actionType === 'substitute' && (
            <div className="bg-yellow-50 mt-8 border-yellow-200 border rounded-sm p-4">
              <div className="flex items-start gap-2">
                <FiAlertCircle size={20} className="text-yellow-800" />
                <div>
                  <div className="text-yellow-800 font-medium mb-2">
                    {t(`subscription:importantNote.title`)}
                  </div>
                  <div className="text-sm flex flex-col gap-1 text-yellow-700">
                    <div className="flex items-center gap-1">
                      <LuDot size={25} />
                      {t(`subscription:importantNote.noPaymentRequired`)}
                    </div>
                    <div className="flex items-center gap-1">
                      <LuDot size={25} />
                      {t(`subscription:importantNote.switchBack`)}
                    </div>
                    <div className="flex items-center gap-1">
                      <LuDot size={25} />
                      {t(`subscription:importantNote.renewalReamins`, {
                        nextBillingDate,
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 my-8">
            <Button
              variant="outline"
              iconBefore={<FaArrowLeft />}
              onClick={() => onBackToPlan()}
            >
              {t(`subscription:actions.backToPlans`)}
            </Button>
            <Button
              className="w-full"
              onClick={() => handleSubmission()}
              loading={
                isUpgradingPlan ||
                isLoadingProrationInfo ||
                isDowngradingPlan ||
                isSubstitutingPlan
              }
            >
              {t(`subscription:actions.${actionType}`)}
            </Button>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}

export default DialogReviewPlan
