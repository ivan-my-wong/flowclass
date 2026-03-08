import { forwardRef } from 'react'

import { DefaultTFuncReturn } from 'i18next'
import { ComponentPropsWithRef } from 'react-spring'

import { cn } from '@/utils/cn'

import Text from '../Texts/Text'
import Box from '../ui/Box'

import { TextInputLabel } from './TextInput'

type TextAreaProps = {
  rows?: number
  disabled?: boolean
  value?: string
  defaultValue?: string
  readOnly?: boolean
  resize?: boolean
  label?: DefaultTFuncReturn | string
  required?: boolean
  isError?: boolean
  helperText?: DefaultTFuncReturn | string
  vertical?: boolean
  className?: string
} & ComponentPropsWithRef<'textarea'>

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      rows,
      disabled,
      value,
      defaultValue,
      label,
      required = false,
      isError = false,
      helperText,
      vertical,
      resize = true,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <Box
        direction={vertical ? 'col' : 'row'}
        align={vertical ? 'start' : 'center'}
      >
        {label && (
          <TextInputLabel
            fullWidth={!!vertical}
            className="w-[30%] max-w-[40%]"
          >
            <>
              <span className="whitespace-nowrap"> {label}</span>
              {required && <Text type="error">*</Text>}
            </>
          </TextInputLabel>
        )}
        <Box direction="col" align="start">
          <textarea
            rows={rows ?? 10}
            disabled={disabled ?? false}
            ref={ref}
            value={value}
            defaultValue={defaultValue}
            className={cn(
              'p-2 w-full rounded-md outline-none bg-background border border-border text-text caret-text',
              'hover:enabled:border-border focus:enabled:border-border focus:enabled:ring-2 focus:enabled:ring-border-primary focus:enabled:ring-offset-0',
              'placeholder:text-text-subtle disabled:bg-background-disabled',
              isError &&
                'border-warn hover:enabled:border-warn focus:enabled:border-warn',
              !resize && 'resize-none',
              className
            )}
            {...props}
          />
          {helperText && (
            <Text
              size="small"
              type={isError ? 'error' : undefined}
              className={isError ? 'text-warn' : 'text-text'}
            >
              {helperText}
            </Text>
          )}
        </Box>
      </Box>
    )
  }
)

TextArea.displayName = 'TextArea'

export default TextArea
