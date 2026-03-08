import { forwardRef, type HTMLAttributes } from 'react'

import useFormField from '@/hooks/useFormField'
import { cn } from '@/utils/cn'

const FormMessage = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message) : children

  if (!body) {
    return null
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn(
        'text-sm font-medium text-destructive text-warn',
        className
      )}
      {...props}
    >
      {body}
    </p>
  )
})
FormMessage.displayName = 'FormMessage'

export default FormMessage
