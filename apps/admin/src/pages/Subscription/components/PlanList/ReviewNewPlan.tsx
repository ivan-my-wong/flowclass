import { useMemo } from 'react'

import { useTranslation } from 'react-i18next'
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'
import { FiAlertCircle } from 'react-icons/fi'
import { LuDot } from 'react-icons/lu'

import Skeleton from 'react-loading-skeleton'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Separator } from '@/components/ui/Separator'
import usePlanData from '@/hooks/useSubscriptionPlanData'
import {
  AddPlansSubscriptionPayload,
  SubscriptionRecordPlan,
} from '@/types/schoolSubscriptionPlan'
import { formatCurrency, getCurrencyPrefix } from '@/utils/currency'

interface Props {
  selectedPlans: SubscriptionRecordPlan[]
  onBack: () => void
  onSubmitted: () => void
}

const ReviewNewPlan: React.FC<Props> = ({
  selectedPlans,
  onBack,
  onSubmitted,
}): JSX.Element => {
  const { t } = useTranslation()
  const { useGetNewPlanSubscriptionPreview, useAddNewSubscriptionPlan } =
    usePlanData()

  const payload = useMemo((): AddPlansSubscriptionPayload => {
    const planIds = selectedPlans.map(item => item.id)
    return {
      planIds,
    }
  }, [selectedPlans])

  const {
    data,
    isFetching: isLoadingPreview,
    isFetched,
  } = useGetNewPlanSubscriptionPreview(payload)

  const previewDetail = useMemo(() => {
    if (data) {
      const { proRatedAmount, stripeProrationDetails, daysRemaining } = data
      const currencyPrefix = getCurrencyPrefix('hkd')
      const chargeLabel = `${currencyPrefix}${formatCurrency(
        stripeProrationDetails.charges,
        'hkd'
      )}`
      const creditsLabel = `${currencyPrefix}${formatCurrency(
        stripeProrationDetails.credits,
        'hkd'
      )}`
      const prorationLabel = `${currencyPrefix}${formatCurrency(
        proRatedAmount,
        'hkd'
      )}`

      return { chargeLabel, creditsLabel, prorationLabel, daysRemaining }
    }
    return null
  }, [data])

  const { isLoading: isAddingNewPlan, mutateAsync: addNewPlan } =
    useAddNewSubscriptionPlan(data => {
      const { status } = data
      if (status === 'payment_required') {
        const { checkoutUrl } = data
        if (checkoutUrl && checkoutUrl !== '') {
          window.location.replace(checkoutUrl)
          // window.open(checkoutUrl, '_blank')
        }
      } else {
        onSubmitted()
      }
    })

  const handleSubmission = () => {
    addNewPlan(payload)
  }

  return (
    <>
      <Button
        variant="ghost"
        className="flex pl-0 mb-4 items-center gap-2 text-blue-600 cursor-pointer"
        onClick={() => onBack()}
      >
        <FaArrowLeft />
        {t('subscription:addPlan.btnBackToPlan')}
      </Button>
      <div className="font-semibold mb-1">
        {t('subscription:addPlan.reviewPlanSelections')}
      </div>
      <Card className="p-5 mt-3 rounded-lg shadow-none border border-gray-200 bg-gray-50">
        <div className="font-medium mb-4">
          {t('subscription:addPlan.billDetail')}
        </div>
        {isLoadingPreview && (
          <>
            <Skeleton className="bg-gray-200 h-4" />
            <Skeleton className="bg-gray-200 h-4 mt-2" />
            <Separator className="bg-gray-200 mt-2" />
            <div className="flex items-center justify-between">
              <Skeleton className="bg-gray-200 h-4 mb-3 mt-2 w-56" />
              <Skeleton className="bg-gray-200 h-4 mb-3 mt-2 w-20" />
            </div>
          </>
        )}
        {isFetched && !isLoadingPreview && (
          <>
            <div className="text-sm flex items-center justify-between">
              <div className="text-gray-600">
                {t(`subscription:prorateAmountLabel`, {
                  days: previewDetail?.daysRemaining,
                })}
              </div>
              <div className="font-medium">{previewDetail?.chargeLabel}</div>
            </div>
            <div className="text-sm flex items-center justify-between">
              <div className="text-gray-600">
                {t(`subscription:addPlan.creditBalance`)}
              </div>
              <div className="font-medium">{previewDetail?.creditsLabel}</div>
            </div>
            <Separator className="bg-gray-200 mt-2" />
            <div className="font-medium my-1 flex items-center justify-between">
              <div className="text-gray-900">
                {t(`subscription:addPlan.amountDueToday`)}
              </div>
              <div className="font-medium text-lg text-blue-700">
                {previewDetail?.prorationLabel}
              </div>
            </div>
          </>
        )}
      </Card>
      <div className="bg-yellow-50 my-8 border-yellow-200 border rounded-sm p-4">
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
      <div className="flex items-center justify-between pt-3 border-t border-gray-300 sticky z-10 bottom-0 bg-white">
        <div>
          <div className="text-sm font-medium text-gray-600">
            {t(`subscription:totalPrice`)}
          </div>
          {isLoadingPreview ? (
            <Skeleton className="bg-gray-200 h-8 w-24" />
          ) : (
            <div className="text-2xl font-semibold text-primary">
              {previewDetail?.prorationLabel}
            </div>
          )}
        </div>
        <Button
          iconAfter={<FaArrowRight />}
          disabled={isLoadingPreview}
          loading={isAddingNewPlan}
          onClick={() => handleSubmission()}
        >
          {t(`subscription:actions.proceedPayment`)}
        </Button>
      </div>
    </>
  )
}

export default ReviewNewPlan
