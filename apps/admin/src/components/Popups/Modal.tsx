import { forwardRef } from 'react'

import {
  Close,
  Content,
  Description,
  Overlay,
  Portal,
  Root,
  Trigger,
} from '@radix-ui/react-dialog'
import { AiOutlineClose } from 'react-icons/ai'

import { cn } from '@/utils/cn'

import IconButton from '../Buttons/IconButton'

type DialogProps = {
  open?: boolean
  trigger?: React.ReactNode
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

export const StyledContent = forwardRef<
  React.ElementRef<typeof Content>,
  React.ComponentPropsWithoutRef<typeof Content>
>(({ className, ...props }, ref) => (
  <Content
    ref={ref}
    className={cn(
      'flex flex-col fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
      'max-w-[90%] min-w-[50%] md:min-h-[60vh] md:min-w-[70%] max-h-[90vh] overflow-y-auto',
      'rounded-lg pt-8 px-4 pb-4 bg-background z-[1050]',
      'data-[state=open]:animate-dialog-content data-[state=closed]:animate-none',
      'sm:min-h-[80vh] sm:min-w-[90%]',
      className
    )}
    {...props}
  />
))
StyledContent.displayName = 'StyledContent'

export const StyledOverlay = forwardRef<
  React.ElementRef<typeof Overlay>,
  React.ComponentPropsWithoutRef<typeof Overlay>
>((props, ref) => (
  <Overlay
    ref={ref}
    className="fixed inset-0 bg-overlay z-[1050] data-[state=open]:animate-dialog-overlay data-[state=closed]:animate-none"
    {...props}
  />
))
StyledOverlay.displayName = 'StyledOverlay'

const ModalTitle = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={cn(
      'leading-relaxed m-0 mr-4 mb-4 p-0 font-bold text-2xl',
      className
    )}
    aria-label={typeof children === 'string' ? children : undefined}
    {...props}
  >
    {children}
  </h3>
)

const ButtonGroup = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('w-full flex justify-center mt-4 text-base gap-4', className)}
    {...props}
  />
)

const CloseButton = forwardRef<HTMLButtonElement>((props, ref) => {
  return (
    <Close asChild>
      <IconButton
        icon={<AiOutlineClose />}
        size="medium"
        plain
        className="absolute top-2 right-2"
        {...props}
        ref={ref}
      />
    </Close>
  )
})

const Modal: React.FC<DialogProps> & {
  Title: typeof ModalTitle
  Close: typeof Close
  ButtonGroup: typeof ButtonGroup
  Description: typeof Description
} = ({ open, trigger, onOpenChange, children }) => {
  return (
    <Root open={open} onOpenChange={onOpenChange}>
      <Trigger asChild>{trigger}</Trigger>
      <Portal>
        <StyledOverlay />
        <StyledContent>
          <CloseButton />
          {children}
        </StyledContent>
      </Portal>
    </Root>
  )
}

Modal.Title = ModalTitle
Modal.Close = Close
Modal.ButtonGroup = ButtonGroup
Modal.Description = Description

export default Modal
