import { FC, useEffect } from 'react'

import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import {
  LuDelete,
  LuDownload,
  LuExternalLink,
  LuTrash,
  LuX,
} from 'react-icons/lu'

import { Button } from '@/components/ui/Button'
import useConfirm from '@/hooks/useGlobalConfirm'
import useStudentSubmissionData from '@/hooks/useStudentSubmissionData'
import { AlertTypes } from '@/reducers/confirm.reducers'
import { MediaMaterialsType } from '@/types/class-material'

interface Props {
  isByLesson?: boolean
  fileItem: MediaMaterialsType
}
const FileCard: FC<Props> = ({ fileItem, isByLesson }) => {
  const { t } = useTranslation('studentSubmission')
  const { useDeleteStudentSubmissionMaterial } = useStudentSubmissionData()
  const {
    mutate: deleteStudentSubmissionMaterial,
    isLoading,
    isSuccess,
  } = useDeleteStudentSubmissionMaterial(isByLesson)
  const { setConfirm, closeConfirm } = useConfirm(isLoading)

  const onDeleteMaterial = () => {
    setConfirm({
      title: t('delete.title') as string,
      alertType: AlertTypes.WARN,
      description: t('delete.description') as string,
      onConfirm: () => {
        deleteStudentSubmissionMaterial({
          materialId: fileItem.id,
          studentSubmissionId: fileItem.studentSubmissionId,
          teacherFeedbackId: fileItem.teacherFeedbackId,
        })
      },
      confirmText: t('common:action.delete').toString(),
      cancelText: t('common:action.cancel').toString(),
    }).open()
  }
  useEffect(() => {
    if (isSuccess) {
      closeConfirm()
    }
  }, [isSuccess, closeConfirm])
  return (
    <div className="bg-gray-100 p-2 rounded-lg flex items-center gap-2 w-fit">
      <div className="font-medium text-sm">{fileItem.name}</div>
      {fileItem.createdAt && (
        <p className="text-xs">
          {dayjs(fileItem.createdAt).format('YYYY-MM-DD HH:mm A')}
        </p>
      )}

      <Button
        className="p-0"
        variant="ghost"
        size="xs"
        iconAfter={<LuExternalLink size={16} className="cursor-pointer" />}
        onClick={() => {
          window.open(fileItem.link, '_blank')
        }}
      />
      {onDeleteMaterial && (
        <Button
          className="p-0"
          variant="ghost"
          size="xs"
          iconAfter={<LuTrash size={16} className="cursor-pointer text-warn" />}
          onClick={onDeleteMaterial}
        />
      )}
    </div>
  )
}

export default FileCard
