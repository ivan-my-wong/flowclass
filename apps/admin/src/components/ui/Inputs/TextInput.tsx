import { ComponentProps, forwardRef, InputHTMLAttributes } from 'react'

import Box from '@/components/ui/Box'
import Text from '@/components/ui/Text'
import { cn } from '@/utils/cn'

export type TextInputProps = {
  isError?: boolean
  label?: string
  placeholder?: string
  helperText?: string
  variant?: 'line' | 'default'
  vertical?: boolean
  boxProps?: Omit<ComponentProps<typeof Box>, 'children'>
} & InputHTMLAttributes<HTMLInputElement>

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      isError = false,
      label,
      placeholder = '',
      vertical,
      variant = 'default',
      helperText,
      boxProps,
      ...props
    },
    ref
  ) => {
    const boxNames = cn(
      'w-full p-0',
      vertical ? 'box-col justify-start items-start' : 'box-row'
    )
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
          className={cn(
            variant === 'line' &&
              'p-2 border-b border-gray-300 focus:outline-none focus:border-primary',
            isError ? 'raw-input-error' : 'raw-input'
          )}
          {...props}
          ref={ref}
        />

        {helperText && (
          <Text
            variant={isError ? 'error' : undefined}
            className="mt-0 text-left text-sm"
          >
            {helperText}
          </Text>
        )}
      </div>
    )
  }
)

TextInput.displayName = 'TextInput'
