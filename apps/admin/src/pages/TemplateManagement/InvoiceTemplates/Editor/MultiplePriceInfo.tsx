import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/Badge'
import useInvoiceSummary from '@/hooks/useInvoiceSummary'
import useSiteData from '@/hooks/useSiteData'
import { PriceOption } from '@/types/regularClass'
import { formatCurrency } from '@/utils/currency'

const MultiplePriceInfo = (): JSX.Element => {
  const { currency } = useSiteData()
  const { t } = useTranslation(['invoiceCampaign'])
  const {
    minRecurringCount,
    maxRecurringCount,
    priceOptions,
    selectedPrice,
    setManuallySelectedPrice,
  } = useInvoiceSummary()

  const handlePriceOptionClick = (option: PriceOption) => {
    setManuallySelectedPrice(option)
  }

  return (
    <div className="border border-gray-200 shadow-sm bg-background p-2 rounded-md gap-2 flex flex-col">
      <div className="flex flex-row justify-start gap-4 w-full items-center">
        <h2 className="text-sm font-medium">
          {t('editor.multiplePrices.priceOptions')}
        </h2>
        <p className="text-text-subtle text-xs">
          {t('editor.multiplePrices.min', {
            count: minRecurringCount,
          })}
        </p>
        <p className="text-text-subtle text-xs">
          {t('editor.multiplePrices.max', {
            count: maxRecurringCount,
          })}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {priceOptions.map(option => (
          <Badge
            variant={
              selectedPrice?.id === option.id ? 'default-outline' : 'light'
            }
            key={option.id}
            onClick={() => handlePriceOptionClick(option)}
            className="cursor-pointer hover:bg-gray-100 transition-colors"
          >
            {`${
              option.numberOfLessons !== 0
                ? `${option.numberOfLessons}: `
                : `${minRecurringCount}: `
            }${formatCurrency(
              +option.amount / (option?.numberOfLessons || 1),
              currency
            )}`}
          </Badge>
        ))}
      </div>
    </div>
  )
}

export default MultiplePriceInfo
