import { forwardRef, useImperativeHandle, useState } from 'react'

import { Portal, Root } from '@radix-ui/react-dialog'
import { useTranslation } from 'react-i18next'

import { StyledContent, StyledOverlay } from '@/components/Popups/Modal'
import ModalCloseButton from '@/components/Popups/ModalCloseButton'
import Separator from '@/components/Separators/Separator'
import { Button } from '@/components/ui/Button'
import { DialogTitle } from '@/components/ui/Dialog'
import useStudentData from '@/hooks/useStudentData'

type SetAsParentAccountModalProps = { userAliasId: number; refetch: () => void }

export type SetAsParentAccountModalHandle = {
  handleOpenChange: () => void
}

const SetAsParentAccountModal = forwardRef<
  SetAsParentAccountModalHandle,
  SetAsParentAccountModalProps
>(({ refetch, userAliasId }, ref) => {
  const [open, setOpen] = useState<boolean>(false)

  const { t } = useTranslation()

  const { useSetParentAccount } = useStudentData()
  const { mutateAsync: handleSet, isLoading } = useSetParentAccount()

  const handleOpenChange = () => {
    setOpen(!open)
  }

  useImperativeHandle(ref, () => ({
    handleOpenChange,
  }))

  return (
    <Root open={open} onOpenChange={handleOpenChange}>
      <Portal>
        <StyledOverlay />
        <StyledContent>
          <DialogTitle>{t('student:menu.setAsParentAccount')}</DialogTitle>
          <ModalCloseButton />

          <Separator className="my-4" />

          <div>
            <div className="font-bold">
              {t('student:setAsParentAccount.labelOne')}
            </div>
            <div className="text-sm mt-2 leading-6">
              {t('student:setAsParentAccount.descOne')}
            </div>
            <div className="font-bold mt-4">
              {t('student:setAsParentAccount.labelTwo')}
            </div>
            <div className="text-sm mt-2 leading-6">
              {t('student:setAsParentAccount.descTwo')}
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleOpenChange}
              disabled={isLoading}
            >
              {t('student:setAsParentAccount.btnCancel')}
            </Button>
            <Button
              onClick={() => {
                handleSet({
                  isParent: true,
                  userAliasId: userAliasId ?? 0,
                }).then(() => {
                  refetch()
                  handleOpenChange()
                })
              }}
              loading={isLoading}
            >
              {t('student:setAsParentAccount.btnYes')}
            </Button>
          </div>
        </StyledContent>
      </Portal>
    </Root>
  )
})

export default SetAsParentAccountModal
