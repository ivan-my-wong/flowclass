import { forwardRef, useImperativeHandle, useState } from 'react'

import { Portal, Root } from '@radix-ui/react-dialog'
import { useTranslation } from 'react-i18next'
import { MdWarning } from 'react-icons/md'

import { StyledContent, StyledOverlay } from '@/components/Popups/Modal'
import ModalCloseButton from '@/components/Popups/ModalCloseButton'
import Separator from '@/components/Separators/Separator'
import { Button } from '@/components/ui/Button'
import { Combobox } from '@/components/ui/Combobox'
import { DialogTitle } from '@/components/ui/Dialog'
import useStudentData from '@/hooks/useStudentData'
import { UserAlias } from '@/types/studentMemo'
import { formatPhoneNumber } from '@/utils/misc'

type AddToParentGroupModalProps = { userAliasId: number; refetch: () => void }

export type AddToParentGroupModalHandle = {
  handleOpenChange: () => void
}

const AddToParentGroupModal = forwardRef<
  AddToParentGroupModalHandle,
  AddToParentGroupModalProps
>(({ refetch, userAliasId }, ref) => {
  const [open, setOpen] = useState<boolean>(false)
  const [parentId, setParentId] = useState<number>()

  const { t } = useTranslation()

  const { useAddToParentGroup, useGetDetailAccountGroup, useGetParentAccount } =
    useStudentData()
  const { mutateAsync: handleAdd, isLoading } = useAddToParentGroup()
  const { data: accountDetail } = useGetDetailAccountGroup(userAliasId, open)
  const { data: parentAccount } = useGetParentAccount(open)

  const handleOpenChange = () => {
    setOpen(!open)
  }

  useImperativeHandle(ref, () => ({
    handleOpenChange,
  }))

  const parentDetails: UserAlias | undefined = parentAccount?.find(
    account => account.id === parentId
  )

  const parentOptions =
    parentAccount?.map(account => ({
      label: [account.name, account.user?.phone, account.email]
        .filter(Boolean)
        .join(' / '),
      value: account.id.toString(),
    })) || []

  return (
    <Root open={open} onOpenChange={handleOpenChange}>
      <Portal>
        <StyledOverlay />
        <StyledContent>
          <DialogTitle>{t('student:menu.addToParentGroup')}</DialogTitle>

          <Separator className="my-4" />

          <div>
            <div className="font-bold mb-2">
              {t('student:addToParentGroup.selectParent')}
            </div>
            <Combobox
              options={parentOptions}
              value={parentId?.toString()}
              onValueChange={value => setParentId(Number(value))}
              placeholder={t(
                'student:addToParentGroup.selectParentPlaceholder'
              ).toString()}
              emptyText={t(
                'student:addToParentGroup.noParentsFound'
              ).toString()}
            />

            {!!accountDetail?.childOfUserAliasId && (
              <>
                <div className="flex items-center gap-1 mt-4">
                  <MdWarning /> {t('student:addToParentGroup.alreadyInGroup')}
                </div>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>
                    {t('student:addToParentGroup.phone')}{' '}
                    {formatPhoneNumber(
                      accountDetail?.studentParent?.user?.phone || ''
                    )}
                  </li>
                  <li>
                    {t('student:addToParentGroup.name')}{' '}
                    {accountDetail?.studentParent?.name}
                  </li>
                  {accountDetail?.studentParent?.email && (
                    <li>
                      {t('student:addToParentGroup.email')}{' '}
                      {accountDetail?.studentParent?.email}
                    </li>
                  )}
                </ul>
              </>
            )}

            {!!accountDetail?.childOfUserAliasId &&
              parentId !== accountDetail?.childOfUserAliasId && (
                <div className="mt-4 leading-6">
                  {t('student:addToParentGroup.willBeRemoved')}
                </div>
              )}

            {!accountDetail?.childOfUserAliasId && !!parentId && (
              <>
                <div className="mt-4">
                  {t('student:addToParentGroup.willBeAdded')}
                </div>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>
                    {t('student:addToParentGroup.phone')}{' '}
                    {formatPhoneNumber(parentDetails?.user?.phone || '')}
                  </li>
                  <li>
                    {t('student:addToParentGroup.name')} {parentDetails?.name}
                  </li>
                  <li>
                    {t('student:addToParentGroup.email')} {parentDetails?.email}
                  </li>
                </ul>
              </>
            )}

            {!!parentId && (
              <div className="mt-4 leading-6">
                {t('student:addToParentGroup.willBeParentAccount')}
              </div>
            )}
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
              loading={isLoading}
              disabled={!parentId}
              onClick={() => {
                handleAdd({
                  parentId: parentId ?? 0,
                  userAliasId: userAliasId ?? 0,
                }).then(() => {
                  refetch()
                  handleOpenChange()
                })
              }}
            >
              {t('student:addToParentGroup.btnYes')}
            </Button>
          </div>

          <ModalCloseButton />
        </StyledContent>
      </Portal>
    </Root>
  )
})

export default AddToParentGroupModal
