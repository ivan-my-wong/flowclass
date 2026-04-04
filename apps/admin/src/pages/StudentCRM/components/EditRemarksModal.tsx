import { forwardRef, useImperativeHandle, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from 'react-query'
import { toast } from 'sonner'

import ApiError, { handleApiError } from '@/api/errors/apiError'
import { updateRemarks } from '@/api/student'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { TextArea } from '@/components/ui/TextArea'
import { QUERY_KEY } from '@/constants/queryKey'
import useSchoolData from '@/hooks/useSchoolData'

export type EditRemarksModalHandle = {
  open: (userAliasId: number, currentRemarks: string | null) => void
}

const EditRemarksModal = forwardRef<EditRemarksModalHandle>((_, ref) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { schoolData } = useSchoolData()
  const currentSchoolId = schoolData.currentSchool?.id || 0

  const [isOpen, setIsOpen] = useState(false)
  const [userAliasId, setUserAliasId] = useState<number>(0)
  const [value, setValue] = useState('')

  useImperativeHandle(ref, () => ({
    open(id: number, currentRemarks: string | null) {
      setUserAliasId(id)
      setValue(currentRemarks ?? '')
      setIsOpen(true)
    },
  }))

  const { mutate, isLoading } = useMutation({
    mutationFn: () =>
      updateRemarks({ userAliasId, remarks: value.trim() || null }),
    onSuccess: async () => {
      await queryClient.invalidateQueries([
        QUERY_KEY.student.studentListNewKey,
        currentSchoolId,
      ])
      toast.success(t('common:action.savedSuccessfully'))
      setIsOpen(false)
    },
    onError: (error: ApiError) => {
      handleApiError({ error, t })
    },
  })

  return (
    <Dialog open={isOpen} onOpenChange={open => !isLoading && setIsOpen(open)}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('common:description.remark')}</DialogTitle>
        </DialogHeader>
        <TextArea
          rows={4}
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder={t('teachingService:remark.placeholder') as string}
          className="resize-none"
          autoFocus
        />
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            {t('common:action.cancel')}
          </Button>
          <Button onClick={() => mutate()} disabled={isLoading}>
            {t('common:action.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})

EditRemarksModal.displayName = 'EditRemarksModal'
export default EditRemarksModal
