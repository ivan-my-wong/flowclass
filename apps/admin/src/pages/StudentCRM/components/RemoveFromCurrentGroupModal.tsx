import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

import { Portal, Root } from '@radix-ui/react-dialog'
import { useTranslation } from 'react-i18next'
import { MdWarning } from 'react-icons/md'

import { StyledContent, StyledOverlay } from '@/components/Popups/Modal'
import ModalCloseButton from '@/components/Popups/ModalCloseButton'
import Separator from '@/components/Separators/Separator'
import { Button } from '@/components/ui/Button'
import { DialogTitle } from '@/components/ui/Dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import useCredit from '@/hooks/useCredit'
import useStudentData from '@/hooks/useStudentData'

type RemoveFromCurrentGroupModalProps = {
  userAliasId: number
  refetch: () => void
}

export type RemoveFromCurrentGroupModalHandle = {
  handleOpenChange: (v: { isDeleted: boolean }) => void
}

const RemoveFromCurrentGroupModal = forwardRef<
  RemoveFromCurrentGroupModalHandle,
  RemoveFromCurrentGroupModalProps
>(({ refetch, userAliasId }, ref) => {
  const [open, setOpen] = useState<boolean>(false)
  const [parentId, setParentId] = useState<number>()
  const [isDeleted, setIsDeleted] = useState(false)

  const { t } = useTranslation()

  const {
    useRemoveFromParentGroup,
    useGetDetailAccountGroup,
    useGetParentAccount,
  } = useStudentData()
  const { mutateAsync: handleRemove, isLoading } = useRemoveFromParentGroup()
  const { data: accountDetail } = useGetDetailAccountGroup(userAliasId, open)
  const { data: parentAccount } = useGetParentAccount(open)

  const { useGetCreditBalance } = useCredit()
  const { data: creditBalance } = useGetCreditBalance(userAliasId, open)

  const handleOpenChange = (data: { isDeleted: boolean }) => {
    setOpen(!open)
    setIsDeleted(data.isDeleted)
  }

  useImperativeHandle(ref, () => ({
    handleOpenChange,
  }))

  useEffect(() => {
    if (accountDetail?.childOfUserAliasId) {
      setParentId(accountDetail.childOfUserAliasId)
    }
  }, [open, accountDetail])

  return (
    <Root
      open={open}
      onOpenChange={() => handleOpenChange({ isDeleted: false })}
    >
      <Portal>
        <StyledOverlay />
        <StyledContent>
          <DialogTitle>{t('student:menu.removeFromCurrentGroup')}</DialogTitle>

          <Separator className="my-4" />

          {!isDeleted && !accountDetail?.isStudentParent && (
            <div>
              <div>
                The student will be removed from the current family group.
              </div>
              <div className="mt-4">Student Details:</div>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Phone: {accountDetail?.user?.phone}</li>
                <li>Name: {accountDetail?.name}</li>
                <li>Email: {accountDetail?.email}</li>
              </ul>
              <div className="mt-4">
                Are you sure you want to remove this student?
              </div>
            </div>
          )}
          {!isDeleted && accountDetail?.isStudentParent && (
            <div>
              <div className="flex items-center gap-1">
                <MdWarning /> Remove parent from group
              </div>
              <div className="mt-4 leading-6">
                This current parent will be removed from the current group, but
                the family group will continue with a new parent.
              </div>
              <div className="mt-4">Parent Details:</div>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Phone: {accountDetail?.user?.phone}</li>
                <li>Name: {accountDetail?.name}</li>
                <li>Email: {accountDetail?.email}</li>
              </ul>
              <div className="flex items-center gap-1 mt-4 leading-6">
                <MdWarning /> Required Action: You must select a new parent from
                the remaining students to:
              </div>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Take ownership of {creditBalance ?? 0} family credits</li>
                <li>Receive all future billing notifications</li>
                <li>Manage the family group</li>
              </ul>
              {!accountDetail?.parentChildren?.length && (
                <div className="mt-4 leading-6">
                  Since this is the only member in the family group, the entire
                  group will be dissolved.
                </div>
              )}
              <div className="mt-4 leading-6">
                The selected student will become the new parent account and gain
                full access to all family credits and administrative functions.
              </div>
              <div className="font-bold mt-4 leading-6">
                Are you sure you want to proceed? This action cannot be undone.
              </div>
              <Select
                onValueChange={value => setParentId(Number(value))}
                value={parentId?.toString()}
              >
                <SelectTrigger className="mt-4">
                  <SelectValue placeholder="Select parent" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    ...(accountDetail?.parentChildren ?? []),
                    ...(parentAccount ?? []).filter(
                      o => o.id !== accountDetail?.id
                    ),
                  ]?.map(account => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {isDeleted &&
            !accountDetail?.isStudentParent &&
            !accountDetail?.childOfUserAliasId && (
              <div>
                <div>
                  The student account will be permanently removed from the
                  system.
                </div>
                <div className="mt-4">Student Details:</div>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>Phone: {accountDetail?.user?.phone}</li>
                  <li>Name: {accountDetail?.name}</li>
                  <li>Email: {accountDetail?.email}</li>
                </ul>
                <div className="flex items-start gap-1 mt-4 leading-6">
                  <MdWarning className="mt-1" /> Credit Warning: This student
                  has {creditBalance ?? 0} credits that will be permanently
                  voided and cannot be recovered.
                </div>
                <div className="font-bold mt-4 leading-6">
                  Are you sure you want to proceed? This action cannot be
                  undone.
                </div>
              </div>
            )}

          {isDeleted &&
            !accountDetail?.isStudentParent &&
            !!accountDetail?.childOfUserAliasId && (
              <div>
                <div>The student will be removed from Flowclass</div>
                <div className="mt-4">Student Details:</div>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>Phone: {accountDetail?.user?.phone}</li>
                  <li>Name: {accountDetail?.name}</li>
                  <li>Email: {accountDetail?.email}</li>
                </ul>
                <div className="font-bold mt-4 leading-6">
                  Are you sure you want to remove this student?
                </div>
              </div>
            )}

          <div className="mt-4 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => handleOpenChange({ isDeleted: false })}
            >
              {t('student:setAsParentAccount.btnCancel')}
            </Button>
            <Button
              loading={isLoading}
              disabled={
                (accountDetail?.isStudentParent || !!creditBalance) && !parentId
              }
              onClick={() => {
                handleRemove({
                  oldParentId: accountDetail?.childOfUserAliasId ?? userAliasId,
                  newParentId: parentId,
                  userAliasId: userAliasId ?? 0,
                  isDeleted,
                }).then(() => {
                  refetch()
                  handleOpenChange({ isDeleted: false })
                })
              }}
            >
              Yes, remove account
            </Button>
          </div>

          <ModalCloseButton />
        </StyledContent>
      </Portal>
    </Root>
  )
})

export default RemoveFromCurrentGroupModal
