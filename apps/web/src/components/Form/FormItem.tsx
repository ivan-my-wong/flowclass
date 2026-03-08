import { type HTMLAttributes, forwardRef, useId } from 'react'

import { clsx } from 'clsx'

import { FormItemContext } from '@/contexts/FormContext'

const FormItem = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const id = useId()

    return (
      <FormItemContext.Provider value={{ id }}>
        <div ref={ref} className={clsx('my-1', className)} {...props} />
      </FormItemContext.Provider>
    )
  }
)
FormItem.displayName = 'FormItem'

export default FormItem
