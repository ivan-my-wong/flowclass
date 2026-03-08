import { useEffect, useState } from 'react'

import { UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import TextSearchSelector from '@/components/Selector/TextSearchSelector'
import Text from '@/components/Texts/Text'
import Form from '@/components/ui/Form'
import { countryConfig } from '@/constants/countryConfig'
import { CountryOption } from '@/pages/Setting/Site/RegionLanguageSetting'

interface SetCountryStepProps {
  formSchool: UseFormReturn<any>
}

// Create country options similar to RegionLanguageSetting
const countries = countryConfig.map(obj => ({
  name: obj.name,
  code: obj.code,
  nativeName: obj.nativeName,
}))

const options = countries.map((option, index) => ({
  index,
  name: option.name,
  label: `${option.nativeName} [${option.name}]`,
  code: option.code,
}))

const SetCountryStep = ({ formSchool }: SetCountryStepProps): JSX.Element => {
  const { t } = useTranslation()
  const [selectedCountryConfig, setSelectedCountryConfig] = useState<
    (typeof countryConfig)[0] | null
  >(null)
  const [selectedCountryOption, setSelectedCountryOption] =
    useState<CountryOption | null>(null)

  const handleCountryChange = (selectedOption: CountryOption) => {
    if (selectedOption) {
      const countryCode = selectedOption.code
      formSchool.setValue('country', countryCode)

      // Find country details for additional info
      const country = countryConfig.find(option => option.code === countryCode)
      if (country) {
        setSelectedCountryConfig(country)
      }

      // Set the selected country option
      setSelectedCountryOption(selectedOption)
    }
  }

  // Initialize selected country option when form value changes
  const formCountry = formSchool.watch('country')
  useEffect(() => {
    if (formCountry && !selectedCountryOption) {
      const countryOption = options.find(option => option.code === formCountry)
      if (countryOption) {
        setSelectedCountryOption(countryOption)

        // Find country details for additional info
        const country = countryConfig.find(
          option => option.code === formCountry
        )
        if (country) {
          setSelectedCountryConfig(country)
        }
      }
    }
  }, [formCountry, options, selectedCountryOption])

  return (
    <Form {...formSchool}>
      <div className="w-full px-6">
        {/* Form Fields */}
        <div className="w-full space-y-6">
          {/* Country Selection */}
          <div className="w-full space-y-2">
            <Text className="text-sm font-medium text-gray-700">
              {t('onboarding:welcome.country')}{' '}
              <span className="text-red-500">*</span>
            </Text>
            <TextSearchSelector
              options={options}
              selectOption={selectedCountryOption}
              width="100%"
              onChange={handleCountryChange}
            />
          </div>
        </div>

        {/* Regional Settings Preview - Full Width */}
        {selectedCountryConfig && (
          <div className="w-full mt-8 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <svg
                  className="w-6 h-6 text-white drop-shadow-sm"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <Text className="font-semibold text-gray-800 text-lg">
                  Regional Settings for {selectedCountryConfig.nativeName}
                </Text>
                <Text className="text-gray-600 text-sm">
                  {selectedCountryOption?.name} ({selectedCountryOption?.code})
                </Text>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-100">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <div>
                  <Text className="font-medium text-gray-700">Currency</Text>
                  <Text className="text-gray-600">
                    {selectedCountryConfig.currency}
                  </Text>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-100">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <div>
                  <Text className="font-medium text-gray-700">Time Zone</Text>
                  <Text className="text-gray-600">
                    {selectedCountryConfig.timezone.default.code}
                  </Text>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-100">
                <div className="w-3 h-3 bg-purple-500 rounded-full" />
                <div>
                  <Text className="font-medium text-gray-700">Locale</Text>
                  <Text className="text-gray-600">
                    {selectedCountryConfig.locale.default.nativeName}
                  </Text>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-100">
                <div className="w-3 h-3 bg-orange-500 rounded-full" />
                <div>
                  <Text className="font-medium text-gray-700">
                    Country Code
                  </Text>
                  <Text className="text-gray-600">
                    {selectedCountryConfig.code}
                  </Text>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Next Steps - Full Width */}
        <div className="w-full mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <svg
                className="w-6 h-6 text-white drop-shadow-sm"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div>
              <Text className="font-semibold text-blue-800 text-lg">
                Almost Ready!
              </Text>
              <Text className="text-blue-700 text-sm">
                Your Flowclass site will be created and you can start building
                your teaching business.
              </Text>
            </div>
          </div>
        </div>
      </div>
    </Form>
  )
}

export default SetCountryStep
