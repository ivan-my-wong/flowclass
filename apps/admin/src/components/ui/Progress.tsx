import * as React from 'react'

import * as ProgressPrimitive from '@radix-ui/react-progress'

import { cn } from '@/utils/cn'

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    className?: string
    indicatorClassName?: string
  }
>(({ className, indicatorClassName, value, ...props }, ref) => {
  const remaining = React.useMemo(() => 100 - (value || 0), [value])
  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        'relative h-4 w-full overflow-hidden rounded-md bg-gray-300',
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          'h-full w-full flex-1 bg-primary transition-all rounded-md',
          remaining >= 100 && 'bg-primary',
          remaining <= 20 && 'bg-yellow-500',
          remaining <= 10 && 'bg-warn',
          indicatorClassName
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
