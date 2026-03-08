import React from 'react'

import * as AlertDialog from '@radix-ui/react-alert-dialog'

import Button from '../Buttons/Button'
import TextInput from '../Inputs/TextInput'

type AlertDialogProps = {
  open: boolean
  setOpen: (open: boolean) => void
  title: string
  description: React.ReactNode
  cancelText?: string
  actionText?: string
  inputRequired?: boolean
  onInputChange?: (value: string) => void
  onActionClick?: () => void
  isInputValid?: boolean
}
const CustomedAlertDialog = ({
  open,
  setOpen,
  title,
  description,
  cancelText = '',
  actionText = '',
  inputRequired = false,
  isInputValid = false,
  onInputChange,
  onActionClick,
}: AlertDialogProps): JSX.Element => {
  const handleInputChange = (value: string) => {
    if (onInputChange !== undefined) {
      onInputChange(value)
    }
  }

  const handleActionClick = () => {
    if (onActionClick !== undefined) {
      onActionClick()
    }
  }
  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger asChild />
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="bg-shadowColor data-[state=open]:animate-overlayShow fixed inset-0" />
        <AlertDialog.Content className="data-[state=open]:animate-contentShow fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
          <AlertDialog.Title className="text-text bold m-0 text-lg">{title}</AlertDialog.Title>
          <AlertDialog.Description className="text-text mb-5 leading-6">
            {description}
            {inputRequired && (
              <TextInput
                id="input"
                name="input"
                onChange={(e: any) => handleInputChange(e.target.value)}
                isError={inputRequired && !isInputValid}
                className="mt-3 w-full"
              />
            )}
          </AlertDialog.Description>
          <div className="box-row justify-end gap-4">
            {cancelText && (
              <AlertDialog.Cancel asChild>
                <Button
                // seems should be disabled
                // disabled={inputRequired && !isInputValid}
                >
                  {cancelText}
                </Button>
              </AlertDialog.Cancel>
            )}
            {actionText && (
              <AlertDialog.Action asChild>
                <Button disabled={inputRequired && !isInputValid} onClick={handleActionClick}>
                  {actionText}
                </Button>
              </AlertDialog.Action>
            )}
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}

export default CustomedAlertDialog
