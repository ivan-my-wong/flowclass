import { ComponentProps, forwardRef } from 'react'

import { DefaultTFuncReturn } from 'i18next'

import { DataTestId } from '@/types/common'
import { cn } from '@/utils/cn'

import Box from '../Containers/Box'
import Text from '../Texts/Text'

import Label from './Label'
import RawInput from './RawInput'

export type TextInputLabelProps = {
  fullWidth?: boolean
  className?: string
} & ComponentProps<typeof Label>

export const TextInputLabel = ({
  fullWidth,
  className,
  ...props
}: TextInputLabelProps) => (
  <Label
    className={cn(
      'flex items-center shrink-0 pl-0 text-sm',
      fullWidth
        ? 'w-full max-w-full sm:my-2'
        : 'w-[30%] min-w-[80px] max-w-[40%] shrink-0',
      className
    )}
    {...props}
  />
)

export type TextInputProps = {
  isError?: boolean
  label?: DefaultTFuncReturn | string
  placeholder?: DefaultTFuncReturn | string
  helperText?: DefaultTFuncReturn | string
  vertical?: boolean
  boxProps?: Omit<ComponentProps<typeof Box>, 'children'>
  required?: boolean
  containerClassName?: string
} & ComponentProps<typeof RawInput> &
  DataTestId

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      isError = false,
      label,
      placeholder = '',
      vertical,
      helperText,
      boxProps,
      required = false,
      containerClassName,
      dataTestId,
      ...props
    },
    ref
  ) => {
    return (
      <Box
        responsive
        {...boxProps}
        direction={vertical ? 'column' : 'row'}
        align={vertical ? 'flex-start' : 'center'}
        className={cn(
          vertical && 'items-start',
          !vertical && 'md:items-start',
          containerClassName
        )}
      >
        {label && (
          <TextInputLabel fullWidth={!!vertical}>
            <>
              {label}
              {required && <span className="text-warn">*</span>}
            </>
          </TextInputLabel>
        )}

        <Box
          direction="column"
          align="flex-start"
          gap="none"
          className="min-w-0 flex-1"
        >
          <RawInput
            placeholder={placeholder}
            error={isError}
            {...props}
            ref={ref}
            className={cn(
              props.className,
              'w-full ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none placeholder:text-muted-foreground'
            )}
            data-testid={dataTestId}
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

TextInput.displayName = 'TextInput'

export default TextInput
