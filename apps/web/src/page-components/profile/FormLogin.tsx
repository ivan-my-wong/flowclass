import { useState } from 'react'

import useTranslation from 'next-translate/useTranslation'
import { UseFormReturn } from 'react-hook-form'
import { ImWhatsapp } from 'react-icons/im'
import { MdEdit, MdLoop, MdVisibility, MdVisibilityOff } from 'react-icons/md'

import Button from '@/components/Buttons/Button'
import Form from '@/components/Form'
import PhoneNumberField from '@/page-components/enrol/ApplicationFormSteps/PhoneNumberField'
import { handlePhoneInputChange } from '@/page-components/enrol/ApplicationFormSteps/RequiredFields'
import { PhoneContactMethod, School } from '@/types/school'
import { getContactMethodLink } from '@/utils/contact'

type FormLoginProps = {
  form: UseFormReturn<any, any>
  handleLogin: (value: any) => void
  isLoading: boolean
  school: School
}

const FormLogin = ({ form, handleLogin, isLoading, school }: FormLoginProps) => {
  const { t } = useTranslation()
  const [showPassword, setShowPassword] = useState(false)

  const handleWhatsAppContact = () => {
    const contactLink = getContactMethodLink({
      contactId: school?.contactId,
      contactMethod: school?.phoneContactMethod ?? PhoneContactMethod.WhatsApp,
      phone: school.phone ?? '',
      schoolUrl: school?.url ?? '',
      domain: window.location.hostname,
      customMessage: t('profile:login.help.whatsappMessage', {
        schoolName: school?.name ?? '',
      }),
    })

    if (contactLink) {
      window.open(contactLink, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="box-col-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleLogin)} className="box-col-full">
          <PhoneNumberField
            label={t('profile:login.phoneNumber')}
            required
            name={'phone'}
            form={form}
            rules={{
              required: t('errors:VALIDATE.FIELD_REQUIRED') as string,
              validate: (value: string) => handlePhoneInputChange(value, t),
            }}
            dataTestId="login-phone-field"
          />

          <div className="mb-4 w-full">
            <label htmlFor="aliasPassword" className="text-md mb-2 block">
              {t('profile:login.password')}
              <span className="text-warn ml-1 text-base">*</span>
            </label>
            <div className="relative">
              <input
                id="aliasPassword"
                type={showPassword ? 'text' : 'password'}
                {...form.register('aliasPassword', {
                  required: t('errors:VALIDATE.FIELD_REQUIRED') as string,
                  minLength: {
                    value: 8,
                    message: t('profile:login.passwordTooShort') as string,
                  },
                })}
                placeholder={t('profile:login.password')}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="login-password-field"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                {showPassword ? (
                  <MdVisibilityOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <MdVisibility className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <Button
            className="w-full bg-blue-600 text-white hover:bg-blue-700"
            type="submit"
            data-testid="login-btn"
            disabled={isLoading}
          >
            {isLoading && <MdLoop className="mr-2 animate-spin" />}
            {t('profile:login.loginButton')}
          </Button>
        </form>
      </Form>

      {/* New Student Information Box */}
      <div className="w-full rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-2">
          <MdEdit className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
          <div>
            <h3 className="mb-2 font-semibold text-blue-900">
              {t('profile:login.newStudent.title')}
            </h3>
            <p className="sm leading-relaxed text-blue-800">
              {t('profile:login.newStudent.description')}
            </p>
            <p className="mt-2 text-sm text-blue-700">{t('profile:login.newStudent.example')}</p>
          </div>
        </div>
      </div>

      {/* Help/Support Section */}
      <div className="flex w-full flex-col items-center justify-between gap-2 md:flex-row">
        <p>{t('profile:login.help.text')}</p>
        <Button onClick={handleWhatsAppContact} variant="outlined" iconBefore={<ImWhatsapp />}>
          {t('profile:login.help.whatsappButton')}
        </Button>
      </div>
    </div>
  )
}

export default FormLogin
