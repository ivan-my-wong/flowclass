import React from 'react'

import Modal from './Modal'

type InfoDialogProps = {
  open?: boolean
  setOpen?: (open: boolean) => void
  title: string
  description: React.ReactNode
  trigger: React.ReactNode
  actionButtons?: JSX.Element
  children?: JSX.Element
}

const InfoDialog = ({
  open,
  setOpen,
  title,
  description,
  trigger,
  children,
  actionButtons,
}: InfoDialogProps): React.ReactElement => (
  <Modal.Root>
    <Modal
      show={open}
      onOpenChange={setOpen}
      trigger={trigger}
      title={title}
      contentClassName="max-w-screen-md max-h-[95vh] rounded overflow-y-auto"
    >
      <Modal.Content className="z-modalContent overflow-y-autotext-[15px] mb-5 mt-[10px] max-h-[75vh] leading-normal">
        {description}
      </Modal.Content>

      {children}
      {actionButtons && (
        <div className="z-modalContent relative mt-[25px] flex cursor-pointer justify-end">
          {actionButtons}
        </div>
      )}

      <Modal.CloseButton />
    </Modal>
  </Modal.Root>
)

export default InfoDialog
