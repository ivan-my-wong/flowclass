import { useCallback, useEffect, useMemo, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { useRecoilValue } from 'recoil'

import { Spinner } from '@/components/Loaders/Spinner'
import { Input } from '@/components/ui/Inputs/Input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Separator } from '@/components/ui/Separator'
import { FEATURE_FLAG } from '@/constants/featureFlags'
import useSiteData from '@/hooks/useSiteData'
import { useInvoiceEditorContext } from '@/pages/TemplateManagement/InvoiceTemplates/Editor/InvoiceEditorContext'
import { invoiceClassesState } from '@/stores/studentInvoice.store'
import { PromotionTypeItem } from '@/types/studentInvoice.type'
import { formatCurrency } from '@/utils/currency'

import AppliedDiscount from './AppliedDiscount'
import { useContextInvoiceEditDialog } from './EditInvoiceContext'
import ManualDiscountForm from './ManualDiscountForm'
import PromotionItem from './PromotionItem'
import ReferralDiscount from './ReferralDiscount'

type DiscountTypeOptions = {
  label: string
  value: string
}
const promotionTypeList = ['all', 'coupon', 'bundle', 'package']

const InvoiceDiscount = (): JSX.Element => {
  const { t } = useTranslation('invoiceCampaign')
  const { currentSite } = useSiteData()
  const currency = currentSite?.currency ?? 'HKD'
  const { isViewOnly } = useInvoiceEditorContext()
  const {
    allPromotions,
    appliedPromotions,
    isLoadingPromotions,
    calculatedDiscount,
    totalPrice,
    checkBundleDiscountAvailability,
  } = useContextInvoiceEditDialog()
  const [search, setSearch] = useState<string>('')
  const [promotionType, setPromotionType] = useState<string>('all')

  const currentClasses = useRecoilValue(invoiceClassesState)
  const currentClassIds = useMemo(
    () => new Set(currentClasses.map(c => c.classId)),
    [currentClasses]
  )

  const filteredDiscounts = useMemo(() => {
    const promos = allPromotions ?? []
    if (promos.length === 0) return []
    return promos.filter(item => {
      // Filter out package discounts that don't apply to any current class
      if (item.promotionType === PromotionTypeItem.PACKAGE) {
        const isAllClasses =
          'isAllClasses' in item
            ? (item as Record<string, unknown>).isAllClasses
            : false
        if (!isAllClasses) {
          const classIds =
            'applicableClassIds' in item
              ? ((item as Record<string, unknown>).applicableClassIds as
                  | number[]
                  | null) ?? []
              : []
          if (!classIds.some(id => currentClassIds.has(id))) return false
        }
      }

      let name: string = ''
      if (item.promotionType === PromotionTypeItem.COUPON && 'code' in item) {
        name = item.code || ''
      } else if ('name' in item) {
        name = item.name || ''
      }
      return (
        name.toLowerCase().includes(search.toLowerCase()) &&
        (promotionType === 'all' || item.promotionType === promotionType)
      )
    })
  }, [search, promotionType, allPromotions, currentClassIds])

  const promotionTypeOptions: DiscountTypeOptions[] = useMemo(() => {
    return promotionTypeList.map(item => {
      return {
        value: item,
        label: t(`invoice.discount.${item}`),
      }
    })
  }, [t])

  const isApplied = useCallback(
    (promotionId: number) => {
      return (appliedPromotions ?? []).some(item => item.id === promotionId)
    },
    [appliedPromotions]
  )

  // Check bundle discount availability on load
  useEffect(() => {
    if (allPromotions && !isLoadingPromotions) {
      checkBundleDiscountAvailability().catch(() => {
        // Silently handle errors
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allPromotions, isLoadingPromotions])

  return (
    <div className="border border-gray-300 rounded-lg mb-6 pb-4">
      {!isViewOnly && (
        <div className="p-4 border-b border-gray-300 mb-4">
          <div className="mb-4 flex items-center gap-2 text-gray-800 font-medium">
            {t('invoice.discount.availableDiscounts')}
          </div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8/12">
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t(
                  'invoice.discount.searchDiscountsPlaceholder'
                ).toString()}
                className="border-gray-300 w-full"
              />
            </div>
            <div className="w-4/12">
              <Select value={promotionType} onValueChange={setPromotionType}>
                <SelectTrigger className="w-full border-gray-300 rounded-lg text-gray-500">
                  <SelectValue
                    placeholder={t(
                      'invoice.discount.selectDiscountTypePlaceholder'
                    ).toString()}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {promotionTypeOptions.map(item => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            {isLoadingPromotions ? (
              <Spinner className="my-20" />
            ) : (
              <>
                {filteredDiscounts.length === 0 && (
                  <div className="text-sm text-gray-600">
                    {t('invoice.discount.noCouponAvailable')}
                  </div>
                )}
                {filteredDiscounts.map(promo => (
                  <PromotionItem
                    key={promo.id}
                    promo={promo}
                    isApplied={isApplied(promo.id)}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      )}
      {!isViewOnly && <ManualDiscountForm />}
      {!isViewOnly && FEATURE_FLAG.REFERRAL_DISCOUNT && <ReferralDiscount />}
      <AppliedDiscount />
      <div className="border-t border-gray-200 px-4 pt-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <div className="text-gray-700">{t('invoice.discount.subtotal')}</div>
          <div className="font-semibold">{totalPrice?.totalPriceLabel}</div>
        </div>
        <div className="flex items-center justify-between text-sm mb-2">
          <div className="text-gray-700">
            {t('invoice.discount.totalDiscount')}
          </div>
          <div className="font-semibold text-red-600">
            {`-${formatCurrency(calculatedDiscount.totalDiscount, currency)}`}
          </div>
        </div>
        <div className="flex items-center justify-between text-sm mb-2">
          <div className="text-gray-700">
            {t('invoice.discount.additionalFee')}
          </div>
          <div className="font-semibold text-blue-600">
            {`+${formatCurrency(
              calculatedDiscount.additionalFee ?? 0,
              currency
            )}`}
          </div>
        </div>
        <Separator className="bg-gray-200 mb-2" />
        <div className="flex items-center text-gray-900 justify-between text-sm">
          <div className="font-semibold">{t('invoice.discount.total')}</div>
          <div className="font-semibold">
            {formatCurrency(calculatedDiscount.priceAfterDiscount, currency)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default InvoiceDiscount
