import useTranslation from 'next-translate/useTranslation'
import { UseFormReturn } from 'react-hook-form'
import { MdLoop } from 'react-icons/md'

import Button from '@/components/Buttons/Button'
import Form from '@/components/Form'
import PhoneNumberField from '@/page-components/enrol/ApplicationFormSteps/PhoneNumberField'
import { handlePhoneInputChange } from '@/page-components/enrol/ApplicationFormSteps/RequiredFields'
import TextAnswerField from '@/page-components/enrol/ApplicationFormSteps/TextAnswerField'
import { StudentPrimaryIdentifier } from '@/types/school'
import { validateEmail } from '@/utils/validate'

type FormLoginProps = {
  form: UseFormReturn<any, any>
  handleFindProfile: (value: any) => void
  isLoading: boolean
  studentPrimaryIdentifier: StudentPrimaryIdentifier
}

const FormLogin = ({
  form,
  handleFindProfile,
  isLoading,
  studentPrimaryIdentifier,
}: FormLoginProps) => {
  const { t } = useTranslation()
  const isPhonePrimary = studentPrimaryIdentifier === StudentPrimaryIdentifier.PHONE
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFindProfile)} className="box-col-full">
        {isPhonePrimary && (
          <TextAnswerField
            form={form}
            name={'firstName'}
            label={t('common:fields.name')}
            required
            rules={{
              required: t('errors:VALIDATE.FIELD_REQUIRED') as string,
            }}
            dataTestId="login-name-field"
          />
        )}
        {!isPhonePrimary && (
          <TextAnswerField
            form={form}
            name={'email'}
            label={t('common:fields.email')}
            required
            rules={{
              required: t('errors:VALIDATE.FIELD_REQUIRED') as string,
              validate: (value: string) =>
                !validateEmail(value) ? (t('errors:VALIDATE.INVALID_EMAIL') as string) : undefined,
            }}
            dataTestId="login-email-field"
          />
        )}

        <PhoneNumberField
          label={t('common:fields.phone')}
          required
          name={'phone'}
          form={form}
          rules={{
            required: t('errors:VALIDATE.FIELD_REQUIRED') as string,
            validate: (value: string) => handlePhoneInputChange(value, t),
          }}
          dataTestId="login-phone-field"
        />
        <Button
          className="mt-4 w-full"
          type="submit"
          data-testid="find-my-profile-btn"
          disabled={isLoading}
        >
          {isLoading && <MdLoop className="mr-2 animate-spin" />}
          {t('school:profile.findMyProfile')}
        </Button>
      </form>
    </Form>
  )
}

export default FormLogin
