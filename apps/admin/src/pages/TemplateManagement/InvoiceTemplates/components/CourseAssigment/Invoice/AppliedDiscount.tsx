import { useTranslation } from 'react-i18next'
import { LuTrash } from 'react-icons/lu'

import {
  DraggableCard,
  DraggableContainer,
} from '@/components/Containers/Draggable'
import { DEFAULT_CURRENCY } from '@/constants/invoices'
import useSiteData from '@/hooks/useSiteData'
import { useInvoiceEditorContext } from '@/pages/TemplateManagement/InvoiceTemplates/Editor/InvoiceEditorContext'
import { DiscountType } from '@/types/coupon'
import {
  AppliedPromotion,
  PromotionTypeItem,
} from '@/types/studentInvoice.type'
import { cn } from '@/utils/cn'
import { formatCurrency } from '@/utils/currency'

import BundleDiscountStatus from './BundleDiscountStatus'
import { useContextInvoiceEditDialog } from './EditInvoiceContext'

const AppliedDiscount = (): JSX.Element => {
  const { t } = useTranslation(['invoiceCampaign'])
  const siteData = useSiteData()
  const { isViewOnly } = useInvoiceEditorContext()

  const {
    appliedPromotions,
    setAppliedPromotions,
    calculatedDiscount,
    bundleDiscountInfoMap,
  } = useContextInvoiceEditDialog()

  const amountLabel = (promo: AppliedPromotion) => {
    if (promo.discountType === DiscountType.PERCENTAGE) {
      return `${promo.amount}%`
    }
    return formatCurrency(promo.amount, siteData.currency)
  }
  const removeDiscount = (promoItem: AppliedPromotion) => {
    setAppliedPromotions(prev => prev.filter(item => item.id !== promoItem.id))
  }

  return (
    <div className="p-4 border-t border-gray-300">
      <div className="font-medium mb-3">
        {t('invoice.discount.appliedDiscount')}
      </div>
      {(!appliedPromotions || appliedPromotions.length === 0) && (
        <div className="text-sm text-gray-500">
          {t('invoice.discount.noDiscountSelected')}
        </div>
      )}
      <DraggableContainer
        items={appliedPromotions}
        handleDragEnd={setAppliedPromotions}
      >
        {appliedPromotions?.map((promo, idx) => {
          const stableId =
            (promo.id != null && promo.id.toString()) ||
            (promo.name ? `code-${promo.name ?? ''}` : `promo-${idx}`)

          const bundleDiscountInfo = promo.id
            ? bundleDiscountInfoMap[promo.id] ?? null
            : null

          return (
            <DraggableCard
              id={stableId}
              key={stableId}
              className={cn(
                'bg-blue-50 border border-blue-300 mb-2 items-center',
                promo.isApplicable === false &&
                  'border-red-400 border-dashed bg-red-50'
              )}
            >
              <div className="block w-full">
                <div className="flex items-center w-full justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="text-gray-900 font-medium mb-1">
                        {promo.name}
                      </div>
                      <div
                        className={cn(
                          'px-2 bg-green-50 text-green-500 border border-green-300 font-medium rounded-full text-xs capitalize',
                          promo.type === PromotionTypeItem.COUPON &&
                            'bg-blue-50 text-blue-500 border border-blue-300'
                        )}
                      >
                        {promo.feeType === 'add'
                          ? t('invoice.discount.additionalFee')
                          : promo.type}
                      </div>
                    </div>
                    <div>
                      {promo.type === PromotionTypeItem.COUPON && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="text-sm text-gray-600">
                            {t('invoice.discount.offAmount', {
                              discountAmount: amountLabel(promo),
                            })}
                          </div>
                        </div>
                      )}
                      {promo.type === PromotionTypeItem.BUNDLE &&
                        'minQty' in promo && (
                          <>
                            <div className="text-sm text-gray-600">
                              {t('editor.bundleDiscount.promoText', {
                                qty: promo.minQty,
                                amount: promo.amount,
                              })}
                            </div>
                          </>
                        )}
                      {promo.type === PromotionTypeItem.PACKAGE && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-purple-100 text-purple-800">
                            {t('promotion:packageDiscount.badge')}
                          </span>
                          {promo.packageDiscountPerLesson && (
                            <span className="text-sm text-gray-600">
                              {t(
                                'promotion:packageDiscount.perLessonDiscount',
                                {
                                  amount: promo.packageDiscountPerLesson,
                                }
                              )}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {promo.isApplicable !== false && (
                    <div className="text-red-600 text-sm font-medium ml-auto">
                      {promo.feeType === 'add' ? '+' : '-'}
                      {formatCurrency(
                        calculatedDiscount.discountAmountsByPromoId?.[
                          promo.id ?? ''
                        ] ?? 0,
                        siteData.currency ?? DEFAULT_CURRENCY
                      )}
                    </div>
                  )}
                </div>
                {promo.isApplicable === false && (
                  <div className="p-2 border border-red-400 bg-red-200 rounded-lg text-red-800 text-sm mt-2">
                    {t('invoice.discount.notApplicable')}
                  </div>
                )}
                {/* Bundle discount status - only show green amount saved block */}
                {promo.type === PromotionTypeItem.BUNDLE &&
                  promo.id &&
                  typeof promo.id === 'number' && (
                    <BundleDiscountStatus
                      bundleId={promo.id}
                      bundleDiscountInfo={bundleDiscountInfo}
                      isApplied
                      showAmountSaved
                      calculatedDiscountAmount={
                        calculatedDiscount?.discountAmountsByPromoId?.[
                          promo.id ?? ''
                        ] ?? 0
                      }
                    />
                  )}
              </div>
              {!isViewOnly && (
                <LuTrash
                  className="text-red-600 hover:text-red-700 cursor-pointer ml-4 text-2xl"
                  onClick={() => removeDiscount(promo)}
                  aria-hidden="true"
                />
              )}
            </DraggableCard>
          )
        })}
      </DraggableContainer>
    </div>
  )
}

export default AppliedDiscount
