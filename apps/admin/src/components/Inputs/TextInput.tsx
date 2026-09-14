import { ComponentProps, forwardRef } from 'react'

import { DefaultTFuncReturn } from 'i18next'

import { styled, theme } from '@/styles'
import { DataTestId } from '@/types/common'
import { cn } from '@/utils/cn'

import Box from '../Containers/Box'
import Text from '../Texts/Text'

import Label from './Label'
import RawInput from './RawInput'

export const TextInputLabel = styled(Label, {
  width: '30%',
  maxWidth: '40%',
  alignItems: 'center',
  display: 'flex',
  // height: '100%',
  paddingLeft: 0,
  fontSize: '$normal',
  flexShrink: 0,
  '@sm': {
    width: '100%',
    maxWidth: 'unset',
    my: '$2',
  },
  variants: {
    fullWidth: {
      true: {
        maxWidth: '100%',
        width: '100%',
      },
    },
  },
})

export type TextInputProps = {
  isError?: boolean
  label?: DefaultTFuncReturn | string
  placeholder?: DefaultTFuncReturn | string
  helperText?: DefaultTFuncReturn | string
  vertical?: boolean
  boxProps?: Omit<ComponentProps<typeof Box>, 'children'>
  required?: boolean
  containerCSSProps?: ComponentProps<typeof Box>['css']
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
      containerCSSProps,
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
        css={
          vertical
            ? { alignItems: 'flex-start', ...containerCSSProps }
            : { '@md': { alignItems: 'flex-start' }, ...containerCSSProps }
        }
      >
        {label && (
          <TextInputLabel fullWidth={vertical}>
            <>
              {label}
              {required && (
                <span style={{ color: theme.colors.warn.toString() }}>*</span>
              )}
            </>
          </TextInputLabel>
        )}

        <Box direction="column" align="flex-start">
          <RawInput
            placeholder={placeholder}
            error={isError}
            {...props}
            ref={ref}
            className={cn(
              props.className,
              'ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none placeholder:text-muted-foreground'
            )}
            css={{
              width: '100%',
            }}
            data-testid={dataTestId}
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

export default TextInput
