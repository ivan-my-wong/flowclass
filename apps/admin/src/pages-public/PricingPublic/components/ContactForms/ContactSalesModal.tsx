import { useState } from 'react'

import { useTranslation } from 'react-i18next'
import { LuMail } from 'react-icons/lu'

import ModalDialog from '@/components/ui/ModalDialog'
import { pricingTiers } from '@/constants/presetSubscriptionPlans'
import { formatCurrencyWithName } from '@/utils/currency'

import ContactSalesForm from './ContactSalesForm'

interface ContactSalesModalProps {
  isOpen: boolean
  onClose: () => void
  quizData: any
  selectedPlan: string
  calculatedPrice: number
  selectedCurrency: 'HKD' | 'USD'
  selectedDuration: 'month' | 'year'
}

const ContactSalesModal = ({
  isOpen,
  onClose,
  quizData,
  selectedPlan,
  calculatedPrice,
  selectedCurrency,
  selectedDuration,
}: ContactSalesModalProps): JSX.Element => {
  const { t } = useTranslation('onboarding')
  const [isSubmitted, setIsSubmitted] = useState(false)

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LuMail className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {t('contactSalesModal.successMessage.title')}
          </h3>
          <p className="text-gray-600">
            {t('contactSalesModal.successMessage.description', {
              plan: selectedPlan,
            })}
          </p>
        </div>
      </div>
    )
  }

  const selectedTier = pricingTiers.find(tier => tier.id === selectedPlan)
  const selectedPrice =
    selectedTier?.prices.find(
      p => p.currency === selectedCurrency && p.interval === selectedDuration
    )?.price ?? 0

  return (
    <ModalDialog
      open={isOpen}
      onOpenChange={open => !open && onClose()}
      title={t('contactSalesModal.title')}
      subtitle={t('contactSalesModal.subtitle', { plan: selectedPlan })}
    >
      {/* Plan Summary */}
      <div className="box-col-full p-4">
        <div className="w-full text-center bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200 mb-6">
          <div className="text-2xl font-bold text-blue-600 mb-2">
            {t('contactSalesModal.planSummary.plan', {
              planName: pricingTiers.find(tier => tier.id === selectedPlan)
                ?.nameKey
                ? t(
                    pricingTiers.find(tier => tier.id === selectedPlan)
                      ?.nameKey || ''
                  )
                : '',
            })}
          </div>
          <div className="text-lg text-blue-700 mb-2">
            {(() => {
              const price = selectedPrice
              // Show price based on selected duration
              return `${formatCurrencyWithName(price, selectedCurrency)} / ${t(
                'contactSalesModal.planSummary.perMonth'
              )}`
            })()}
          </div>
          {selectedDuration === 'year' && (
            <div className="text-xs text-blue-500 mt-1">
              {t('contactSalesModal.planSummary.billedYearlyAt')}{' '}
              {(() => {
                const price = selectedPrice

                const cost = price * 12
                return `${formatCurrencyWithName(cost, selectedCurrency)}`
              })()}
            </div>
          )}
          {selectedDuration === 'month' && (
            <div className="text-xs text-blue-500 mt-1">
              {t('contactSalesModal.planSummary.billedMonthly')}
            </div>
          )}
        </div>

        {/* Contact Form */}
        <ContactSalesForm
          quizData={quizData}
          selectedPlan={selectedPlan}
          calculatedPrice={calculatedPrice}
          selectedCurrency={selectedCurrency}
          selectedDuration={selectedDuration}
        />
      </div>
    </ModalDialog>
  )
}

export default ContactSalesModal
