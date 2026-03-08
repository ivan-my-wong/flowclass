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
import { DefaultTFuncReturn } from 'i18next'

import TextInput from '@/components/Inputs/TextInput'
import { Spinner } from '@/components/Loaders/Spinner'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import { AlertTypes } from '@/reducers/confirm.reducers'
import { cn } from '@/utils/cn'

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
    if (open) {
      document.body.style.cursor = 'default'
      document.body.style.pointerEvents = 'auto'
    }
  }, [open])

  return (
    <Root open={open}>
      <Trigger asChild />
      <Portal>
        {open && (
          <Overlay
            className="fixed inset-0 z-modal animate-dialog-overlay"
            style={{ backgroundColor: blackA.blackA9 }}
          />
        )}
        <Content
          className={cn(
            'bg-white rounded-md shadow-lg fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
            'w-[90vw] max-w-[500px] max-h-[85vh] p-6 z-modal',
            'animate-dialog-content focus:outline-none',
            'dark:bg-dark-background dark:text-light'
          )}
        >
          <Title
            className={cn('m-0 font-semibold dark:!text-white')}
            style={{ color: mauve.mauve12 }}
          >
            {title}
          </Title>
          <Description
            className="my-4 w-full whitespace-pre-line text-text"
            style={{ color: mauve.mauve11, fontSize: 15, lineHeight: 1.5 }}
          >
            {description}
          </Description>
          {inputRequired && (
            <TextInput
              className="mb-4 w-full"
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
                    <span className="ml-2.5">
                      <Spinner size="small" />
                    </span>
                  )}
                </Button>
              </Action>
            )}
          </Box>
        </Content>
      </Portal>
    </Root>
  )
}

export default CustomedAlertDialog
