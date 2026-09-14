import { useEffect, useState } from 'react'

import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { LuMail } from 'react-icons/lu'

import { submitQuote } from '@/api/pricingPage'
import LabelInput from '@/components/Inputs/LabelInput'
import PhoneNumberInput from '@/components/Inputs/PhoneInput'
import TextInput from '@/components/Inputs/TextInput'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { useUserCountry } from '@/hooks/useLocalization'
import { formatCurrencyWithName } from '@/utils/currency'

interface ContactFormData {
  name: string
  phone: string
  email: string
  company: string
  website: string
}

interface ContactSalesFormProps {
  quizData?: any
  onSubmit?: (formData: ContactFormData) => void
  selectedPlan?: string
  calculatedPrice: number
  selectedCurrency: 'HKD' | 'USD'
  selectedDuration: 'month' | 'year'
}

const ContactSalesForm = ({
  quizData,
  onSubmit,
  selectedPlan,
  calculatedPrice,
  selectedCurrency,
  selectedDuration,
}: ContactSalesFormProps): JSX.Element => {
  const { t } = useTranslation(['onboarding', 'account'])
  const [country] = useUserCountry()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    success: boolean
    message: string
  } | null>(null)

  const form = useForm<ContactFormData>({
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      company: '',
      website: '',
    },
    mode: 'onBlur',
  })

  // Get display price based on currency and duration
  const getDisplayPrice = (basePrice: number): string => {
    let price = basePrice

    // Convert to USD if needed (approximate conversion rate)
    if (selectedCurrency === 'USD') {
      price = Math.round(price * 0.128) // Approximate HKD to USD conversion
    }

    // Convert to monthly if needed
    if (selectedDuration === 'month') {
      price = Math.round(price / 12)
    }

    const currencySymbol = selectedCurrency === 'HKD' ? 'HK$' : '$'
    const durationText = selectedDuration === 'month' ? 'month' : 'year'

    return `${formatCurrencyWithName(price, selectedCurrency)}/${durationText}`
  }

  const handleSubmit = async (formData: ContactFormData) => {
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      const formDataForAPI = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        website: formData.website,
        totalPrice: getDisplayPrice(calculatedPrice),
        recommendedPlan: selectedPlan || 'Custom Plan',
        currency: selectedCurrency,
        duration: selectedDuration,
        // Include all quiz data fields
        studentCount: quizData?.studentCount || '',
        schoolCount: quizData?.schoolCount || '',
        setupAssistance: quizData?.setupAssistance || false,
        adminStaff: quizData?.adminStaff || '',
        tutorCount: quizData?.tutorCount || '',
        classTypes: quizData?.classTypes || [],
        premiumFeatures: quizData?.premiumFeatures || [],
        notificationChannels: quizData?.notificationChannels || [],
        promotionFeatures: quizData?.promotionFeatures || [],
      }

      // Use the same API as PricingCalculator
      const response = await submitQuote(formDataForAPI)

      if (response.success) {
        setSubmitStatus({
          success: true,
          message: t('contactSalesForm.errors.quoteRequestSuccess'),
        })
        setIsSubmitted(true)
        // Reset form after successful submission
        setTimeout(() => {
          setIsSubmitted(false)
          setSubmitStatus(null)
        }, 3000)
        onSubmit?.(formData)
      } else {
        setSubmitStatus({
          success: false,
          message:
            response.message || t('contactSalesForm.errors.failedToSend'),
        })
      }
    } catch (error) {
      console.error('Error submitting quote:', error)
      setSubmitStatus({
        success: false,
        message: t('contactSalesForm.errors.failedToSendContact'),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LuMail className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {t('contactSalesForm.success.title')}
          </h3>
          <p className="text-gray-600">
            {t('contactSalesForm.success.description', { plan: selectedPlan })}
          </p>
        </div>
      </div>
    )
  }

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      className="space-y-6 w-full"
    >
      {/* Success/Error Messages */}
      {submitStatus && (
        <div
          className={`p-3 rounded-lg ${
            submitStatus.success
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-red-100 text-red-800 border border-green-200'
          }`}
        >
          {submitStatus.message}
        </div>
      )}

      {/* Form Fields */}
      <div className="box-col-full space-y-4">
        <TextInput
          {...form.register('name', {
            required:
              t('contactSalesForm.form.fullNameRequired') ||
              'Full name is required',
          })}
          id="name"
          label={t('contactSalesForm.form.fullName') || 'Full Name *'}
          placeholder={
            t('contactSalesForm.form.fullNamePlaceholder') ||
            'Enter your full name'
          }
          className="mt-1"
          isError={!!form.formState.errors.name}
          helperText={form.formState.errors.name?.message}
        />

        <TextInput
          id="email"
          type="email"
          label={t('contactSalesForm.form.email') || 'Email Address *'}
          {...form.register('email', {
            required:
              t('contactSalesForm.form.emailRequired') || 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message:
                t('contactSalesForm.form.invalidEmail') ||
                'Invalid email address',
            },
          })}
          placeholder={
            t('contactSalesForm.form.emailPlaceholder') ||
            'Enter your email address'
          }
          className="mt-1"
          isError={!!form.formState.errors.email}
          helperText={form.formState.errors.email?.message}
        />

        <div className="box-responsive-full">
          <div className="box-col-full">
            <LabelInput
              label={t('contactSalesForm.form.phone')}
              className="box-responsive-full"
              isError={!!form.formState.errors.phone}
              helperText={form.formState.errors.phone?.message}
            >
              <Controller
                name="phone"
                control={form.control}
                rules={{
                  required:
                    t('contactSalesForm.form.phoneRequired') ||
                    'Phone is required',
                }}
                render={({ field }) => (
                  <PhoneNumberInput
                    {...field}
                    value={field.value || ''}
                    country={
                      (country as string)?.toLowerCase?.() !== 'unknown'
                        ? (country as string).toLowerCase()
                        : 'hk'
                    }
                    onChange={value => {
                      field.onChange(value)
                    }}
                    fullWidth
                  />
                )}
              />
            </LabelInput>
          </div>
        </div>

        <TextInput
          {...form.register('company')}
          id="company"
          type="text"
          label={
            t('contactSalesForm.form.company') || 'Company/Institution Name'
          }
          placeholder={
            t('contactSalesForm.form.companyPlaceholder') ||
            'Enter your company name'
          }
          className="mt-1"
        />

        <TextInput
          id="website"
          type="url"
          label={t('contactSalesForm.form.website') || 'Company Website'}
          {...form.register('website')}
          placeholder={
            t('contactSalesForm.form.websitePlaceholder') ||
            'https://yourcompany.com'
          }
          className="mt-1"
        />
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 text-lg font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={isSubmitting}
          loading={isSubmitting}
        >
          {isSubmitting
            ? t('contactSalesForm.submit.sending')
            : t('contactSalesForm.submit.sendQuoteRequest')}
        </Button>
      </div>
    </form>
  )
}

export default ContactSalesForm
