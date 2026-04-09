import { useMemo } from 'react'

import { useTranslation } from 'react-i18next'
import { BsCreditCard2Back } from 'react-icons/bs'

import { Separator } from '@/components/ui/Separator'
import { Switch } from '@/components/ui/Switch'
import useSiteData from '@/hooks/useSiteData'
import { useInvoiceEditorContext } from '@/pages/TemplateManagement/InvoiceTemplates/Editor/InvoiceEditorContext'
import { formatCurrency } from '@/utils/currency'

import { useContextInvoiceEditDialog } from './EditInvoiceContext'

const ApplyCreditBalance = (): JSX.Element => {
  const { t } = useTranslation('invoiceCampaign')
  const siteData = useSiteData()
  const { isViewOnly } = useInvoiceEditorContext()
  const {
    isPayByCredit,
    setPayByCredit,
    usedBalance,
    creditBalance,
    calculatedDiscount,
  } = useContextInvoiceEditDialog()
  const balanceCalculation = useMemo(() => {
    const remainingCredit = Math.max(creditBalance - usedBalance.value, 0)
    return { remainingCredit }
  }, [creditBalance, usedBalance])

  const amountAfterCreditUsage = useMemo(
    () =>
      Math.max(calculatedDiscount.priceAfterDiscount - usedBalance.value, 0),
    [calculatedDiscount.priceAfterDiscount, usedBalance]
  )

  return (
    <div className="border border-gray-300 rounded-lg mb-6 p-4">
      <div className="flex items-center gap-2">
        <BsCreditCard2Back size={20} />
        <div className="font-semibold">
          {t('invoice.applyCreditBalance.accountCredit')}
        </div>
        <Switch
          checked={isPayByCredit}
          onCheckedChange={setPayByCredit}
          className="ml-auto"
          disabled={isViewOnly || creditBalance <= 0}
          aria-label={t('invoice.applyCreditBalance.accountCredit') as string}
        />
      </div>
      <div className="space-y-2 text-sm mt-3">
        <div className="flex justify-between">
          <div>{t('invoice.applyCreditBalance.availableCredit')}</div>
          <div className="font-semibold">
            {formatCurrency(creditBalance, siteData.currency)}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>{t('invoice.applyCreditBalance.creditApplied')}</div>
          <div className="text-red-600 font-semibold">{usedBalance.label}</div>
        </div>
        <div className="flex items-center justify-between">
          <div>{t('invoice.applyCreditBalance.remainingCredit')}</div>
          <div className="font-semibold">
            {formatCurrency(
              balanceCalculation.remainingCredit,
              siteData.currency
            )}
          </div>
        </div>
        <Separator className="bg-gray-300" />
        <div className="flex items-center justify-between text-base font-medium">
          <div>{t('invoice.applyCreditBalance.amountToPay')}</div>
          <div className="font-semibold">
            {formatCurrency(amountAfterCreditUsage, siteData.currency)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApplyCreditBalance
