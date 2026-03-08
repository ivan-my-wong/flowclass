import React, { type HTMLAttributes, useId } from 'react'

import { FormItemContext } from '@/contexts/FormContext'
import { cn } from '@/utils/cn'

const FormItem = React.forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn('space-y-2', className)} {...props} />
    </FormItemContext.Provider>
  )
})
FormItem.displayName = 'FormItem'

export default FormItem
