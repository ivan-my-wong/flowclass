import { forwardRef, type HTMLAttributes } from 'react'

import useFormField from '@/hooks/useFormField'
import { cn } from '@/utils/cn'

const FormDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField()

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn('text-sm text-gray-500', className)}
      {...props}
    />
  )
})
FormDescription.displayName = 'FormDescription'

export default FormDescription
