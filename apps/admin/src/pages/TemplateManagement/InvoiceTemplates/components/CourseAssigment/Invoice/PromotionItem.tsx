import { useCallback, useEffect, useMemo, useRef } from 'react'

import { useTranslation } from 'react-i18next'
import { LuPlus } from 'react-icons/lu'
import { useRecoilState, useRecoilValue } from 'recoil'
import { toast } from 'sonner'

import { Button } from '@/components/ui/Button'
import useSiteData from '@/hooks/useSiteData'
import {
  currentActiveParentState,
  currentActiveStudentState,
  invoiceCampaignState,
} from '@/stores/studentInvoice.store'
import {
  AllPromotionsType,
  AppliedPromotion,
  DiscountType,
  InvoiceCampaignDetailDto,
  PromotionTypeItem,
} from '@/types/studentInvoice.type'
import { cn } from '@/utils/cn'
import { formatCurrency } from '@/utils/currency'

import BundleDiscountStatus from './BundleDiscountStatus'
import { useContextInvoiceEditDialog } from './EditInvoiceContext'

interface Props {
  promo: AllPromotionsType
  isApplied: boolean
}

const PromotionItem: React.FC<Props> = ({ promo, isApplied }): JSX.Element => {
  const { t } = useTranslation('invoiceCampaign')
  const siteData = useSiteData()
  const {
    setAppliedPromotions,
    appliedPromotions,
    checkAndApplyBundleDiscount,
    calculatedDiscount,
    bundleDiscountInfoMap,
    totalPrice,
  } = useContextInvoiceEditDialog()
  const [invoiceCampaign, setInvoiceCampaign] =
    useRecoilState(invoiceCampaignState)
  const updateAppliedPromotionRef = useRef<
    ((isAutoApply?: boolean) => Promise<void>) | null
  >(null)

  const currentActiveStudent = useRecoilValue(currentActiveStudentState)
  const currentActiveParent = useRecoilValue(currentActiveParentState)
  const isCombinedInvoice = useMemo(
    () => invoiceCampaign?.isCombined ?? false,
    [invoiceCampaign?.isCombined]
  )

  const amountLabel = useMemo(() => {
    if (promo.discountType === 'percentage') {
      return `${promo.amount}%`
    }
    return formatCurrency(promo.amount, siteData.currency)
  }, [promo.amount, promo.discountType, siteData.currency])

  const promotionTypeLabel: string = useMemo(() => {
    if (promo.promotionType === PromotionTypeItem.COUPON && 'code' in promo) {
      return promo.code ?? ''
    }
    if (promo.promotionType === PromotionTypeItem.BUNDLE && 'name' in promo) {
      return promo.name
    }
    return ''
  }, [promo])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateExistingPromotions = (
    prev: AppliedPromotion[],
    userAliasId: number,
    isCombinedInvoice: boolean,
    appliedItem: AppliedPromotion
  ) => {
    const existingIndex = (prev || []).findIndex(item => {
      if (isCombinedInvoice) {
        return item.id === promo.id && item.parentId === userAliasId
      }
      return item.id === promo.id && item.studentId === userAliasId
    })
    if (existingIndex !== -1) {
      // If already exists, update it
      const updatedPromotions = [...prev]
      updatedPromotions[existingIndex] = appliedItem
      return updatedPromotions
    }
    return [
      ...(prev || []),
      {
        ...appliedItem,
        studentId: userAliasId,
        parentId: isCombinedInvoice ? userAliasId : null,
      },
    ]
  }

  const setPromotionItems = useCallback(
    (appliedItem: AppliedPromotion) => {
      if (!currentActiveStudent) return
      setAppliedPromotions(prev =>
        updateExistingPromotions(
          prev,
          currentActiveStudent.id,
          isCombinedInvoice,
          appliedItem
        )
      )
      if (!currentActiveParent) return
      setInvoiceCampaign(prev => {
        if (!prev) return null
        if (prev.isCombined) {
          const updatedDiscounts = updateExistingPromotions(
            prev.combinedInvoice?.discounts ?? [],
            currentActiveParent?.id,
            true,
            { ...appliedItem, feeType: 'deduct' }
          )
          return {
            ...prev,
            combinedInvoice: {
              ...prev.combinedInvoice,
              discounts: updatedDiscounts,
            } as InvoiceCampaignDetailDto,
          }
        }
        return prev
      })
    },
    [
      currentActiveParent,
      currentActiveStudent,
      isCombinedInvoice,
      setAppliedPromotions,
      setInvoiceCampaign,
      updateExistingPromotions,
    ]
  )

  const updateAppliedPromotion = useCallback(
    async (isAutoApply = false) => {
      // Prevent applying if already applied (to avoid infinite loops)
      if (isApplied && !isAutoApply) {
        return
      }

      // For bundle discounts, use the checkAndApplyBundleDiscount function
      if (promo.promotionType === PromotionTypeItem.BUNDLE && promo.id) {
        const isQualified = await checkAndApplyBundleDiscount(promo.id, {
          autoApply: true,
        })
        if (!isQualified) {
          toast.error(t('invoiceCampaign:errors.discountNotEligible'))
        }
        return
      }

      // For other promotion types, use the existing logic
      const appliedItem: AppliedPromotion = {
        id: promo.id,
        name: promotionTypeLabel || '',
        type: promo.promotionType,
        discountType: promo.discountType as DiscountType,
        amount: promo.amount,
        minQty: 'minQty' in promo ? (promo.minQty as number) : 0,
        studentId: currentActiveStudent?.id ?? null,
        parentId: currentActiveParent?.id ?? null,
        order: 0,
        isApplicable: true,
        feeType: 'deduct',
      }

      setPromotionItems(appliedItem)
    },
    [
      promo,
      promotionTypeLabel,
      setPromotionItems,
      checkAndApplyBundleDiscount,
      t,
      currentActiveStudent,
      currentActiveParent,
      isApplied,
    ]
  )

  // Keep ref updated with latest function
  useEffect(() => {
    updateAppliedPromotionRef.current = updateAppliedPromotion
  }, [updateAppliedPromotion])

  return (
    <div className="p-3 border border-gray-200 rounded-lg mb-2 flex gap-4 flex-col sm:flex-row sm:items-center items-end justify-between">
      <div className="w-full">
        <div className="flex items-center gap-2">
          <p className="text-gray-900 font-medium">{promotionTypeLabel}</p>
          <div
            className={cn(
              'px-2 bg-green-50 text-green-500 border border-green-300 rounded-full text-xs capitalize',
              promo.promotionType === 'coupon' &&
                'bg-blue-50 text-blue-500 border border-blue-300'
            )}
          >
            {promo.promotionType}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {promo.promotionType === PromotionTypeItem.BUNDLE &&
            'minQty' in promo && (
              <div className="text-sm text-gray-600">
                {t('invoiceCampaign:editor.bundleDiscount.promoText', {
                  qty: promo.minQty,
                  amount: promo.amount,
                })}
              </div>
            )}
        </div>
        {promo.promotionType === PromotionTypeItem.BUNDLE && promo.id && (
          <BundleDiscountStatus
            bundleId={promo.id}
            bundleDiscountInfo={bundleDiscountInfoMap[promo.id] ?? null}
            isApplied={isApplied}
            onApply={() => updateAppliedPromotion(false)}
            calculatedDiscountAmount={
              calculatedDiscount?.discountAmountsByPromoId?.[promo.id ?? ''] ??
              0
            }
            bundlePromo={promo}
            totalPrice={totalPrice?.totalPrice}
            showBreakdown
            appliedPromo={
              isApplied
                ? {
                    amount:
                      appliedPromotions?.find(p => p.id === promo.id)?.amount ??
                      0,
                    retroactiveDiscount: appliedPromotions?.find(
                      p => p.id === promo.id
                    )?.retroactiveDiscount,
                    courseNames: appliedPromotions?.find(p => p.id === promo.id)
                      ?.courseNames,
                  }
                : undefined
            }
          />
        )}
      </div>
      <div className="flex items-center gap-3 text-right">
        <div className="text-sm font-semibold text-gray-800">{amountLabel}</div>
        {promo.promotionType === PromotionTypeItem.BUNDLE && promo.id ? (
          <BundleDiscountStatus
            bundleId={promo.id}
            bundleDiscountInfo={bundleDiscountInfoMap[promo.id] ?? null}
            isApplied={isApplied}
            onApply={() => updateAppliedPromotion(false)}
            calculatedDiscountAmount={
              calculatedDiscount?.discountAmountsByPromoId?.[promo.id ?? ''] ??
              0
            }
            bundlePromo={promo}
            totalPrice={totalPrice?.totalPrice}
            compact
            showButtonOnly
            priceAfterDiscount={calculatedDiscount?.priceAfterDiscount}
          />
        ) : (
          <Button
            type="button"
            className="h-8 min-w-24 w-32 ml-auto"
            variant="primary-outline"
            iconBefore={<LuPlus aria-hidden="true" />}
            onClick={() => updateAppliedPromotion(false)}
            disabled={
              isApplied || (calculatedDiscount?.priceAfterDiscount ?? 0) <= 0
            }
          >
            {t('invoice.discount.applyBtn')}
          </Button>
        )}
      </div>
    </div>
  )
}

export default PromotionItem
