import { type HTMLAttributes, forwardRef } from 'react'

import { clsx } from 'clsx'

import useFormField from '@/hooks/useForm'

const FormDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    const { formDescriptionId } = useFormField()

    return (
      <p
        ref={ref}
        id={formDescriptionId}
        className={clsx('text-muted-foreground text-sm', className)}
        {...props}
      />
    )
  }
)
FormDescription.displayName = 'FormDescription'

export default FormDescription
