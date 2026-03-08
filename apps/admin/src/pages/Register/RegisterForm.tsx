import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import {
  Controller,
  FieldValues,
  SubmitHandler,
  useForm,
} from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { FaChevronLeft, FaChevronRight, FaPaperPlane } from 'react-icons/fa'
import { useMutation } from 'react-query'
import { toast } from 'sonner'

import { registerAccount } from '@/api/auth'
import { ApiError } from '@/api/errors/apiError'
import { GtmEvent, setGtmEvent } from '@/api/external/gtmEvent'
import Checkbox from '@/components/Checkbox/Checkbox'
import Box from '@/components/Containers/Box'
import LabelInput from '@/components/Inputs/LabelInput'
import PhoneNumberInput from '@/components/Inputs/PhoneInput'
import { TextInput } from '@/components/Inputs/TextInput'
import { Spinner } from '@/components/Loaders/Spinner'
import Text from '@/components/Texts/Text'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Inputs/Input'
import { LinkToGuides } from '@/constants/guides'
import { useUserCountry } from '@/hooks/useLocalization'
import { UserState } from '@/types/user'
import { validateEmail, validatePassword } from '@/utils/validate'

export interface RegisterFormProps {
  firstName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}

const RegisterForm: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [country] = useUserCountry()
  const [hasPrivacyConsent, setHasPrivacyConsent] = useState(false)
  const [emailFlowStep, setEmailFlowStep] = useState(0)

  const {
    register,
    control,
    watch,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm()
  const watchAllFields = watch()

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: (data: {
      firstName: string
      email: string
      phone: string
      password: string
    }) =>
      registerAccount({
        firstName: data.firstName,
        email: data.email,
        phone: data.phone,
        password: data.password,
      }),
    onSuccess: (user: UserState) => {
      navigate('/welcome/set-up')
      toast.success(t('login:register.verifyEmail'))

      setGtmEvent({
        login_method: 'email',
        email: user.email,
        event: GtmEvent.signUp,
      })
    },
    onError: (error: ApiError) => {
      if (error.statusCode === 400) {
        // Phone number already exists
        toast.error(t('login:errors.phoneAlreadyExists'))

        // Set error to the correct field (phone, not email)
        setError('phone', {
          type: 'manual',
          message: t('login:errors.phoneAlreadyExists') as string,
        })

        // Navigate back to phone step if we're in email flow
        setEmailFlowStep(1)
      } else if (error.statusCode === 422) {
        if (Array.isArray(error.message) && error.message.length > 0) {
          error.message.forEach(message => {
            if (message.password !== null) {
              toast.error(t('login:errors.strongPassword'))
            } else {
              toast.error(t('login:errors.tryAnotherEmail'))
            }
          })
        }
      } else {
        toast.error(t('common:errors.network'))
      }
    },
  })

  const handleEmailStep = (data: FieldValues) => {
    if (validateEmail(data.email)) {
      setEmailFlowStep(1)
      setValue('firstName', '')
    }
  }

  const handlePhoneStep = (data: FieldValues) => {
    // Only proceed if phone is provided and there are no errors
    if (data.phone && !errors.phone) {
      setEmailFlowStep(2)
    }
    // If there's an error, the form validation will prevent submission
  }

  const handleNameStep = (data: FieldValues) => {
    if (data.firstName) {
      setEmailFlowStep(3)
    }
  }

  const submitRegistration = (data: RegisterFormProps): void => {
    const { firstName, email, phone, password } = data
    mutateAsync({ firstName, email, phone, password })
  }

  const goBack = () => {
    if (emailFlowStep > 0) {
      setEmailFlowStep(emailFlowStep - 1)
    }
  }

  const getStepIndicator = () => {
    const steps = ['email']
    if (emailFlowStep >= 1) steps.push('phone')
    if (emailFlowStep >= 2) steps.push('name')
    if (emailFlowStep >= 3) steps.push('password')
    return steps
  }

  const getStepLabel = (step: string) => {
    switch (step) {
      case 'method':
        return t('login:register.chooseMethod')
      case 'email':
        return t('login:register.email')
      case 'phone':
        return t('login:register.phone')
      case 'name':
        return t('login:register.name')
      case 'password':
        return t('login:register.password')
      default:
        return step
    }
  }

  const getTotalSteps = () => {
    return 4
  }

  const renderStepIndicator = () => {
    const steps = getStepIndicator()
    if (steps.length === 0) return null

    return (
      <div className="mb-6">
        <div className="box-row-full sm:items-center sm:justify-between mb-2 space-y-2 sm:space-y-0">
          {emailFlowStep > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={goBack}
              className="text-gray-600 hover:text-gray-900 pl-0"
              iconBefore={<FaChevronLeft />}
            >
              {t('common:action.back')}
            </Button>
          )}
          <p className="ml-auto text-sm text-gray-500 text-center sm:text-left">
            {steps.length} / {getTotalSteps()}
          </p>
        </div>
        <div className="flex space-x-2">
          {steps.map((step, _index) => (
            <div key={step} className="flex-1">
              <div className="h-2 bg-blue-200 rounded-full">
                <div className="h-2 bg-blue-600 rounded-full transition-all duration-300" />
              </div>
              <div className="text-xs text-gray-500 mt-1 text-center truncate">
                {getStepLabel(step)}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderEmailFlow = () => {
    switch (emailFlowStep) {
      case 0:
        return (
          <div className="flex flex-col gap-4 w-full">
            {renderStepIndicator()}

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {t('login:register.whatsYourEmail')}
              </h2>
              <p className="text-gray-600">
                {t('login:register.enterEmailToContinue')}
              </p>
            </div>

            <form onSubmit={handleSubmit(handleEmailStep)} className="w-full">
              <TextInput
                id="email"
                type="email"
                autoComplete="email"
                label={t('login:loginModal.email')}
                vertical
                isError={!!errors.email}
                placeholder="example@gmail.com"
                helperText={
                  errors?.email?.message && (errors?.email?.message as string)
                }
                {...register('email', {
                  required: t('login:errors.required') as string,
                  validate: (val: string) =>
                    validateEmail(val) ||
                    (t('login:errors.invalidEmail') as string),
                })}
              />
              <div className="mt-8">
                <Button
                  type="submit"
                  className="w-full"
                  iconAfter={<FaChevronRight />}
                >
                  {t('login:register.continue')}
                </Button>
              </div>
            </form>
          </div>
        )

      case 1:
        return (
          <div className="flex flex-col gap-4 w-full">
            {renderStepIndicator()}

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {t('login:register.whatsYourPhone')}
              </h2>
              <p className="text-gray-600">
                {t('login:register.enterPhoneToContinue')}
              </p>
            </div>

            <form onSubmit={handleSubmit(handlePhoneStep)} className="w-full">
              <LabelInput
                label={t('school:contact.phoneForContact')}
                vertical
                isError={!!errors?.phone}
                helperText={
                  errors.phone?.message && (errors.phone?.message as string)
                }
              >
                <Controller
                  name="phone"
                  control={control}
                  rules={{ required: t('login:errors.required') as string }}
                  render={({ field: { onChange, value } }) => (
                    <PhoneNumberInput
                      fullWidth
                      country={country.toString().toLowerCase()}
                      onChange={onChange}
                      value={value}
                    />
                  )}
                />
              </LabelInput>
              <div className="mt-8">
                <Button
                  type="submit"
                  className="w-full"
                  iconAfter={<FaChevronRight />}
                >
                  {t('login:register.continue')}
                </Button>
              </div>
            </form>
          </div>
        )

      case 2:
        return (
          <div className="flex flex-col gap-4 w-full">
            {renderStepIndicator()}

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {t('login:register.whatsYourName')}
              </h2>
              <p className="text-gray-600">
                {t('login:register.enterNameToContinue')}
              </p>
            </div>

            <form onSubmit={handleSubmit(handleNameStep)} className="w-full">
              <TextInput
                id="firstName"
                type="text"
                label={t('account:name')}
                vertical
                isError={!!errors.firstName}
                placeholder="John Smith"
                helperText={
                  errors?.firstName?.message &&
                  (errors?.firstName?.message as string)
                }
                {...register('firstName', {
                  required: t('login:errors.required') as string,
                })}
              />
              <div className="mt-8">
                <Button
                  type="submit"
                  className="w-full"
                  iconAfter={<FaChevronRight />}
                >
                  {t('login:register.continue')}
                </Button>
              </div>
            </form>
          </div>
        )

      case 3:
        return (
          <div className="flex flex-col gap-4 w-full">
            {renderStepIndicator()}

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {t('login:register.createPassword')}
              </h2>
              <p className="text-gray-600">
                {t('login:register.enterPasswordToComplete')}
              </p>
            </div>

            <form
              onSubmit={handleSubmit(
                submitRegistration as SubmitHandler<FieldValues>
              )}
              className="w-full"
            >
              <div className="box-col-full">
                <Input
                  id="password"
                  placeholder={t('login:loginModal.password') as string}
                  type="password"
                  autoComplete="new-password"
                  showPasswordToggler
                  className={errors.password ? 'border-red-500' : ''}
                  {...register('password', {
                    required: t('login:errors.required') as string,
                    minLength: {
                      value: 8,
                      message: t('login:errors.passwordTooShort'),
                    },
                    validate: val =>
                      validatePassword(val) ||
                      (t('login:errors.strongPassword') as string),
                  })}
                />
                {errors?.password?.message && (
                  <Text className="text-red-500 text-sm mt-1">
                    {errors.password.message as string}
                  </Text>
                )}

                <Input
                  id="confirm-password"
                  placeholder={t('login:register.passwordAgain') as string}
                  type="password"
                  autoComplete="new-password"
                  showPasswordToggler
                  className={errors.passwordAgain ? 'border-red-500' : ''}
                  {...register('passwordAgain', {
                    required: t('login:errors.required') as string,
                    validate: val =>
                      val === watchAllFields.password ||
                      (t('login:errors.passwordNotSame') as string),
                  })}
                />
                {errors.passwordAgain?.message && (
                  <Text className="text-red-500 text-sm mt-1">
                    {errors.passwordAgain.message as string}
                  </Text>
                )}
              </div>

              <Box css={{ margin: '$normal 0' }}>
                <Checkbox
                  name="privacyConsent"
                  isChecked={hasPrivacyConsent}
                  invalid={!hasPrivacyConsent}
                  onChange={() => setHasPrivacyConsent(!hasPrivacyConsent)}
                />
                <Text css={!hasPrivacyConsent ? { color: '$warn' } : {}}>
                  {t('login:register.consent')}
                  <Link to={LinkToGuides.privacyPolicy} target="_blank">
                    {t('login:register.privacy')}
                  </Link>
                  {` & `}
                  <Link to={LinkToGuides.termsOfService} target="_blank">
                    {t('login:register.terms')}
                  </Link>
                </Text>
              </Box>

              <div className="mt-8">
                <Button
                  type="submit"
                  disabled={isLoading || !hasPrivacyConsent}
                  className="w-full"
                  iconAfter={
                    isLoading ? <Spinner size="small" /> : <FaPaperPlane />
                  }
                >
                  {isLoading ? t('common:loading') : t('login:register.here')}
                </Button>
              </div>
            </form>
          </div>
        )

      default:
        return null
    }
  }

  const renderCurrentStep = () => renderEmailFlow()

  return (
    <>
      <div className="pt-6">{renderCurrentStep()}</div>
    </>
  )
}

export default RegisterForm
