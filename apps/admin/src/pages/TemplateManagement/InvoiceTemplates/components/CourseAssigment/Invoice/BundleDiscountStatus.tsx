import { useMemo } from 'react'

import { useTranslation } from 'react-i18next'
import { LuCheck } from 'react-icons/lu'

import { Button } from '@/components/ui/Button'
import useSiteData from '@/hooks/useSiteData'
import {
  AllPromotionsType,
  BundleDiscountAvailabilityResponse,
} from '@/types/studentInvoice.type'
import { formatCurrency } from '@/utils/currency'

interface BundleDiscountStatusProps {
  bundleId: number
  bundleDiscountInfo: BundleDiscountAvailabilityResponse | null
  isApplied?: boolean
  onApply?: () => void
  showAmountSaved?: boolean
  calculatedDiscountAmount?: number
  bundlePromo?: AllPromotionsType
  totalPrice?: number
  compact?: boolean // If true, render just the button without wrapper
  showButtonOnly?: boolean // If true, render only the button (for right side)
  showAmountSavedBelow?: boolean // If true, show amount saved below (for left side)
  priceAfterDiscount?: number // Price after discount (for disabling button)
  showBreakdown?: boolean // If true, show the grey breakdown block with payment info and discount details
  appliedPromo?: {
    amount: number
    retroactiveDiscount?: number
    courseNames?: string[]
  } // Applied promotion data for breakdown display
}

