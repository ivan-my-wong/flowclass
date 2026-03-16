import React from 'react'

import { FormProvider, UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import FileInput from '@/components/ui/FileInput'
import { Input } from '@/components/ui/Inputs/Input'
import TextArea from '@/components/ui/TextAreaBase'
import { MediaFileDirectory } from '@/constants/MediaFileDirectory'
import { cn } from '@/utils/cn'
import { getMediaFileUrl } from '@/utils/generate-link.utils'

type PaymentMethodStepProps = {
  formPaymentMethod: UseFormReturn<
    {
      methodName: string
      paymentInstructions: string
      qrCodePic: string
    },
    any,
    undefined
  >
  isPayoutUploading: boolean
  setIsPayoutUploading: (loading: boolean) => void
  payoutPreview: string | null
  setPayoutPreview: React.Dispatch<React.SetStateAction<string | undefined>>
}

const PaymentMethodStep: React.FC<PaymentMethodStepProps> = ({
  formPaymentMethod,
  isPayoutUploading: _isPayoutUploading,
  setIsPayoutUploading,
  payoutPreview: _payoutPreview,
  setPayoutPreview,
}) => {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('onboarding:newUserSetup.registerPaymentMethod')}
        </h2>
        <p className="text-gray-600">
          {t('onboarding:newUserSetup.fillInPaymentInfo')}.{' '}
          {t('onboarding:newUserSetup.addPaymentMethod')}.
        </p>
      </div>

      <FormProvider {...formPaymentMethod}>
        <div className="flex flex-col px-3 py-6 gap-1 h-[450px] sm:h-[460px] overflow-y-auto">
          <div className="space-y-4 mt-2 h-auto">
            <div className="box-col-full items-start">
              <label
                htmlFor="methodName"
                className="text-sm font-medium block mb-1 text-left"
              >
                {t('payout:paymentMethodName')}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <Input
                data-testid="payment-method-name-input"
                required
                id="methodName"
                className="px-0 py-1 h-6 border-t-0 border-x-0 rounded-none focus:border-b-primary focus-visible:ring-0 focus-visible:ring-offset-0"
                {...formPaymentMethod.register('methodName', {
                  required: true,
                })}
              />
              {formPaymentMethod.formState.errors.methodName && (
                <p className="text-sm font-medium text-destructive">
                  {String(
                    formPaymentMethod.formState.errors.methodName?.message ||
                      t('common:errors.required')
                  )}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="paymentInstructions"
                className="text-sm font-medium block mb-1"
              >
                {t('payout:instruction')}{' '}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <TextArea
                data-testid="payment-instructions-input"
                required
                id="paymentInstructions"
                placeholder={t('payout:instructionPlaceholder').toString()}
                className={cn(
                  'px-0 py-1 min-h-[80px] border-t-0 border-x-0 rounded-none focus:border-b-primary focus-visible:ring-0 focus-visible:ring-offset-0'
                )}
                {...formPaymentMethod.register('paymentInstructions', {
                  required: true,
                })}
              />
              {formPaymentMethod.formState.errors.paymentInstructions && (
                <p className="text-sm font-medium text-destructive">
                  {String(
                    formPaymentMethod.formState.errors.paymentInstructions
                      ?.message || t('common:errors.required')
                  )}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="qrCodePic"
                className="text-sm font-medium block mb-1"
              >
                {t('payout:paymentCode')}
              </label>
              <FileInput
                croppable
                directory={MediaFileDirectory.PAYMENT_METHOD}
                {...formPaymentMethod.register('qrCodePic')}
                onFileUpload={async url => {
                  formPaymentMethod.setValue('qrCodePic', url)

                  try {
                    const result = await getMediaFileUrl(url)
                    setPayoutPreview(result)
                  } finally {
                    setIsPayoutUploading(false)
                  }
                }}
                onUploadStart={() => {
                  setIsPayoutUploading(true)
                }}
              />
            </div>
          </div>
        </div>
      </FormProvider>
    </div>
  )
}

export default PaymentMethodStep
