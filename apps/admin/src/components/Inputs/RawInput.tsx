import { forwardRef } from 'react'

import { cn } from '@/utils/cn'

type RawInputProps = {
  error?: boolean
  variants?: 'line' | 'border'
} & React.ComponentProps<'input'>

const RawInput = forwardRef<HTMLInputElement, RawInputProps>(
  ({ error, variants, className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'p-2 w-full rounded-md outline-none bg-background border border-border text-text caret-text',
        'hover:enabled:border-border focus:enabled:border-border focus:enabled:ring-2 focus:enabled:ring-primary focus:enabled:ring-offset-0',
        'placeholder:text-text-subtle disabled:bg-background-disabled',
        '[&[type=password]]:font-[Verdana] [&[type=password]]:tracking-wider',
        variants === 'line' &&
          'border-0 rounded-none bg-transparent border-b border-text',
        variants === 'border' &&
          'border border-background-layer-4 rounded-sm bg-transparent h-[38px]',
        error &&
          'border-warn hover:enabled:border-warn focus:enabled:border-warn',
        className
      )}
      {...props}
    />
  )
)

RawInput.displayName = 'RawInput'

export default RawInput
