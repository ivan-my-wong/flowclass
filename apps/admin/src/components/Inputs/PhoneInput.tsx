// import '../styles/components/phoneInput.css'
import ReactPhoneInput from 'react-phone-input-2'

import { styled } from '../../styles'

import 'react-phone-input-2/lib/style.css'

// fix production not rendering
// https://github.com/bl00mber/react-phone-input-2/issues/533
// someone found side effect: If I am using this, I am not able to use countryCodeEditable={false} and country code is deleteable
const PhoneInput: typeof ReactPhoneInput =
  (ReactPhoneInput as any).default ?? ReactPhoneInput

type PhoneNumberInputProps = {
  country: string
  value: string
  onChange: (value: string) => void
  fullWidth?: boolean
  disabled?: boolean
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  country,
  value,
  onChange,
  fullWidth = false,
  disabled = false,
}) => {
  return (
    <StyledPhoneInput
      disabled={disabled}
      inputStyle={{ width: fullWidth ? '100%' : 'auto', minHeight: '3rem' }}
      country={country}
      value={value}
      preferredCountries={['hk']}
      onChange={phone => onChange(phone)}
    />
  )
}

export default PhoneNumberInput

const StyledPhoneInput = styled(PhoneInput, {
  backgroundColor: '$backgroundLayer2',
  color: '$text',
  '.form-control': {
    backgroundColor: '$background !important',
    color: '$text',
    borderColor: '$borderColor',
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
})
