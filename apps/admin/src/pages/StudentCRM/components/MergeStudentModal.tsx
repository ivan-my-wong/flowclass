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

type MergeStudentModalProps = {
  userAliasId: number
  studentName: string
  refetch: () => void
}

export type MergeStudentModalHandle = {
  handleOpenChange: () => void
}

const MergeStudentModal = forwardRef<
  MergeStudentModalHandle,
  MergeStudentModalProps
>(({ userAliasId, studentName, refetch }, ref) => {
  const [open, setOpen] = useState(false)
  const [targetId, setTargetId] = useState<number | undefined>()

  const { t } = useTranslation()

  const { useFetchAllStudentData, useMergeStudent } = useStudentData()
  const { data: allStudents } = useFetchAllStudentData()
  const { mutateAsync: handleMerge, isLoading } = useMergeStudent()

  const handleOpenChange = () => {
    setOpen(prev => !prev)
    setTargetId(undefined)
  }

  useImperativeHandle(ref, () => ({ handleOpenChange }))

  const studentOptions =
    allStudents
      ?.filter(s => s.id !== userAliasId)
      .map(s => ({
        label: [s.name, s.phone].filter(Boolean).join(' / '),
        value: s.id.toString(),
      })) || []

  const targetStudent = allStudents?.find(s => s.id === targetId)
  const targetHasEnrollments = (targetStudent?.enrollCourses?.length ?? 0) > 0

  return (
    <Root open={open} onOpenChange={handleOpenChange}>
      <Portal>
        <StyledOverlay />
        <StyledContent>
          <DialogTitle>{t('student:merge.title')}</DialogTitle>

          <Separator className="my-4" />

          <div>
            <div className="font-bold mb-2">
              {t('student:merge.selectTarget')}
            </div>
            <Combobox
              options={studentOptions}
              value={targetId?.toString()}
              onValueChange={value => setTargetId(Number(value))}
              placeholder={t(
                'student:merge.selectTargetPlaceholder'
              ).toString()}
              emptyText={t('student:merge.noStudentsFound').toString()}
            />

            {!!targetId && targetHasEnrollments && (
              <div className="flex items-center gap-1 mt-4 text-sm text-muted-foreground">
                <MdWarning className="shrink-0" />
                {t('student:merge.targetHasEnrollments', {
                  name: targetStudent?.name,
                })}
              </div>
            )}

            {!!targetId && (
              <div className="mt-4 leading-6 text-sm">
                {t('student:merge.warning', { name: studentName })}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleOpenChange}
              disabled={isLoading}
            >
              {t('common:action.cancel')}
            </Button>
            <Button
              variant="destructive"
              loading={isLoading}
              disabled={!targetId}
              onClick={() => {
                if (!targetId) return
                handleMerge({
                  sourceUserAliasId: userAliasId,
                  targetUserAliasId: targetId,
                }).then(() => {
                  refetch()
                  handleOpenChange()
                })
              }}
            >
              {t('student:merge.btnConfirm')}
            </Button>
          </div>

          <ModalCloseButton />
        </StyledContent>
      </Portal>
    </Root>
  )
})

export default MergeStudentModal
