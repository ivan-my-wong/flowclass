import { useCallback, useEffect, useMemo, useRef } from 'react'

import { useTranslation } from 'react-i18next'
import { LuCheck, LuPlus } from 'react-icons/lu'
import { useRecoilState, useRecoilValue } from 'recoil'
import { toast } from 'sonner'

import { Button } from '@/components/ui/Button'
import useSiteData from '@/hooks/useSiteData'
import {
  availableLessonsByClassState,
  currentActiveParentState,
  currentActiveStudentState,
  invoiceCampaignState,
  invoiceClassesState,
  invoiceSessionState,
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
import { isPackageDiscountQualified } from '@/utils/invoice-campaign.utils'

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

  // Package discount qualification check
  const availableLessonsByClass = useRecoilValue(availableLessonsByClassState)
  const allSessions = useRecoilValue(invoiceSessionState)
  const allInvoiceClasses = useRecoilValue(invoiceClassesState)
  // Only check the current student's classes — not all students' classes
  const currentClasses = useMemo(
    () =>
      allInvoiceClasses.filter(
        c => c.studentItem.id === currentActiveStudent?.id
      ),
    [allInvoiceClasses, currentActiveStudent]
  )

  const isPackageQualified = useMemo(() => {
    if (promo.promotionType !== PromotionTypeItem.PACKAGE) return false
    const pd = promo as any
    // Check only this student's first class for qualification
    const firstClass = currentClasses[0]
    if (!firstClass) return false
    const { classId } = firstClass
    const isApplicable =
      pd.isAllClasses || pd.applicableClassIds?.includes(classId)
    if (!isApplicable) return false
    const available = availableLessonsByClass[classId]
    if (!available?.length) return false
    const result = isPackageDiscountQualified(allSessions, available, classId)
    return result.qualified
  }, [promo, currentClasses, allSessions, availableLessonsByClass])

  const isPackageAlreadyApplied = useMemo(() => {
    if (promo.promotionType !== PromotionTypeItem.PACKAGE) return false
    return (appliedPromotions ?? []).some(
      p => p.type === PromotionTypeItem.PACKAGE && p.id === promo.id
    )
  }, [promo, appliedPromotions])

  // Single source of truth: qualified by lesson count OR already in appliedPromotions
  const isEffectivelyApplied = isPackageQualified || isPackageAlreadyApplied

  const amountLabel = useMemo(() => {
    if (
      promo.promotionType === PromotionTypeItem.PACKAGE &&
      'amountPerLesson' in promo
    ) {
      return t('invoiceCampaign:editor.packageDiscount.perLesson', {
        amount: formatCurrency(
          (promo as any).amountPerLesson,
          siteData.currency
        ),
      })
    }
    if (promo.discountType === 'percentage') {
      return `${promo.amount}%`
    }
    return formatCurrency(promo.amount, siteData.currency)
  }, [promo, siteData.currency, t])

  const promotionTypeLabel: string = useMemo(() => {
    if (promo.promotionType === PromotionTypeItem.COUPON && 'code' in promo) {
      return promo.code ?? ''
    }
    if (promo.promotionType === PromotionTypeItem.BUNDLE && 'name' in promo) {
      return promo.name
    }
    if (promo.promotionType === PromotionTypeItem.PACKAGE && 'name' in promo) {
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
                'bg-blue-50 text-blue-500 border border-blue-300',
              promo.promotionType === PromotionTypeItem.PACKAGE &&
                'bg-purple-50 text-purple-500 border border-purple-300'
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
          {promo.promotionType === PromotionTypeItem.PACKAGE && (
            <div className="text-sm text-gray-600">
              {isEffectivelyApplied ? (
                <span className="text-green-600 flex items-center gap-1">
                  <LuCheck className="w-4 h-4" />
                  {t('invoiceCampaign:editor.packageDiscount.autoApplied')}
                </span>
              ) : (
                <span className="text-gray-500">
                  {t('invoiceCampaign:editor.packageDiscount.selectAllLessons')}
                </span>
              )}
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
        <div className="text-sm font-semibold text-gray-800 whitespace-nowrap">
          {amountLabel}
        </div>
        {(() => {
          if (promo.promotionType === PromotionTypeItem.BUNDLE && promo.id) {
            return (
              <BundleDiscountStatus
                bundleId={promo.id}
                bundleDiscountInfo={bundleDiscountInfoMap[promo.id] ?? null}
                isApplied={isApplied}
                onApply={() => updateAppliedPromotion(false)}
                calculatedDiscountAmount={
                  calculatedDiscount?.discountAmountsByPromoId?.[
                    promo.id ?? ''
                  ] ?? 0
                }
                bundlePromo={promo}
                totalPrice={totalPrice?.totalPrice}
                compact
                showButtonOnly
                priceAfterDiscount={calculatedDiscount?.priceAfterDiscount}
              />
            )
          }
          if (promo.promotionType === PromotionTypeItem.PACKAGE) {
            return (
              <Button
                type="button"
                className="h-8 min-w-24 w-32 ml-auto"
                variant={isEffectivelyApplied ? 'default' : 'primary-outline'}
                disabled={!isEffectivelyApplied}
                iconBefore={
                  isEffectivelyApplied ? (
                    <LuCheck aria-hidden="true" />
                  ) : (
                    <LuPlus aria-hidden="true" />
                  )
                }
                onClick={() => {
                  // Package discounts are auto-managed — no manual action needed
                }}
              >
                {isEffectivelyApplied
                  ? t('invoiceCampaign:editor.packageDiscount.applied')
                  : t('invoice.discount.bundleNotApplicable')}
              </Button>
            )
          }
          return (
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
          )
        })()}
      </div>
    </div>
  )
}

export default PromotionItem
