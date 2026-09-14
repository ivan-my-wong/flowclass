import { forwardRef } from 'react'

import { CSS } from '@stitches/react'
import { DefaultTFuncReturn } from 'i18next'
import { ComponentPropsWithRef } from 'react-spring'

import { styled } from '@/styles'

import Text from '../Texts/Text'
import Box from '../ui/Box'

import { TextInputLabel } from './TextInput'

export const StyledTextArea = styled('textarea', {
  padding: '$small',
  width: '100%',
  // minWidth: '100%',
  borderRadius: '$medium',
  outline: 'none',
  backgroundColor: '$background',
  border: '1px solid $borderColor',
  color: '$text',
  caretColor: '$text',
  '&:hover:enabled, &:focus:enabled': {
    borderColor: '$borderColor',
  },
  '&:focus:enabled': {
    focusOutline: '$borderColorPrimary',
  },
  '&::placeholder': {
    color: '$textSubtle',
  },
  '&:disabled': {
    backgroundColor: '$backgroundDisabled',
  },
  variants: {
    invalid: {
      true: {
        borderColor: '$secondary',
        '&:hover:enabled, &:focus:enabled': {
          borderColor: '$secondary',
        },
      },
    },
    resize: {
      false: { resize: 'none' },
    },
  },
})

type TextAreaProps = {
  rows?: number
  disabled?: boolean
  value?: string
  defaultValue?: string
  readOnly?: boolean
  resize?: boolean
  css?: CSS
  label?: DefaultTFuncReturn | string
  required?: boolean
  isError?: boolean
  helperText?: DefaultTFuncReturn | string
  vertical?: boolean
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
          <TextInputLabel css={{ width: '30%' }}>
            <>
              <span className="whitespace-nowrap"> {label}</span>
              {required && <Text css={{ color: '$warn' }}>*</Text>}
            </>
          </TextInputLabel>
        )}
        <Box direction="col">
          <StyledTextArea
            rows={rows ?? 10}
            disabled={disabled ?? false}
            {...props}
            ref={ref}
            value={value}
            defaultValue={defaultValue}
          />
          {helperText && (
            <Text
              size="small"
              type={isError ? 'error' : undefined}
              css={{ color: isError ? '$warn' : '$text' }}
            >
              {helperText}
            </Text>
          )}
        </Box>
      </Box>
    )
  }
)

export default TextArea
