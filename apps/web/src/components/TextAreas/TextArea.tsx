import { ComponentPropsWithRef, forwardRef } from 'react'

import clsx from 'clsx'

import Text from '../Texts/Text'
/* eslint-disable jsx-a11y/label-has-associated-control */

const textAreaClasses = clsx(
  'p-small p-medium',
  'w-full min-w-full',
  'rounded-medium',
  'outline-none',
  'bg-background',
  `border border-borderColor`,
  'text-text',
  'caret-text',
  'hover:border-borderColor focus:border-borderColor',
  'focus:border-primary',
  'placeholder:textSubtle',
  'bg-backgrounLayer3'
)
const textAreaInvalidClasses = 'border-secondary hover:border-secondary focus:border-secondary'

type TextAreaProps = {
  rows?: number
  invalid?: boolean
  helperText?: string
  isError?: boolean
} & ComponentPropsWithRef<'textarea'>

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ rows, invalid, helperText, isError, ...props }, ref) => {
    return (
      <>
        <textarea
          className={clsx(textAreaClasses, invalid ? textAreaInvalidClasses : '')}
          rows={rows ?? 10}
          ref={ref}
          {...props}
        />
        {helperText && (
          <Text variant={isError ? 'error' : undefined} className="mt-0 text-left text-sm">
            {helperText}
          </Text>
        )}
      </>
    )
  }
)

export default TextArea

TextArea.displayName = 'TextArea'
