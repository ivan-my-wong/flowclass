'use client'

import * as React from 'react'

import * as LabelPrimitive from '@radix-ui/react-label'
import { type VariantProps, cva } from 'class-variance-authority'
import { clsx } from 'clsx'

const labelVariants = cva('text-base peer-disabled:cursor-not-allowed peer-disabled:opacity-70')

const LabelInput = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root ref={ref} className={clsx(labelVariants(), className)} {...props} />
))
LabelInput.displayName = LabelPrimitive.Root.displayName

export { LabelInput as Label }
