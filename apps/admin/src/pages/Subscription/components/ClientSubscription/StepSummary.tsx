import { useTranslation } from 'react-i18next'
import { MdInfoOutline } from 'react-icons/md'

import { Card } from '@/components/ui/Card'
import { Separator } from '@/components/ui/Separator'
import { SubscriptionOverviewT } from '@/types/schoolSubscriptionPlan'
import { formatCurrency, getCurrencyPrefix } from '@/utils/currency'

import { PlanOverviewRecord } from '../../SubscriptionFlows/ClientSubscriptionPlan'

interface Props {
  overviewSetup?: SubscriptionOverviewT
  overviewList: PlanOverviewRecord
  allStepAnnual: { total: number; currency: string }
}
const StepSummary: React.FC<Props> = ({
  overviewList,
  overviewSetup,
  allStepAnnual,
}): JSX.Element => {
  const { t } = useTranslation()

  const formatPrice = (amount: number, currency: string) =>
    `${getCurrencyPrefix(currency)}${formatCurrency(amount, currency)}`

  return (
    <Card className="w-full lg:w-[900px] rounded-lg shadow-none p-4 mx-auto">
      <div className="font-medium text-lg mb-3">
        {t(`subscription:client.priceSummary`)}
      </div>
      {Object.entries(overviewList).map(([key, value]) => (
        <div key={key} className="flex justify-between text-sm mb-3">
          <div className="w-1/6 text-gray-600 font-medium">
            {value.category}
          </div>
          <div className="w-2/6 text-gray-600">{value.label}</div>
          <div className="w-3/6 text-right font-medium text-gray-800">
            {formatPrice(value.annual, value.currency)}
          </div>
        </div>
      ))}
      <Separator className="bg-gray-200 mb-3 mt-5" />
      <div className="flex items-center justify-between text-sm">
        <div className="text-gray-600 font-medium">
          {t(`subscription:client.subTotal`)}
        </div>
        <div className="text-gray-800 font-medium">
          {formatPrice(allStepAnnual.total, allStepAnnual.currency)}
        </div>
      </div>
      {overviewSetup && overviewSetup.annual > 0 && (
        <>
          <Separator className="bg-gray-200 my-3" />
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-600 font-medium">
              {t(`subscription:client.setupFee`)}
            </div>
            <div className="text-gray-800 font-medium">
              {formatPrice(overviewSetup.annual, overviewSetup.currency)}
            </div>
          </div>
        </>
      )}

      <Separator className="bg-gray-200 my-3" />
      <div className="flex items-center justify-between text-lg font-medium text-blue-700">
        <div>{t(`subscription:client.total`)}</div>
        <div>
          {formatPrice(
            (overviewSetup?.annual || 0) + allStepAnnual.total,
            allStepAnnual.currency
          )}
        </div>
      </div>
      <Card className="bg-yellow-50 p-3 shadow-none rounded-sm mt-4 border-yellow-300">
        <div className="flex items-start gap-2">
          <MdInfoOutline size={22} />
          <div>
            <span className="text-sm font-semibold text-yellow-800">
              {t(`subscription:client.setupFeeReq`)}
            </span>
            <div className="text-sm text-yellow-700">
              {t(`subscription:client.setupFeeFirstInvoice`)}
            </div>
          </div>
        </div>
      </Card>
    </Card>
  )
}

export default StepSummary
