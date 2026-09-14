// eslint-disable-next-line no-restricted-syntax
import { useEffect } from 'react'

import { blackA, mauve } from '@radix-ui/colors'
import {
  Action,
  Content,
  Description,
  Overlay,
  Portal,
  Root,
  Title,
  Trigger,
} from '@radix-ui/react-alert-dialog'
import { keyframes, styled } from '@stitches/react'
import { DefaultTFuncReturn } from 'i18next'

import TextInput from '@/components/Inputs/TextInput'
import { Spinner } from '@/components/Loaders/Spinner'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import { AlertTypes } from '@/reducers/confirm.reducers'

type AlertDialogProps = {
  open: boolean
  setOpen: (open: boolean) => void
  title: string
  alertType?: AlertTypes
  description: DefaultTFuncReturn | string
  cancelText?: DefaultTFuncReturn | string
  actionText?: DefaultTFuncReturn | string
  inputRequired?: boolean
  onInputChange?: (value: string) => void
  onActionClick?: () => void
  onCloseClick?: () => void
  isInputValid?: boolean
  loading?: boolean
}
const CustomedAlertDialog = ({
  open,
  setOpen,
  title,
  alertType = AlertTypes.CONFIRM,
  description,
  cancelText = '',
  actionText = '',
  inputRequired = false,
  isInputValid = false,
  onInputChange,
  onActionClick,
  onCloseClick,
  loading = false,
}: AlertDialogProps): React.ReactElement => {
  const handleInputChange = (value: string) => {
    onInputChange?.(value)
  }

  const handleActionClick = () => {
    onActionClick?.()
  }

  const handleCloseClick = () => {
    onCloseClick?.()
    setOpen(false)
  }
  const isWarning = alertType === AlertTypes.WARN

  useEffect(() => {
    // We need to set style of body to empty string because:
    // When go to edit page that the dropdown state is open, the dropdown component set style of body to cursor-pointer: none
    // And after user back to setting payments page there is nothing the user can click. So we need to set style of body to empty string
    if (open) {
      document.body.style.cursor = 'default'
      document.body.style.pointerEvents = 'auto'
    }
  }, [open])

  return (
    <Root open={open}>
      <Trigger asChild />
      <Portal>
        {open && <AlertDialogOverlay />}
        <AlertDialogContent className="dark:bg-dark-background dark:text-light">
          <AlertDialogTitle
            css={{ fontWeight: 600 }}
            className="dark:!text-white"
          >
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription
            css={{
              margin: '$4 0',
              width: '100%',
              whiteSpace: 'pre-line',
              color: '$text',
            }}
          >
            {description}
          </AlertDialogDescription>
          {inputRequired && (
            <TextInput
              css={{ marginBottom: '$4', width: '100%' }}
              id="input"
              name="input"
              onChange={e => handleInputChange(e.target.value)}
              isError={inputRequired && !isInputValid}
            />
          )}
          <Box justify="end" gap="lg" className="mt-4">
            {cancelText && (
              <Button variant="outline" onClick={handleCloseClick}>
                {cancelText}
              </Button>
            )}
            {actionText && (
              <Action asChild>
                <Button
                  color={isWarning ? 'warn' : undefined}
                  disabled={(inputRequired && !isInputValid) || loading}
                  onClick={handleActionClick}
                  variant={isWarning ? 'destructive' : 'default'}
                  data-testid={`${actionText.toLowerCase()}-btn`}
                >
                  {actionText}
                  {loading && (
                    <Loading>
                      <Spinner size="small" />
                    </Loading>
                  )}
                </Button>
              </Action>
            )}
          </Box>
        </AlertDialogContent>
      </Portal>
    </Root>
  )
}

const overlayShow = keyframes({
  '0%': { opacity: 0 },
  '100%': { opacity: 1 },
})

const contentShow = keyframes({
  '0%': { opacity: 0, transform: 'translate(-50%, -48%) scale(.96)' },
  '100%': { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
})

const AlertDialogOverlay = styled(Overlay, {
  backgroundColor: blackA.blackA9,
  position: 'fixed',
  inset: 0,
  animation: `${overlayShow} 150ms cubic-bezier(0.16, 1, 0.3, 1)`,
  zIndex: '$modal',
})

const AlertDialogContent = styled(Content, {
  backgroundColor: 'white',
  borderRadius: 6,
  boxShadow: '$3',
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90vw',
  maxWidth: '500px',
  maxHeight: '85vh',
  padding: 25,
  animation: `${contentShow} 150ms cubic-bezier(0.16, 1, 0.3, 1)`,
  zIndex: '$modal',

  '&:focus': { outline: 'none' },
})

const AlertDialogTitle = styled(Title, {
  margin: 0,
  color: mauve.mauve12,
  fontSize: 17,
  fontWeight: 500,
})

const AlertDialogDescription = styled(Description, {
  marginBottom: 20,
  color: mauve.mauve11,
  fontSize: 15,
  lineHeight: 1.5,
})

const Loading = styled('div', {
  marginLeft: 10,
})

export default CustomedAlertDialog
