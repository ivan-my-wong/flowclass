import ReactPhoneInput from 'react-phone-input-2'

import { cn } from '@/utils/cn'

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

const phoneInputClasses = cn(
  'bg-background-layer-2 text-text',
  '[&_.form-control]:!bg-background [&_.form-control]:text-text [&_.form-control]:border-border',
  '[&_.country-list]:!bg-background [&_.country-list]:text-text',
  '[&_.country.highlight]:text-text-contrast [&_.country.highlight]:!bg-primary',
  '[&_.country:hover]:bg-background-layer-2 [&_.country:hover]:text-primary-subtle',
  '[&_.dial-code]:unset'
)

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  country,
  value,
  onChange,
  fullWidth = false,
  disabled = false,
}) => {
  return (
    <PhoneInput
      disabled={disabled}
      inputStyle={{ width: fullWidth ? '100%' : 'auto', minHeight: '3rem' }}
      country={country}
      value={value}
      preferredCountries={['hk']}
      onChange={phone => onChange(phone)}
      containerClass={phoneInputClasses}
    />
  )
}

export default PhoneNumberInput
