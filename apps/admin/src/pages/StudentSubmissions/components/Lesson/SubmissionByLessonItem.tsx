import { FC, Fragment, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { LuBook, LuDot, LuUpload } from 'react-icons/lu'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import useStudentSubmissionData from '@/hooks/useStudentSubmissionData'
import { ClassLesson } from '@/types/student'
import dayjs from '@/utils/dayjs'

import { BulkUploadProvider } from '../BulkUpload/BulkUploadContext'
import BulkUploadDialog from '../BulkUpload/BulkUploadDialog'
import FileCard from '../FileCard'

import SubmissionLessonMenu from './SubmissionLessonMenu'

interface Props {
  item: ClassLesson
  onRefetch: () => void
}

const SubmissionByLessonItem: FC<Props> = ({ item, onRefetch }) => {
  const { t } = useTranslation(['studentSubmission'])
  const [isOpenDialogBulkUpload, setOpenDialogBulkUpload] = useState(false)
  const [selectedLessonId, setSelectedLessonId] = useState<number>()
  const { useDownloadStudentSubmissionMaterialByLesson, isDownloading } =
    useStudentSubmissionData()
  const { mutate: downloadStudentSubmissionMaterialByLesson } =
    useDownloadStudentSubmissionMaterialByLesson()
  const onDownloadAll = () => {
    downloadStudentSubmissionMaterialByLesson({ classLessonId: item.id })
  }

  return (
    <>
      <div className="p-4 border border-gray-300 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold mb-3 flex gap-2">
            <div className="flex items-center gap-1">
              <div>{item.courseName}</div>
            </div>
            <div className="flex items-center">
              <LuDot size={18} />
              <div>{item.class}</div>
            </div>
            <div className="flex items-center">
              <LuDot size={18} />
              <div>
                {dayjs(item.start).format('YYYY-MM-DD')} (
                {dayjs(item.start).format('HH:mm A')} -{' '}
                {dayjs(item.end).format('HH:mm A')})
              </div>
            </div>
          </div>
          {/* <Button
            iconBefore={<LuUpload />}
            variant="link"
            onClick={() => {
              setSelectedLessonId(item.id)
              setOpenDialogBulkUpload(true)
            }}
            type="button"
          >
            {t('bulkUpload.bulkBtn')}
          </Button> */}
        </div>
        {(item.studentLessons ?? []).map(studentLesson => {
          const teacherFeedbacks = studentLesson.teacherFeedbacks?.find(
            feedback => feedback.studentLessonId === Number(studentLesson.id)
          )
          return (
            <div
              key={`submission-${item.id}#${studentLesson.id}`}
              className="p-4 border border-gray-300 rounded-lg mb-2 flex items-start justify-between"
            >
              <div className="box-col-full items-start">
                <p>{studentLesson.userAlias?.name}</p>
                {studentLesson.studentSubmissions?.map(submission => (
                  <Fragment key={`submission-${item.id}#${submission.id}`}>
                    <div className="text-sm text-gray-600">
                      {t('submittedAt', {
                        date: dayjs(submission.createdAt).format(
                          'YYYY-MM-DD HH:mm A'
                        ),
                      })}
                    </div>
                    <div className="text-sm font-medium">
                      {t('studentDocumentLength', {
                        count: submission.mediaMaterials?.length ?? 0,
                      })}
                    </div>
                    <div className="box-row-full justify-start">
                      {submission.mediaMaterials?.map(submissionItem => (
                        <FileCard
                          isByLesson
                          key={`submission-${item.id}#${submission.id}#${submissionItem.id}`}
                          fileItem={submissionItem}
                        />
                      ))}
                    </div>
                  </Fragment>
                ))}
                {teacherFeedbacks && (
                  <div className="mt-3 space-y-2">
                    <div className="text-sm font-medium">
                      {t('teacherFileUploadedLength', {
                        count: teacherFeedbacks?.mediaMaterials?.length ?? 0,
                      })}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {teacherFeedbacks?.mediaMaterials?.map(responseItem => (
                        <FileCard
                          key={`response-${item.id}#${responseItem.id}`}
                          fileItem={responseItem}
                          isByLesson
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    (studentLesson.studentSubmissions ?? [])?.length > 0
                      ? 'success'
                      : 'outline'
                  }
                >
                  {t(
                    (studentLesson.studentSubmissions ?? [])?.length > 0
                      ? 'submitted'
                      : 'notSubmitted'
                  )}
                </Badge>
                {(studentLesson.studentSubmissions ?? [])?.length > 0 && (
                  <SubmissionLessonMenu
                    onDownloadAll={onDownloadAll}
                    isDownloading={isDownloading}
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>
      {isOpenDialogBulkUpload && (
        <BulkUploadProvider>
          <BulkUploadDialog
            isOpen={isOpenDialogBulkUpload}
            selectedLessonId={selectedLessonId}
            setOpen={setOpenDialogBulkUpload}
            onRefetch={onRefetch}
          />
        </BulkUploadProvider>
      )}
    </>
  )
}

export default SubmissionByLessonItem
