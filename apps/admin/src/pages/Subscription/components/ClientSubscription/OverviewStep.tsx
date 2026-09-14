import { useEffect, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { BsCart2 } from 'react-icons/bs'
import { FaArrowRight } from 'react-icons/fa'
import { LuPencilLine } from 'react-icons/lu'
import { useRecoilValue } from 'recoil'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Separator } from '@/components/ui/Separator'
import useSchoolData from '@/hooks/useSchoolData'
import useSubscriptionPlanData from '@/hooks/useSubscriptionPlanData'
import { siteState } from '@/stores/siteData'
import {
  ClientSubscriptionPayload,
  ClientSubscriptionPlanRecord,
  SubscriptionOverviewT,
} from '@/types/schoolSubscriptionPlan'
import { formatCurrency, getCurrencyPrefix } from '@/utils/currency'
import { msSleep } from '@/utils/misc'

import { PlanOverviewRecord } from '../../SubscriptionFlows/ClientSubscriptionPlan'

interface Props {
  allSteps: string[]
  overview: PlanOverviewRecord
  overviewSetup?: SubscriptionOverviewT
  overviewList: PlanOverviewRecord
  allStepAnnual: { total: number; currency: string }
  onEmitEditStep: (stepToEdit: number) => void
}

const OverviewStep: React.FC<Props> = ({
  allSteps,
  overview,
  overviewSetup,
  overviewList,
  allStepAnnual,
  onEmitEditStep,
}): JSX.Element => {
  const { t } = useTranslation()
  const siteData = useRecoilValue(siteState)
  const { currentSchool } = useSchoolData()
  const [isValid, setIsValid] = useState<boolean>(false)
  const [plans, setPlans] = useState<ClientSubscriptionPlanRecord[]>([])

  const { useCreateClientSubscriptionRecord } = useSubscriptionPlanData()
  const institutionId = currentSchool?.id || 0
  const { mutate: submitSubscriptionPlan, isLoading: isCreatingPlan } =
    useCreateClientSubscriptionRecord(async data => {
      await msSleep(1500)
      if (data.checkoutUrl) {
        window.location.replace(data.checkoutUrl)
      }
    })

  const handleSubmission = () => {
    const payload: ClientSubscriptionPayload = {
      institutionId,
      siteId: siteData.currentSite?.id || 0,
      plans,
    }
    submitSubscriptionPlan(payload)
  }

  const formatPriceLabel = (price: number, currency: string): string => {
    const currTemp = currency || 'hkd'
    return `${getCurrencyPrefix(currTemp)}${formatCurrency(price, currTemp)}`
  }

  useEffect(() => {
    let isValidTemp = true
    let totalStep = 0
    const planIds: ClientSubscriptionPlanRecord[] = []

    if (overview) {
      Object.entries(overview).forEach(([_, value]) => {
        totalStep += 1
        const {
          stepValid: isStepValid,
          planId,
          count,
          category,
        } = value as SubscriptionOverviewT

        const planIdArray = Array.isArray(planId) ? planId : [planId]
        planIdArray.forEach(id => {
          if (id > 0) {
            planIds.push({
              category,
              planId: id,
              planQuantity: count || 1,
              interval: 'year',
            })
          }
        })

        if (!isStepValid) {
          isValidTemp = false
        }
      })
    }

    setPlans(planIds)
    setIsValid(isValidTemp && totalStep === allSteps.length - 1)
  }, [overview, allSteps])

  return (
    <>
      <div className="text-xl font-medium text-left mb-1">
        {t(`subscription:client.overview.reviewPackage`)}
      </div>
      <div className="text-sm mb-4 text-gray-700">
        {t(`subscription:client.overview.reviewSelection`)}
      </div>
      <Card className="rounded-lg shadow-none border-gray-200 pt-4">
        {Object.entries(overviewList).map(([key, value], index) => (
          <div className="px-4" key={key}>
            <div className="flex justify-between text-sm mb-2">
              <div className="flex items-center gap-3">
                <Button
                  variant="destructive"
                  className="text-xs h-6 bg-blue-50 text-blue-500 border border-blue-500 hover:bg-blue-100"
                  iconBefore={<LuPencilLine />}
                  onClick={() => onEmitEditStep(value.stepIndex)}
                  aria-label={`Edit ${value.label}`}
                >
                  {t(`common:action.edit`)}
                </Button>
                <div className="text-gray-800">{value.label}</div>
              </div>
              <div className="font-medium text-gray-900">
                {formatPriceLabel(value.annual, value.currency)}
              </div>
            </div>
            {index !== Object.entries(overviewList).length - 1 && (
              <Separator className="bg-gray-200 my-4" />
            )}
          </div>
        ))}
        <Separator className="bg-gray-200 mt-5" />
        <div className="bg-gray-50 px-4 py-4">
          <div className="flex items-center justify-between text-sm font-medium text-gray-900">
            <div>{t(`subscription:client.subtotal`)}</div>
            <div>
              {formatPriceLabel(allStepAnnual.total, allStepAnnual.currency)}
            </div>
          </div>
          {overviewSetup && overviewSetup.annual > 0 && (
            <>
              <Separator className="bg-gray-200 my-4" />
              <div className="flex items-center justify-between text-sm font-medium text-gray-900">
                <div>{t(`subscription:client.setupFeeOneTime`)}</div>
                <div>
                  {formatPriceLabel(
                    overviewSetup.annual,
                    overviewSetup.currency
                  )}
                </div>
              </div>
            </>
          )}
          <Separator className="bg-gray-200 mb-2 mt-4" />
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-medium text-blue-700">
                {t(`subscription:client.total`)}
              </div>
              <div className="text-sm text-blue-500">
                {t(`subscription:client.firstYearSetup`)}
              </div>
            </div>
            <div className="text-xl font-semibold text-blue-700">
              {formatPriceLabel(
                (overviewSetup?.annual || 0) + allStepAnnual.total,
                allStepAnnual.currency
              )}
            </div>
          </div>
        </div>
      </Card>
      <Button
        iconBefore={<BsCart2 size={22} />}
        iconAfter={<FaArrowRight />}
        className="w-full my-6"
        disabled={!isValid}
        onClick={handleSubmission}
        loading={isCreatingPlan}
      >
        <div>{t(`subscription:client.proceedPayment`)}</div>
      </Button>
    </>
  )
}

export default OverviewStep
