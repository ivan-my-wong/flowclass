import { forwardRef } from 'react'

import { Close, Content, Overlay, Portal, Root, Title, Trigger } from '@radix-ui/react-dialog'
import { AiOutlineClose } from 'react-icons/ai'

import IconButton from '../Buttons/IconButton'

const roundedClasses = {
  none: '',
  small: 'rounded-sm',
  medium: 'rounded-md',
  large: 'rounded-lg',
}

type Rounded = 'none' | 'small' | 'medium' | 'large'

type DialogProps = {
  show?: boolean
  trigger?: React.ReactNode
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
  title?: string
  contentClassName?: string
  rounded?: Rounded
}

const CloseButton = forwardRef<HTMLButtonElement>((props, ref) => {
  return (
    <Close asChild className="absolute right-1 top-3">
      <IconButton icon={<AiOutlineClose />} size="medium" plain {...props} ref={ref} />
    </Close>
  )
})

CloseButton.displayName = 'CloseButton'

const ButtonGroup = ({ children }: { children: JSX.Element | JSX.Element[] }) => (
  <div className="text-7 mb-2 mr-2 p-0 font-bold leading-6">{children}</div>
)

const Modal: React.FC<DialogProps> & {
  Content: typeof Content
  Title: typeof Title
  CloseButton: typeof CloseButton
  Close: typeof Close
  ButtonGroup: typeof ButtonGroup
  Root: typeof Root
} = ({ show, trigger, onOpenChange, title, children, contentClassName, rounded = 'none' }) => {
  return (
    <Root open={show} onOpenChange={onOpenChange}>
      <Trigger asChild>{trigger}</Trigger>
      <Portal>
        <Overlay className="bg-overlayColor z-modal fixed inset-0" />
        <Content
          className={`bg-background max-h-80vh box-shadow-md z-modalOverlay fixed left-1/2 top-1/2 w-[90vw] max-w-screen-md -translate-x-1/2 -translate-y-1/2 transform p-8 sm:p-4 ${roundedClasses[rounded]} ${contentClassName}`}
        >
          {title && <Title className="text-text text-6 font-md m-0 font-bold">{title}</Title>}
          <CloseButton />
          {children}
        </Content>
      </Portal>
    </Root>
  )
}
Modal.Content = Content
Modal.Title = Title
Modal.CloseButton = CloseButton
Modal.Close = Close
Modal.ButtonGroup = ButtonGroup
Modal.Root = Root

export default Modal
