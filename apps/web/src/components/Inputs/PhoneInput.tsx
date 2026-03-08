import { forwardRef, useEffect, useState } from 'react'

import { useRecoilValue } from 'recoil'

import useTranslation from 'next-translate/useTranslation'
import PhoneInput from 'react-phone-input-2'

import Text from '@/components/Texts/Text'
import { countryNameToCode } from '@/constants/countryConfig'
import { useUserCountry } from '@/hooks/useLocalization'
import { SettingsState } from '@/stores/settingsData'
import { DataTestId } from '@/types/common'

type PhoneNumberInputProps = {
  field: any
  fullWidth?: boolean
  error?: boolean
  errorMessage?: string
  isDisabled?: boolean
  defaultValue?: string
} & DataTestId

const PhoneNumberInput = forwardRef(function PhoneNumberInput(
  {
    field,
    fullWidth,
    error,
    errorMessage,
    isDisabled = false,
    defaultValue,
    dataTestId,
  }: PhoneNumberInputProps,
  ref
) {
  const { t } = useTranslation()
  const { siteSettings } = useRecoilValue(SettingsState)

  const [country] = useUserCountry()
  const [phoneValue, setPhoneValue] = useState(defaultValue || field.value)

  const [userCountry, setUserCountry] = useState('hk')
  const countryCode =
    countryNameToCode(siteSettings?.country) ?? siteSettings.countryCode?.toLowerCase()

  useEffect(() => {
    const userCountry = (country as string)?.toLowerCase() || countryCode || 'hk'
    setUserCountry(userCountry)
  }, [country, countryCode])

  useEffect(() => {
    setPhoneValue(field.value)
  }, [field.value])

  return (
    <div className="w-full">
      <PhoneInput
        {...field}
        inputId="phone"
        disabled={isDisabled}
        value={phoneValue}
        onChange={(value: string) => {
          setPhoneValue(value)
          field.onChange(value)
        }}
        inputStyle={{
          width: fullWidth ? '100%' : 'auto',
          backgroundColor: isDisabled ? '#999999' : 'white',
        }}
        inputProps={{
          ref,
          id: 'phone',
          required: t('errors:VALIDATE.FIELD_REQUIRED') as string,
          'data-testid': dataTestId,
        }}
        country={field.value ? undefined : userCountry}
      />
      {/*{error && <div style={{ color: 'red' }}>{errorMessage}</div>}*/}
      {errorMessage && (
        <Text variant={error ? 'error' : undefined} className="mt-0 text-left text-sm">
          {errorMessage}
        </Text>
      )}
    </div>
  )
})

export default PhoneNumberInput
