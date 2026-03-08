import { ComponentPropsWithoutRef, ElementRef, forwardRef } from 'react'

import * as LabelPrimitive from '@radix-ui/react-label'
import { clsx } from 'clsx'

import useFormField from '@/hooks/useForm'

import { Label } from '../Inputs/LabelInput'

const FormLabel = forwardRef<
  ElementRef<typeof LabelPrimitive.Root>,
  { required?: boolean } & ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, children, required, ...props }, ref) => {
  const { error, formItemId } = useFormField()

  return (
    <Label
      ref={ref}
      className={clsx('my-1', error && 'text-destructive', className)}
      htmlFor={formItemId}
      {...props}
    >
      {children}
      {required && <span className="text-warn ml-1">*</span>}
    </Label>
  )
})
FormLabel.displayName = 'FormLabel'

export default FormLabel