const BundleDiscountStatus: React.FC<BundleDiscountStatusProps> = ({
  bundleId: _bundleId,
  bundleDiscountInfo,
  isApplied = false,
  onApply,
  showAmountSaved = false,
  calculatedDiscountAmount = 0,
  bundlePromo,
  totalPrice,
  compact = false,
  showButtonOnly = false,
  showAmountSavedBelow = false,
  priceAfterDiscount,
  showBreakdown = false,
  appliedPromo,
}): JSX.Element | null => {
  const { t } = useTranslation('invoiceCampaign')
  const siteData = useSiteData()

  const isApplicable = useMemo(() => {
    if (!bundleDiscountInfo) return false
    // Use isQualified if available (calculated in EditInvoiceContext), otherwise fallback to minAdditionalCoursesNeeded check
    if (
      'isQualified' in bundleDiscountInfo &&
      bundleDiscountInfo.isQualified !== undefined
    ) {
      return bundleDiscountInfo.isQualified
    }
    // Fallback to original logic if isQualified is not set
    return (
      bundleDiscountInfo.minAdditionalCoursesNeeded !== undefined &&
      bundleDiscountInfo.minAdditionalCoursesNeeded === 0
    )
  }, [bundleDiscountInfo])

  // Calculate potential amount saved if applicable but not applied
  const potentialAmountSaved = useMemo(() => {
    if (isApplied || !isApplicable || !bundlePromo || !totalPrice) {
      return 0
    }

    let currentInvoiceDiscount = 0
    if (bundlePromo.discountType === 'percentage') {
      currentInvoiceDiscount = (bundlePromo.amount / 100) * totalPrice
    } else {
      currentInvoiceDiscount = Math.min(bundlePromo.amount, totalPrice)
    }

    let retroactiveDiscount = 0
    if (
      'isRetroactive' in bundlePromo &&
      bundlePromo.isRetroactive &&
      bundleDiscountInfo?.totalPaymentDone !== undefined &&
      bundleDiscountInfo.totalPaymentDone > 0
    ) {
      if (bundlePromo.discountType === 'percentage') {
        retroactiveDiscount =
          (bundlePromo.amount / 100) * bundleDiscountInfo.totalPaymentDone
      } else {
        retroactiveDiscount = Math.min(
          bundlePromo.amount,
          bundleDiscountInfo.totalPaymentDone
        )
      }
    }

    return currentInvoiceDiscount + retroactiveDiscount
  }, [
    isApplied,
    isApplicable,
    bundlePromo,
    totalPrice,
    bundleDiscountInfo?.totalPaymentDone,
  ])

  // Render amount saved block (for left side or when showAmountSaved is true)
  const renderAmountSaved = () => {
    const amountToShow = isApplied
      ? calculatedDiscountAmount
      : potentialAmountSaved

    if (amountToShow <= 0) return null

    return (
      <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-green-800">
            {t('invoice.discount.amountSaved')}
          </span>
          <span className="text-sm font-semibold text-green-900">
            {formatCurrency(amountToShow, siteData.currency)}
          </span>
        </div>
      </div>
    )
  }

  // Render button only (for right side)
  if (showButtonOnly) {
    if (isApplied) {
      return null
    }

    const isDisabled =
      !isApplicable ||
      (priceAfterDiscount !== undefined && priceAfterDiscount <= 0)

    if (isApplicable) {
      return (
        <Button
          type="button"
          className="h-8 min-w-24 w-32 bg-green-600 hover:bg-green-700 text-white"
          iconBefore={<LuCheck aria-hidden="true" />}
          onClick={onApply}
          disabled={isDisabled}
        >
          {t('invoice.discount.applicable')}
        </Button>
      )
    }

    return (
      <Button
        type="button"
        className="h-8 min-w-24 w-32"
        variant="outline"
        disabled
      >
        {t('invoice.discount.notApplicable')}
      </Button>
    )
  }

  // Render breakdown block (grey block with payment info and discount details)
  const renderBreakdown = () => {
    if (!bundleDiscountInfo) return null

    return (
      <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200">
        <div className="flex flex-col gap-1 text-xs text-gray-600">
          {/* Eligibility status */}
          {isApplicable && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-green-600 font-semibold">
                {t('invoice.discount.bundleDiscountEligible')}
              </span>
            </div>
          )}

          {/* Payment and course information */}
          {bundleDiscountInfo.totalPaymentDone !== undefined && (
            <div className="flex items-center justify-between">
              <span className="font-medium">
                {t('invoice.discount.paymentAmountDone')}
              </span>
              <span className="text-gray-900">
                {formatCurrency(
                  bundleDiscountInfo.totalPaymentDone,
                  siteData.currency
                )}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="font-medium">
              {t('invoice.discount.coursesSignedUp')}
            </span>
            <span className="text-gray-900">
              {bundleDiscountInfo.courseUsed?.length ?? 0}
            </span>
          </div>

          {/* Discount breakdown */}
          {appliedPromo && (
            <>
              <div className="mt-2 pt-2 border-t border-gray-300">
                <div className="text-xs font-medium text-gray-700 mb-1">
                  {t('invoice.discount.discountBreakdown')}
                </div>
                <div className="flex flex-col gap-1">
                  {appliedPromo.amount > 0 && (
                    <div className="flex items-center justify-between">
                      <span>
                        {t('invoice.discount.currentInvoiceDiscount')}
                      </span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(
                          -appliedPromo.amount,
                          siteData.currency
                        )}
                      </span>
                    </div>
                  )}
                  {appliedPromo.retroactiveDiscount !== undefined &&
                    appliedPromo.retroactiveDiscount > 0 && (
                      <div className="flex items-center justify-between">
                        <span>{t('invoice.discount.retroactiveDiscount')}</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(
                            -appliedPromo.retroactiveDiscount,
                            siteData.currency
                          )}
                        </span>
                      </div>
                    )}
                </div>
              </div>
              {appliedPromo.courseNames &&
                appliedPromo.courseNames.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-300">
                    <span className="font-medium">
                      {t('invoice.discount.appliedToCourses')}
                    </span>
                    <div className="mt-1 text-gray-700">
                      {appliedPromo.courseNames.join(', ')}
                    </div>
                  </div>
                )}
            </>
          )}
        </div>
      </div>
    )
  }

  // Render amount saved only (for left side below description)
  if (showAmountSavedBelow) {
    if (isApplicable) {
      return renderAmountSaved()
    }
    // Show "Not Applicable" text when bundle is not applicable
    return (
      <div className="mt-2 text-sm text-gray-500">
        {t('invoice.discount.bundleNotApplicable')}
      </div>
    )
  }

  // Render breakdown block (for available discounts)
  if (showBreakdown) {
    return renderBreakdown()
  }

  // Original full rendering (for AppliedDiscount)
  if (isApplied && showAmountSaved && calculatedDiscountAmount > 0) {
    return renderAmountSaved()
  }

  if (isApplied && !showAmountSaved) {
    return null
  }

  // Compact mode: just button and amount saved below
  if (compact) {
    return (
      <>{isApplicable && potentialAmountSaved > 0 && renderAmountSaved()}</>
    )
  }

  // Full mode: button with amount saved below
  return (
    <div className="mt-2">
      {isApplicable ? (
        <>
          <Button
            type="button"
            className="h-8 w-full bg-green-600 hover:bg-green-700 text-white"
            iconBefore={<LuCheck aria-hidden="true" />}
            onClick={onApply}
          >
            {t('invoice.discount.applicable')}
          </Button>
          {potentialAmountSaved > 0 && renderAmountSaved()}
        </>
      ) : (
        <Button type="button" className="h-8 w-full" variant="outline" disabled>
          {t('invoice.discount.notApplicable')}
        </Button>
      )}
    </div>
  )
}

export default BundleDiscountStatus
