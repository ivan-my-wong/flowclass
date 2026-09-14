import { useState } from 'react'

import { UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { LuSearch } from 'react-icons/lu'

import Text from '@/components/Texts/Text'
import Form from '@/components/ui/Form'
import { Input } from '@/components/ui/Inputs/Input'
import { getFreeDomainList } from '@/constants/domain'
import { validateDomain } from '@/utils/validate'

export const SetDomainStepPreview = ({ siteName }: { siteName: string }) => {
  return (
    <div className="flex w-full rounded-xl lg:rounded-l-xl border lg:border-r-0 border-gray-500 px-3 py-2 gap-2 bg-white">
      <LuSearch className="text-gray-500" />
      <Text bold>
        {siteName
          ? `${siteName.toLowerCase()}.flowclass.io`
          : 'educatorname.flowclass.io'}
      </Text>
    </div>
  )
}

const SetDomainStep = ({ formSchool }: { formSchool: UseFormReturn<any> }) => {
  const selectedDomain = getFreeDomainList[0]
  const { t } = useTranslation()

  return (
    <Form {...formSchool}>
      <div className="flex flex-col items-center gap-8 p-4">
        {/* Profile Picture and Form Fields Layout */}
        <div className="box-responsive-full items-start gap-8">
          {/* Profile Picture Section - Left Side. TODO - We need to create the logo after the site is created
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center overflow-hidden border-2 border-primary/20">
                {schoolLogo ? (
                  <ImageAspect
                    src={getS3FileUrl(schoolLogo)}
                    alt="School logo"
                    className="w-full h-full object-cover"
                    width="100%"
                    height="100%"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <Text className="text-white text-2xl font-bold">
                      {formSchool
                        .watch('schoolName')
                        ?.charAt(0)
                        ?.toUpperCase() || 'S'}
                    </Text>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1">
                <ImageUploader
                  directory={MediaFileDirectory.INSTITUTION}
                  onSuccess={handleLogoUpload}
                  aspect={1}
                />
              </div>
            </div>
          </div> */}

          {/* Form Fields Section - Right Side */}
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

            {/* Domain */}
            <div className="space-y-2">
              <Text className="text-sm font-medium">
                {t('onboarding:welcome.siteDomain')}{' '}
                <span className="text-red-500">*</span>
              </Text>
              <div className="flex items-center h-12 border-2 pr-4 border-gray-200 rounded-xl focus-within:border-primary">
                <Input
                  {...formSchool.register('siteDomain', {
                    onChange: e => {
                      // Replace non-allowed characters with dashes and convert to lowercase
                      const value = e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9-]/g, '-') // allow only letters, digits, hyphen
                        .replace(/-+/g, '-') // collapse multiple dashes
                        .replace(/^-+|-+$/g, '') // trim dashes at ends
                        .slice(0, 63)

                      formSchool.setValue('siteDomain', value)
                    },
                    validate: (val: string) => {
                      if (!val) {
                        return t('onboarding:errors.required') as string
                      }
                      if (val.length < 3) {
                        return t('onboarding:errors.tooShort') as string
                      }
                      if (!validateDomain(val)) {
                        return t('onboarding:errors.invalidDomain') as string
                      }

                      return undefined
                    },
                  })}
                  placeholder="example-school"
                  className="flex-1 border-0 focus:ring-0 text-lg"
                />
                <Text className="font-medium text-lg">.{selectedDomain}</Text>
              </div>
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
