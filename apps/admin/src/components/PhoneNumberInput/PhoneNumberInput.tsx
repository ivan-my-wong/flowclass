// import '../styles/components/phoneInput.css'
import React from 'react'

import ReactPhoneInput from 'react-phone-input-2'

import { styled, theme } from '../../styles'

import 'react-phone-input-2/lib/style.css'

// fix production not rendering
// https://github.com/bl00mber/react-phone-input-2/issues/533
// someone found side effect: If I am using this, I am not able to use countryCodeEditable={false} and country code is deleteable
const PhoneInput: typeof ReactPhoneInput =
  (ReactPhoneInput as any).default ?? ReactPhoneInput

type PhoneNumberInputProps = {
  country: string
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  country,
  value = '',
  onChange,
  disabled = false,
}) => {
  return (
    <StyledPhoneInput
      inputStyle={{
        minHeight: '3rem',
        backgroundColor: disabled
          ? theme.colors.backgroundDisabled.toString()
          : theme.colors.background.toString(),
      }}
      dropdownStyle={{
        backgroundColor: disabled
          ? theme.colors.backgroundDisabled.toString()
          : theme.colors.background.toString(),
      }}
      country={country}
      value={`${value}`}
      preferredCountries={['hk']}
      onChange={phone => onChange(phone)}
      disabled={disabled}
      inputProps={{
        required: true,
      }}
    />
  )
}

export default PhoneNumberInput

const StyledPhoneInput = styled(PhoneInput, {
  color: '$text',
  width: '100%',
  '.form-control': {
    color: '$text',
    borderColor: '$borderColor',
    width: '100% !important',
  },
  '.country-list': {
    backgroundColor: '$background !important',
    color: '$text',
  },
  '.country.highlight': {
    color: '$textContrast',
    backgroundColor: '$primary !important',
  },
  '.country': {
    '&:hover': {
      backgroundColor: '$backgroundLayer2',
      color: '$primarySubtle',
    },
  },
  '.dial-code': {
    css: 'unset',
  },
  '.flag-dropdown': {
    borderColor: '$borderColor',
  },
})
