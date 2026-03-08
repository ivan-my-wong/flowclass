import { ComponentProps, forwardRef, InputHTMLAttributes } from 'react'

import { clsx } from 'clsx'

import Box from '../Containters/Box'
import Text from '../Texts/Text'

export type TextInputProps = {
  isError?: boolean
  label?: string
  placeholder?: string
  helperText?: string
  vertical?: boolean
  boxProps?: Omit<ComponentProps<typeof Box>, 'children'>
} & InputHTMLAttributes<HTMLInputElement>

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ isError = false, label, placeholder = '', vertical, helperText, boxProps, ...props }, ref) => {
    const boxNames = clsx('w-full', vertical ? 'box-col justify-start items-start' : 'box-row')
    return (
      <div className={`p-0 ${boxNames}`} {...boxProps}>
        {label && (
          <p
            className={`input-label mb-0 mt-4 w-full pl-0 lg:mr-2 lg:w-1/3 ${
              vertical ? 'lg:w-full' : ''
            }`}
          >
            {label}
          </p>
        )}

        <input
          placeholder={placeholder}
          className={isError ? 'raw-input-error' : 'raw-input'}
          {...props}
          ref={ref}
        />

        {helperText && (
          <Text variant={isError ? 'error' : undefined} className="mt-0 text-left text-sm">
            {helperText}
          </Text>
        )}
      </div>
    )
  }
)

TextInput.displayName = 'TextInput'
export default TextInput
