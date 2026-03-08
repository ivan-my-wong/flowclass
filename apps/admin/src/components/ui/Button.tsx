import * as React from 'react'

import { Slot } from '@radix-ui/react-slot'
import { cva, VariantProps } from 'class-variance-authority'
import { LuLoader2 } from 'react-icons/lu'

import { cn } from '@/utils/cn'

export type ButtonVariant =
  | 'default'
  | 'destructive'
  | 'primary-outline'
  | 'outline'
  | 'secondary'
  | 'ghost'
  | 'link'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-primary dark:bg-primary-dark text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        'destructive-outline':
          'border border-destructive text-destructive hover:bg-destructive/10',
        'primary-outline':
          'border border-primary text-primary hover:bg-primary/10',
        outline:
          'border border-input bg-background dark:bg-dark-background hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        disabled:
          'bg-gray-50 text-gray-400 hover:bg-gray-100 border border-gray-200',
      },
      size: {
        default: 'h-10 px-4 py-2',
        xs: 'h-8 rounded-sm px-2',
        sm: 'h-9 rounded-md px-3',
        md: 'h-10 px-4 py-2',
        lg: 'h-11 rounded-md px-8',
        xl: 'h-12 rounded-md px-10',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  iconBefore?: React.ReactNode
  iconAfter?: React.ReactNode
  dataTestId?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      children,
      loading,
      iconBefore,
      iconAfter,
      dataTestId,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={props.disabled || loading}
        data-testid={dataTestId}
        {...props}
      >
        {loading && <LuLoader2 className="mr-2 h-4 w-4 animate-spin" />}
        {iconBefore && <span className="mr-2">{iconBefore}</span>}
        {children}
        {iconAfter && <span className="ml-2">{iconAfter}</span>}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
