import React from 'react'

import * as LabelPrimitive from '@radix-ui/react-label'

import useFormField from '@/hooks/useFormField'
import { cn } from '@/utils/cn'

import { Label } from './Label'

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  { required?: boolean } & React.ComponentPropsWithoutRef<
    typeof LabelPrimitive.Root
  >
>(({ className, children, required, ...props }, ref) => {
  const { error, formItemId } = useFormField()

  return (
    <Label
      ref={ref}
      className={cn('font-semibold', error && 'text-destructive', className)}
      htmlFor={formItemId}
      {...props}
    >
      {children}
      {required && <span className="ml-1 text-warn">*</span>}
    </Label>
  )
})
FormLabel.displayName = 'FormLabel'

export default FormLabel
