// import '../styles/components/phoneInput.css'
import React from 'react'

import ReactPhoneInput from 'react-phone-input-2'

import 'react-phone-input-2/lib/style.css'

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
    <div className="[&_.form-control]:text-text [&_.form-control]:border-border [&_.form-control]:w-full [&_.country-list]:!bg-background [&_.country-list]:text-text [&_.country.highlight]:text-text-contrast [&_.country.highlight]:!bg-primary [&_.country:hover]:bg-background-layer-2 [&_.country:hover]:text-primary-subtle w-full">
      <PhoneInput
        inputStyle={{
          minHeight: '3rem',
          backgroundColor: disabled
            ? 'var(--color-background-disabled)'
            : 'var(--color-background)',
        }}
        dropdownStyle={{
          backgroundColor: disabled
            ? 'var(--color-background-disabled)'
            : 'var(--color-background)',
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
    </div>
  )
}

export default PhoneNumberInput
