import { type HTMLAttributes, forwardRef } from 'react'

import { clsx } from 'clsx'

import useFormField from '@/hooks/useForm'

const FormMessage = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => {
    const { error, formMessageId } = useFormField()
    const body = error ? String(error?.message) : children

    if (!body) {
      return null
    }

    return (
      <p
        ref={ref}
        id={formMessageId}
        className={clsx('text-sm font-medium', error ? 'text-warn' : '', className)}
        {...props}
      >
        {body}
      </p>
    )
  }
)
FormMessage.displayName = 'FormMessage'

export default FormMessage
