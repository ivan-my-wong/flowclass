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

import { keyframes, styled } from '../../styles'
import IconButton from '../Buttons/IconButton'

type DialogProps = {
  open?: boolean
  trigger?: React.ReactNode
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

const contentShow = keyframes({
  '0%': { opacity: 0, transform: 'translate(-50%, -50%) scale(.1)' },
  '100%': { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
})
export const StyledContent = styled(Content, {
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '$background',
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',

  maxWidth: '90%',
  minWidth: '50%',

  maxHeight: '90vh',
  overflowY: 'auto',

  borderRadius: '$large',
  padding: '$8 $4 $4',
  boxShadow: '$1',
  zIndex: '$modalContent',

  animation: `${contentShow} 150ms cubic-bezier(0.16, 1, 0.3, 1)`,
  '@md': {
    minHeight: '60vh',
    minWidth: '70%',
  },
  '@sm': {
    minHeight: '80vh',
    minWidth: '90%',
  },
})

export const StyledOverlay = styled(Overlay, {
  backgroundColor: '$overlayColor',
  position: 'fixed',
  inset: 0,
  zIndex: '$modal',
  // '@media (prefers-reduced-motion: no-preference)': {
  //   animation: `${overlayShow} 150ms cubic-bezier(0.16, 1, 0.3, 1) forwards`,
  // },
})

const ModalTitle = styled('h3', {
  lineHeight: '1.5',
  margin: '0 $medium $medium 0',
  padding: 0,
  fontWeight: 'bold',
  fontSize: '$7',
})

const ButtonGroup = styled('div', {
  width: '100%',
  flexRowCenter: 'center',
  margin: '$medium 0 0',
  fontSize: '$medium',
  gap: '$medium',
})

const RawCloseButton = forwardRef<HTMLButtonElement>((props, ref) => {
  return (
    <Close asChild>
      <IconButton
        icon={<AiOutlineClose />}
        size="medium"
        plain
        {...props}
        ref={ref}
      />
    </Close>
  )
})

const CloseButton = styled(RawCloseButton, {
  position: 'absolute!important',
  top: '$small',
  right: '$small',
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
