import { FC, useMemo, useState } from 'react'

import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { LuBook, LuCalendar } from 'react-icons/lu'

import { Checkbox } from '@/components/ui/Checkbox'
import useStudentSubmissionData from '@/hooks/useStudentSubmissionData'
import { StudentSubmissionType } from '@/types/student-submission'

import FileCard from '../FileCard'
import UploadFile from '../UploadFile'

import SubmissionItemMenu from './SubmissionItemMenu'

interface Props {
  submissionItem: StudentSubmissionType
  isSelected: boolean
  onCheckChange: (isSelect: boolean) => void
}
const SubmissionByFileItem: FC<Props> = ({
  submissionItem,
  isSelected,
  onCheckChange,
}): JSX.Element => {
  const { t } = useTranslation(['studentSubmission'])
  const [isOpenDialogUpload, setOpenDialogUpload] = useState(false)
  const { useDownloadStudentSubmissionMaterial, isDownloading } =
    useStudentSubmissionData()
  const { mutate: downloadStudentSubmissionMaterial } =
    useDownloadStudentSubmissionMaterial()
  const mediaMaterials = useMemo(
    () => submissionItem.mediaMaterials ?? [],
    [submissionItem.mediaMaterials]
  )
  const teacherResponses = useMemo(
    () => submissionItem.teacherResponses ?? [],
    [submissionItem.teacherResponses]
  )
  return (
    <div className="relative p-4 border border-gray-200 rounded-lg flex items-start gap-2">
      <div className="absolute top-2 right-2 z-10">
        <SubmissionItemMenu
          onDownloadAll={() =>
            downloadStudentSubmissionMaterial({
              studentSubmissionId: submissionItem.id,
            })
          }
          isDownloading={isDownloading}
          onUpload={() => setOpenDialogUpload(true)}
        />
      </div>
      {/* <Checkbox
        checked={isSelected}
        onCheckedChange={onCheckChange}
        className="mt-1"
      /> */}
      <div>
        <div className="text-lg font-semibold">
          {submissionItem.studentAlias?.name}
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 text-gray-600 text-xs mb-3">
          <div className="text-sm font-medium text-gray-800 my-1">
            {t('uploadedTo')}
          </div>
          <div className="flex items-center gap-1">
            <LuBook />
            <div>{submissionItem?.studentLesson?.course?.name}</div>
          </div>
          <div className="flex items-center gap-1">
            <LuBook />
            <div>{submissionItem?.studentLesson?.class?.name}</div>
          </div>
          <div className="flex items-center gap-1">
            <LuCalendar />
            <div>
              {/* {submissionItem.lesson.name}{' '} */}
              {dayjs(submissionItem.studentLesson?.startTime).format(
                'YYYY-MM-DD'
              )}{' '}
              (
              {dayjs(submissionItem.studentLesson?.startTime).format('HH:mm A')}{' '}
              - {dayjs(submissionItem.studentLesson?.endTime).format('HH:mm A')}
              )
            </div>
          </div>
        </div>
        <div className="space-y-2 mb-3">
          <div className="font-medium text-sm">
            {t('filesLength', { count: mediaMaterials?.length })}
          </div>
          {(mediaMaterials?.length ?? 0) === 0 && (
            <div className="text-sm border border-red-200 text-red-600 bg-red-50 w-fit p-1 rounded-lg px-3">
              {t('studentHasNotSubmittedTheAssignment')}
            </div>
          )}
          <div className="flex items-center gap-3 flex-wrap">
            {mediaMaterials.map(material => (
              <FileCard
                key={`submission-${material.id}-${material.id}`}
                fileItem={material}
              />
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <div className="font-medium text-sm">{t('teacherFileUploaded')}</div>
          {teacherResponses.length === 0 && (
            <div className="text-sm border border-yellow-200 text-yellow-600 bg-yellow-50 w-fit p-1 rounded-lg px-3">
              {t('teacherFileNotUploadedYet')}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3">
            {teacherResponses.map(tutorFileItem => (
              <FileCard
                key={`tutor-file-${submissionItem.id}-${tutorFileItem.id}`}
                fileItem={tutorFileItem}
              />
            ))}
          </div>
        </div>
      </div>
      <UploadFile
        isOpen={isOpenDialogUpload}
        setOpen={setOpenDialogUpload}
        studentSubmission={submissionItem}
      />
    </div>
  )
}

export default SubmissionByFileItem
