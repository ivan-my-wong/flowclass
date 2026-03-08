import { UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { LuSearch } from 'react-icons/lu'

import Text from '@/components/Texts/Text'
import Form from '@/components/ui/Form'
import { Input } from '@/components/ui/Inputs/Input'
import { validateFreeFormDomain } from '@/utils/validate'

export const SetDomainStepPreview = ({
  siteName,
}: {
  siteName: string
}): JSX.Element => {
  return (
    <div className="flex w-full rounded-xl lg:rounded-l-xl border lg:border-r-0 border-gray-500 px-3 py-2 gap-2 bg-white">
      <LuSearch className="text-gray-500" />
      <Text bold>{siteName || 'example.com'}</Text>
    </div>
  )
}

interface SetDomainStepProps {
  // Form includes schoolName, siteDomain, email, phone, country
  formSchool: UseFormReturn<Record<string, unknown>>
}

const SetDomainStep = ({ formSchool }: SetDomainStepProps): JSX.Element => {
  const { t } = useTranslation()

  return (
    <Form {...formSchool}>
      <div className="flex flex-col items-center gap-8 p-4">
        <div className="box-responsive-full items-start gap-8">
          <div className="flex-1 space-y-6">
            {/* School Name */}
            <div className="space-y-2">
              <Text className="text-sm font-medium">
                {t('onboarding:welcome.schoolName')}{' '}
                <span className="text-red-500">*</span>
              </Text>
              <Input
                placeholder={
                  t('onboarding:welcome.schoolNamePlaceholder') as string
                }
                {...formSchool.register('schoolName')}
                className="w-full h-12 px-4 text-lg border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-0"
              />
              {formSchool.formState.errors.schoolName && (
                <Text className="text-sm text-red-500">
                  {formSchool.formState.errors.schoolName.message as string}
                </Text>
              )}
            </div>

            {/* Domain - free-form, no preset suffix */}
            <div className="space-y-2">
              <Text className="text-sm font-medium">
                {t('onboarding:welcome.siteDomain')}{' '}
                <span className="text-red-500">*</span>
              </Text>
              <Input
                {...formSchool.register('siteDomain', {
                  onChange: e => {
                    const value = e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9.-]/g, '')
                      .slice(0, 253)
                    formSchool.setValue('siteDomain', value)
                  },
                  validate: (val: unknown) => {
                    const s = String(val ?? '')
                    if (!s.trim()) {
                      return t('onboarding:errors.required') as string
                    }
                    if (!validateFreeFormDomain(s)) {
                      return t('onboarding:errors.invalidDomain') as string
                    }
                    return undefined
                  },
                })}
                placeholder="example.com"
                className="w-full h-12 px-4 text-lg border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-0"
              />
              {formSchool.formState.errors.siteDomain && (
                <Text className="text-sm text-red-500">
                  {formSchool.formState.errors.siteDomain.message as string}
                </Text>
              )}
            </div>
          </div>
        </div>
      </div>
    </Form>
  )
}

export default SetDomainStep
