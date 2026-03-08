import { ComponentProps } from 'react'

import { DefaultTFuncReturn } from 'i18next'

import { TextInputLabel } from '@/components/Inputs/TextInput'
import { cn } from '@/utils/cn'

import Text from '../Texts/Text'
import Box from '../ui/Box'

import RawInput from './RawInput'

// const TextInputLabel = styled(Label, {
//   width: '30%',
//   maxWidth: '40%',
//   alignItems: 'center',
//   display: 'flex',
//   height: '100%',
//   marginRight: '$2',
//   paddingLeft: 0,
//   flexShrink: 0,
//   '@sm': {
//     width: '100%',
//     my: '$2',
//   },
//   variants: {
//     fullWidth: {
//       true: {
//         width: '100%',
//       },
//     },
//   },
// })

export type TextInputProps = {
  isError?: boolean
  label?: DefaultTFuncReturn | string
  placeholder?: DefaultTFuncReturn | string
  helperText?: DefaultTFuncReturn | string
  vertical?: boolean
  boxProps?: Omit<ComponentProps<typeof Box>, 'children'>
} & ComponentProps<typeof RawInput>

export const LabelInput = ({
  isError = false,
  label,
  children,
  vertical,
  helperText,
  ...props
}: TextInputProps): JSX.Element => {
  return (
    <div
      {...props}
      className={cn(
        vertical ? 'box-col-full' : 'box-responsive-full',
        'md:items-center',
        props.className
      )}
    >
      {label && (
        <TextInputLabel
          fullWidth={vertical}
          css={{ maxWidth: vertical ? '100%' : '40%' }}
        >
          <span className="text-left w-full">{label}</span>
        </TextInputLabel>
      )}
      <Box direction="col" align="start">
        {children}

        {helperText && (
          <Text size="small" type={isError ? 'error' : undefined}>
            {helperText}
          </Text>
        )}
      </Box>
    </div>
  )
}

export default LabelInput
