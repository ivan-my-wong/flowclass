import * as React from 'react'

import * as DialogPrimitive from '@radix-ui/react-dialog'
import { SubmitHandler, UseFormReturn } from 'react-hook-form'
import { LuX } from 'react-icons/lu'

import Form from '@/components/ui/Form'
import { cn } from '@/utils/cn'

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(
  ({ className, ...props }, ref): React.ReactElement => (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn(
        'fixed inset-0 z-modal-backdrop bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        className
      )}
      {...props}
    />
  )
)
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    scrollable?: boolean
  }
>(
  (
    {
      className,
      children,
      scrollable,
      // Explicitly default to undefined so the prop key is always present on
      // the Radix element. Radix uses this as the documented opt-out signal
      // for the "Missing `Description` or `aria-describedby={undefined}`"
      // warning when a dialog intentionally has no description.
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref
  ): React.ReactElement => (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        aria-describedby={ariaDescribedBy}
        className={cn(
          'dialog-content data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
          className,
          scrollable && 'dialog-content--scrollable'
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
)
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.ReactElement => (
  <div className={cn('dialog-header', className)} {...props}>
    {children}
    <DialogPrimitive.Close className="dialog-btn__close data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
      <LuX className="h-4 w-4" />
      <span className="sr-only">Close</span>
    </DialogPrimitive.Close>
  </div>
)
DialogHeader.displayName = 'DialogHeader'

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.ReactElement => (
  <div className={cn('dialog-footer', className)} {...props} />
)
DialogFooter.displayName = 'DialogFooter'

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(
  ({ className, ...props }, ref): React.ReactElement => (
    <DialogPrimitive.Title
      ref={ref}
      className={cn(
        'text-lg font-semibold leading-none tracking-tight',
        className
      )}
      {...props}
    />
  )
)
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(
  ({ className, ...props }, ref): React.ReactElement => (
    <DialogPrimitive.Description
      ref={ref}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
)
DialogDescription.displayName = DialogPrimitive.Description.displayName

const DialogBody = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'>
>(
  ({ className, ...props }, ref): React.ReactElement => (
    <div
      ref={ref}
      className={cn('dialog-body text-muted-foreground', className)}
      {...props}
    />
  )
)
DialogDescription.displayName = DialogPrimitive.Description.displayName

const withFormDialogContent = (
  children: React.ReactNode | React.ReactNode[],
  formData: UseFormReturn<any>,
  onSubmit: SubmitHandler<any>,
  scrollable?: boolean,
  className?: string
): React.ReactElement => {
  return (
    <DialogContent className={className} scrollable={scrollable}>
      <Form {...formData}>
        <form onSubmit={formData.handleSubmit(onSubmit)}>{children}</form>
      </Form>
    </DialogContent>
  )
}
export {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  withFormDialogContent,
}
