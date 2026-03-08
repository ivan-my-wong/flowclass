import { FC } from 'react'

import { useTranslation } from 'react-i18next'

import LabelSelector from '@/components/Selector/LabelSelector'

import {
  FileDetail,
  SubmissionStudent,
  useContextBulkUpload,
} from './BulkUploadContext'

interface Props {
  fileDetail: FileDetail
}
const LessonAndStudentSelection: FC<Props> = ({ fileDetail }): JSX.Element => {
  const { t } = useTranslation(['studentSubmission'])
  const { selectedFiles, setSelectedFiles, studentList } =
    useContextBulkUpload()

  const onSelectStudent = (student: SubmissionStudent) => {
    updateFiles({ student })
  }

  const updateFiles = (updates: Partial<FileDetail>) => {
    const fileIndex = selectedFiles.findIndex(
      item => item.fileName === fileDetail.fileName
    )
    if (fileIndex === -1) return

    const newFiles = [...selectedFiles]
    newFiles[fileIndex] = {
      ...fileDetail,
      ...updates,
    }
    setSelectedFiles(newFiles)
  }

  return (
    <>
      <div className="space-y-1">
        <div className="text-sm">{t('bulkUpload.student')}</div>
        <LabelSelector
          selectOption={fileDetail?.student ? [fileDetail.student] : []}
          options={studentList}
          onChange={onSelectStudent}
          placeHolder={t('bulkUpload.studentPlaceholder')}
        />
      </div>
    </>
  )
}

export default LessonAndStudentSelection
