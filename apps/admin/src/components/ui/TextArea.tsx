import { ComponentPropsWithRef, forwardRef } from 'react'

import Text from '@/components/ui/Text'
import { cn } from '@/utils/cn'
/* eslint-disable jsx-a11y/label-has-associated-control */

const textAreaClasses = cn(
  'bg-background flex min-h-[60px] w-full rounded-md border border-input px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm'
)
const textAreaInvalidClasses =
  'border-secondary hover:border-secondary focus:border-secondary'

type TextAreaProps = {
  rows?: number
  invalid?: boolean
  helperText?: string
  isError?: boolean
  className?: string
} & ComponentPropsWithRef<'textarea'>

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ rows, invalid, helperText, isError, className, ...props }, ref) => {
    return (
      <>
        <textarea
          className={cn(
            textAreaClasses,
            invalid ? textAreaInvalidClasses : '',
            className
          )}
          rows={rows ?? 10}
          ref={ref}
          {...props}
        />
        {helperText && (
          <Text
            variant={isError ? 'error' : undefined}
            className="mt-0 text-left text-sm"
          >
            {helperText}
          </Text>
        )}
      </>
    )
  }
)

TextArea.displayName = 'TextArea'
export default TextArea
