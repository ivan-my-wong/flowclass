import { FC, useCallback, useEffect, useMemo, useState } from 'react'

import DatePicker from 'react-datepicker'
import { useTranslation } from 'react-i18next'
import { LuSplit } from 'react-icons/lu'

import RadioButtonGroup from '@/components/RadioGroup/RadioButtonGroup'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Inputs/Input'
import { Separator } from '@/components/ui/Separator'
import useSiteData from '@/hooks/useSiteData'
import { DiscountType } from '@/types/coupon'
import {
  AppliedPromotion,
  InvoiceCampaignDetailDto,
  InvoiceSplit,
  InvoiceSplitType,
} from '@/types/studentInvoice.type'
import { formatCurrency } from '@/utils/currency'
import { addDate } from '@/utils/date.utils'

import { generateDefaultInvoiceInstallment } from './EditInvoiceContext'

const splitOptions = [
  'single',
  // 'dual-split',
  'custom-split',
]
type Props = {
  invoice: InvoiceCampaignDetailDto
  onChangeSplitType?: (type: InvoiceSplitType) => void
  onChangeInstallments?: (splits: InvoiceSplit[]) => void
  readOnly?: boolean
}
const SplitInvoice: FC<Props> = ({
  invoice,
  onChangeSplitType,
  onChangeInstallments,
  readOnly = false,
}): JSX.Element => {
  const { t } = useTranslation('invoiceCampaign')
  const siteData = useSiteData()
  const [invoiceSplitItems, setInvoiceSplitItems] = useState<InvoiceSplit[]>([])
  const halfInstallments = useMemo(() => {
    return [
      {
        ...generateDefaultInvoiceInstallment(),
        description: '1st installment',
        percentage: 50,
      },
      {
        ...generateDefaultInvoiceInstallment(),
        description: '2nd installment',
        percentage: 50,
        dueDate: addDate(new Date(), 7),
      },
    ]
  }, [])
  const customSplitInstallments = useMemo(() => {
    return [
      {
        ...generateDefaultInvoiceInstallment(),
        description: 'Installment 1',
        percentage: 0,
      },
    ]
  }, [])
  const usedSplitOptions = useMemo(() => {
    return splitOptions.map(item => {
      return {
        value: item,
        label: t(`invoice.installment.type.${item}`),
      }
    })
  }, [t])

  const totalPaymentAfterDiscount = useMemo(() => {
    const { discounts, total } = invoice

    let priceAfterDiscount = total ?? 0
    ;((discounts ?? []) as AppliedPromotion[]).forEach(disc => {
      const { amount, discountType } = disc
      if (discountType === DiscountType.FIXED_AMOUNT) {
        priceAfterDiscount -= Number(amount)
      } else {
        const discountAmount = (priceAfterDiscount * Number(amount)) / 100
        priceAfterDiscount -= discountAmount
      }
    })
    return Math.max(0, priceAfterDiscount)
  }, [invoice])

  const changeSplitItems = useCallback(
    (splitType: InvoiceSplitType) => {
      if (splitType === InvoiceSplitType.DUAL_SPLIT) {
        setInvoiceSplitItems(halfInstallments)
      } else if (splitType === InvoiceSplitType.CUSTOM_SPLIT) {
        setInvoiceSplitItems(customSplitInstallments)
      } else {
        setInvoiceSplitItems([])
      }
    },
    [customSplitInstallments, halfInstallments]
  )

  const updateSplit = (type: 'add' | 'subtract') => {
    setInvoiceSplitItems(prev => {
      if (type === 'add') {
        const dateOfLastSplitItem = prev[prev.length - 1].dueDate
        const newItem = { ...generateDefaultInvoiceInstallment() }
        newItem.dueDate = addDate(dateOfLastSplitItem, 7)
        const generatedSplitItem: InvoiceSplit = {
          ...newItem,
          description: `Installment ${prev.length + 1}`,
        }
        return [...prev, generatedSplitItem]
      }
      if (type === 'subtract' && prev.length > 1) {
        return prev.slice(0, -1)
      }
      return prev
    })
  }

  const updateInvoiceSplitItem = (
    index: number,
    key: string,
    value: string | Date
  ) => {
    const newSplitCount = [...invoiceSplitItems]
    const currentSplit = { ...invoiceSplitItems[index] }
    if (key === 'percentage') {
      const numberPercentage = Number(value)
      const totalPercentage = newSplitCount.reduce((sum, item, i) => {
        if (i === index) {
          return sum + numberPercentage
        }
        return sum + item.percentage
      }, 0)

      if (
        numberPercentage >= 1 &&
        numberPercentage <= 100 &&
        totalPercentage <= 100
      ) {
        currentSplit[key] = numberPercentage
      }
    } else {
      currentSplit[key] = value
    }
    newSplitCount[index] = currentSplit
    setInvoiceSplitItems(newSplitCount)
  }

  const getAmount = useCallback(
    (percentage: number) => {
      if (!invoice.total) return 0
      return (percentage / 100) * invoice.total
    },
    [invoice]
  )
  useEffect(() => {
    onChangeInstallments?.(invoiceSplitItems)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceSplitItems])

  return (
    <Card className="p-4 shadow-none border-gray-300 mb-6">
      <div className="flex items-center gap-2">
        <LuSplit size={20} />
        <div className="font-semibold">{t('invoice.installment.title')}</div>
      </div>
      <div className="mt-3">
        <RadioButtonGroup
          defaultValue={invoice.splitType ?? InvoiceSplitType.SINGLE}
          itemValues={usedSplitOptions}
          onValueChange={e => {
            onChangeSplitType?.(e as InvoiceSplitType)
            changeSplitItems(e as InvoiceSplitType)
          }}
          disabled={readOnly}
        />
      </div>
      {invoice.splitType === 'custom-split' && (
        <div className="mt-6">
          <div className="text-sm font-medium text-gray-800">
            {t('invoice.installment.customSplitTitle')}
          </div>
          <Separator className="bg-gray-300 mt-2" />
          <div className="p-4 mt-4 bg-blue-50 border border-blue-200 rounded-lg text-sm font-medium text-gray-800">
            {t('invoice.installment.remainingAmount', {
              amount: formatCurrency(
                totalPaymentAfterDiscount ?? 0,
                siteData.currency
              ),
            })}
          </div>
          <div className="flex items-center gap-5 my-3">
            <div className="text-sm text-gray-800 font-medium">
              {t('invoice.installment.numberOfInvoices')}
            </div>
            <Button
              className="ml-4 bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-full"
              disabled={invoiceSplitItems.length <= 1}
              onClick={() => updateSplit('subtract')}
            >
              -
            </Button>
            <div className="text-xl">{invoiceSplitItems.length}</div>
            <Button
              className="bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-full"
              onClick={() => updateSplit('add')}
            >
              +
            </Button>
          </div>
          <table className="w-full" cellPadding={6}>
            <thead className="text-sm text-gray-800">
              <tr>
                <th className="font-normal text-left">#</th>
                <th className="font-normal text-left !w-4/12">
                  {t('invoice.installment.description')}
                </th>
                <th className="font-normal text-left !w-4/12">
                  {t('invoice.installment.dueDate')}
                </th>
                <th className="font-normal text-left !w-2/12">
                  {t('invoice.installment.percentage')}
                </th>
                <th className="font-normal text-left !w-3/12">
                  {t('invoice.installment.amount')}
                </th>
              </tr>
            </thead>
            <tbody>
              {invoiceSplitItems.map((split, index) => (
                <tr key={split.dueDate.getTime()}>
                  <td>{index + 1}</td>
                  <td className="!w-4/12">
                    <Input
                      value={split.description}
                      className="border-gray-300 w-full"
                      placeholder={`${t(
                        'invoice.installment.descriptionPlaceholder'
                      )}`}
                      onChange={e =>
                        updateInvoiceSplitItem(
                          index,
                          'description',
                          e.target.value
                        )
                      }
                    />
                  </td>
                  <td className="!w-4/12">
                    <DatePicker
                      selected={split.dueDate}
                      dateFormat="MMMM d, YYYY"
                      className="h-10 rounded-md border text-sm border-gray-300 px-3 w-full"
                      onChange={e => {
                        if (e) {
                          updateInvoiceSplitItem(index, 'dueDate', e)
                        }
                      }}
                    />
                  </td>
                  <td>
                    <Input
                      value={split.percentage}
                      min={1}
                      max={100}
                      type="number"
                      className="border-gray-300"
                      placeholder={`${t(
                        'invoice.installment.percentagePlaceholder'
                      )}`}
                      onChange={e =>
                        updateInvoiceSplitItem(
                          index,
                          'percentage',
                          e.target.value
                        )
                      }
                    />
                  </td>
                  <td className="text-sm">
                    {formatCurrency(
                      getAmount(split.percentage),
                      siteData.currency
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

export default SplitInvoice
