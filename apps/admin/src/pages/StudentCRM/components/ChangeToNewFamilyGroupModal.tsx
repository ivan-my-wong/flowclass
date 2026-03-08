import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

import { Portal, Root } from '@radix-ui/react-dialog'
import { CheckCircledIcon } from '@radix-ui/react-icons'
import { useTranslation } from 'react-i18next'
import { LuChevronsUpDown } from 'react-icons/lu'
import { MdWarning } from 'react-icons/md'

import { StyledContent, StyledOverlay } from '@/components/Popups/Modal'
import ModalCloseButton from '@/components/Popups/ModalCloseButton'
import Separator from '@/components/Separators/Separator'
import { Button } from '@/components/ui/Button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/Command'
import { DialogTitle } from '@/components/ui/Dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/Popover'
import useStudentData from '@/hooks/useStudentData'
import { UserAlias } from '@/types/studentMemo'
import { cn } from '@/utils/cn'

type ChangeToNewFamilyGroupModalProps = {
  userAliasId: number
  refetchAllStudents: () => void
}

export type ChangeToNewFamilyGroupModalHandle = {
  handleOpenChange: () => void
}

const ChangeToNewFamilyGroupModal = forwardRef<
  ChangeToNewFamilyGroupModalHandle,
  ChangeToNewFamilyGroupModalProps
>(({ refetchAllStudents, userAliasId }, ref) => {
  const [open, setOpen] = useState<boolean>(false)
  const [comboboxOpen, setComboboxOpen] = useState<boolean>(false)
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

  useEffect(() => {
    if (accountDetail?.childOfUserAliasId) {
      setParentId(accountDetail.childOfUserAliasId)
    }
  }, [open, accountDetail])

  const parentDetails: UserAlias | undefined = parentAccount?.find(
    account => account.id === parentId
  )

  const selectedParent = parentAccount?.find(account => account.id === parentId)

  return (
    <Root open={open} onOpenChange={handleOpenChange}>
      <Portal>
        <StyledOverlay />
        <StyledContent>
          <DialogTitle>{t('student:menu.changeToNewFamilyGroup')}</DialogTitle>

          <Separator className="my-4" />

          <div>
            <div className="font-bold mb-2">
              {t('student:changeToNewFamilyGroup.selectParent')}
            </div>

            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={comboboxOpen}
                  className="w-full justify-between"
                >
                  {selectedParent
                    ? selectedParent.name
                    : t(
                        'student:changeToNewFamilyGroup.selectParentPlaceholder'
                      )}
                  <LuChevronsUpDown className="opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput
                    placeholder={
                      t('student:changeToNewFamilyGroup.searchParent') ||
                      'Search parent...'
                    }
                    className="h-9"
                  />
                  <CommandList>
                    <CommandEmpty>
                      {t('student:changeToNewFamilyGroup.noParentFound') ||
                        'No parent found.'}
                    </CommandEmpty>
                    <CommandGroup>
                      {parentAccount?.map(account => (
                        <CommandItem
                          key={account.id}
                          value={account.name}
                          onSelect={() => {
                            setParentId(
                              account.id === parentId ? undefined : account.id
                            )
                            setComboboxOpen(false)
                          }}
                        >
                          {account.name}
                          <CheckCircledIcon
                            className={cn(
                              'ml-auto',
                              parentId === account.id
                                ? 'opacity-100'
                                : 'opacity-0'
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {!!accountDetail?.childOfUserAliasId && (
              <>
                <div className="flex items-center gap-1 mt-4">
                  <MdWarning />{' '}
                  {t('student:changeToNewFamilyGroup.alreadyInGroup')}
                </div>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>
                    {t('student:addToParentGroup.phone')}{' '}
                    {accountDetail?.studentParent?.user?.phone}
                  </li>
                  <li>
                    {t('student:addToParentGroup.name')}{' '}
                    {accountDetail?.studentParent?.name}
                  </li>
                  <li>
                    {t('student:addToParentGroup.email')}{' '}
                    {accountDetail?.studentParent?.email}
                  </li>
                </ul>
              </>
            )}

            {!!accountDetail?.childOfUserAliasId &&
              !!parentId &&
              parentId !== accountDetail?.childOfUserAliasId && (
                <div className="mt-4 leading-6">
                  {t('student:changeToNewFamilyGroup.willBeRemoved')}
                </div>
              )}

            {!!parentId && parentId !== accountDetail?.childOfUserAliasId && (
              <>
                <div className="mt-4">
                  {t('student:changeToNewFamilyGroup.willBeAdded')}
                </div>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>
                    {t('student:addToParentGroup.phone')}{' '}
                    {parentDetails?.user?.phone}
                  </li>
                  <li>
                    {t('student:addToParentGroup.name')} {parentDetails?.name}
                  </li>
                  <li>
                    {t('student:addToParentGroup.email')} {parentDetails?.email}
                  </li>
                </ul>
                <div className="mt-4 leading-6">
                  {t('student:changeToNewFamilyGroup.willBeParentAccount')}
                </div>
              </>
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
                  refetchAllStudents()
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

export default ChangeToNewFamilyGroupModal
