import { Translate } from 'next-translate'
import useTranslation from 'next-translate/useTranslation'
import { UseFormReturn } from 'react-hook-form'

import { useEnrolState } from '@/stores/enrolContext'
import { EnrollmentFieldFlag, StudentPrimaryIdentifier } from '@/types'
import { validateEmail, validatePhone } from '@/utils/validate'

import PhoneNumberField from './PhoneNumberField'
import TextAnswerField from './TextAnswerField'

type PropsType = {
  form: UseFormReturn<any, any>
  currentStep?: number
}

export const handlePhoneInputChange = (phone: string, t: Translate): string | undefined => {
  if (!phone || phone.length < 4) {
    return t('errors:PAYMENT.invalidPhone')
  } else if (!validatePhone(phone)) {
    return t('errors:PAYMENT.invalidPhone')
  } else {
    return undefined
  }
}

const RequiredFields = ({ form, currentStep = 0 }: PropsType): JSX.Element => {
  const { t } = useTranslation()

  const { school } = useEnrolState()

  const studentPrimaryIdentifier = school?.studentPrimaryIdentifier
  const isEmailPrimary = studentPrimaryIdentifier === StudentPrimaryIdentifier.EMAIL

  return (
    <>
      <TextAnswerField
        form={form}
        name={`${EnrollmentFieldFlag.applicant}[${currentStep}].Name`}
        label={t('enrol:payment.name')}
        required
        rules={{
          required: t('errors:VALIDATE.FIELD_REQUIRED') as string,
        }}
      />

      <PhoneNumberField
        label={t('enrol:payment.phone')}
        required
        name={`${EnrollmentFieldFlag.applicant}[${currentStep}].Phone`}
        form={form}
        rules={{
          required: t('errors:VALIDATE.FIELD_REQUIRED') as string,
          validate: (value: string) => handlePhoneInputChange(value, t),
        }}
      />
      <TextAnswerField
        form={form}
        name={`${EnrollmentFieldFlag.applicant}[${currentStep}].Email`}
        label={t('enrol:payment.email')}
        required={isEmailPrimary}
        rules={{
          required: isEmailPrimary ? (t('errors:VALIDATE.FIELD_REQUIRED') as string) : false,
          validate: (value: string) =>
            isEmailPrimary && !validateEmail(value)
              ? (t('errors:VALIDATE.INVALID_EMAIL') as string)
              : undefined,
        }}
      />
    </>
  )
}
export default RequiredFields
