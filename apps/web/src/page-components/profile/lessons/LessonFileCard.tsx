import { FC } from 'react'

import { LucideExternalLink, LucideTrash } from 'lucide-react'
import useTranslation from 'next-translate/useTranslation'
import { useQueryClient } from 'react-query'
import { toast } from 'sonner'

import Button from '@/components/Buttons/Button'
import ConfirmPopup from '@/components/Popups/ConfirmPopup'
import { QUERY_KEY } from '@/constants/queryKey'
import useStudentSubmission from '@/hooks/useStudentSubmission'
import { MediaMaterialsType } from '@/types/materials'
import { cn } from '@/utils/cn'
import dayjs from '@/utils/dayjs'

interface Props {
  studentLessonId: number
  schoolId?: number
  fileDetail: MediaMaterialsType
  isClearable?: boolean
  className?: string
}
const LessonFileCard: FC<Props> = ({
  fileDetail,
  isClearable,
  className,
  schoolId,
  studentLessonId,
}): JSX.Element => {
  const { t } = useTranslation()
  const { useDeleteStudentMaterial } = useStudentSubmission()
  const queryClient = useQueryClient()
  const { mutate: deleteStudentMaterial, isLoading: isDeleting } =
    useDeleteStudentMaterial(schoolId)
  const handleDelete = async () => {
    await deleteStudentMaterial(fileDetail.id, {
      onSuccess: () => {
        toast.success(t('profile:lessons.studentMaterialDeletedSuccess') as string)
        queryClient.invalidateQueries([QUERY_KEY.getDetailStudentLesson, schoolId, studentLessonId])
      },
    })
  }
  return (
    <>
      <div
        className={cn(
          'flex flex-col justify-between gap-2 rounded-lg border border-gray-100 bg-gray-50 p-4 md:flex-row md:items-center',
          className
        )}
      >
        <div>
          <p className="font-medium">{fileDetail.name}</p>
          <div className="text-sm">
            {t('profile:lessons.uploadedAt', {
              date: dayjs(fileDetail.createdAt).format('DD-MM-YYYY HH:mm A'),
            })}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outlined"
            iconBefore={<LucideExternalLink size={18} />}
            onClick={() => {
              if (!fileDetail.link) {
                return toast.error(t('profile:lessons.noDownloadLinkAvailable') as string)
              }
              window.open(fileDetail.link, '_blank')
            }}
          >
            {t('profile:lessons.download')}
          </Button>
          {isClearable && (
            <ConfirmPopup
              title={t('profile:lessons.deleteMaterial')}
              type="delete"
              isLoading={isDeleting}
              isAsyncPopup
              message={t('profile:lessons.confirmDeleteMaterial')}
              trigger={
                <Button
                  variant="text"
                  iconBefore={<LucideTrash className="text-warn" size={18} />}
                  isLoading={isDeleting}
                />
              }
              onConfirm={handleDelete}
            />
          )}
        </div>
      </div>
    </>
  )
}

export default LessonFileCard
