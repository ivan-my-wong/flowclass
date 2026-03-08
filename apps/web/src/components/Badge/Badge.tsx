import * as React from 'react'

import { type VariantProps, cva } from 'class-variance-authority'

import { cn } from '@/utils/cn'

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-textContrast hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-textContrast hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-textContrast hover:bg-destructive/80',
        outline: '!bg-gray-200 text-foreground',
        error: 'border-transparent bg-red-200 text-red-500 hover:bg-red-200/80',
        success: 'border-transparent bg-green-200 text-green-500 hover:bg-green-200/80',
        warning: 'border-transparent bg-yellow-400 text-yellow-foreground hover:bg-yellow-500',
        light: 'border-transparent bg-gray-200 text-text',
        dark: 'border-transparent bg-gray-500 text-textContrast hover:bg-gray-500/80',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps): JSX.Element {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
