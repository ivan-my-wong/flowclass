import { FC, useEffect, useMemo, useRef, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { LuBook, LuDot, LuLoader2, LuUploadCloud, LuX } from 'react-icons/lu'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import useStudentSubmissionData from '@/hooks/useStudentSubmissionData'
import { StudentSubmissionType } from '@/types/student-submission'
import dayjs from '@/utils/dayjs'
import { formatPhoneNumber } from '@/utils/misc'
import { formatFileSize } from '@/utils/number.utils'

type FileDetail = {
  file: File
  fileName: string
  fileSize: number
}

interface Props {
  isOpen: boolean
  setOpen: (open: boolean) => void
  studentSubmission: StudentSubmissionType
}

const UploadFile: FC<Props> = ({
  isOpen,
  setOpen,
  studentSubmission,
}): JSX.Element => {
  const { t } = useTranslation(['studentSubmission', 'material'])
  const [selectedFiles, setSelectedFiles] = useState<FileDetail[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileUploadRef = useRef<HTMLInputElement>(null)
  const [uploadProgressPercentage, setUploadProgressPercentage] = useState(0)
  const { useUploadTeacherFeedback, currentUploadProgress } =
    useStudentSubmissionData()
  const {
    mutate: uploadTeacherFeedback,
    isLoading: isUploadingMutation,
    error: uploadError,
  } = useUploadTeacherFeedback(progressEvent => {
    const percentage = Math.round(
      (progressEvent.loaded * 100) / progressEvent.total
    )
    setUploadProgressPercentage(percentage)
  })
  useEffect(() => {
    if (currentUploadProgress?.status === 'uploading') {
      setUploadProgressPercentage(currentUploadProgress.percentage)
    }
  }, [currentUploadProgress?.status, currentUploadProgress?.percentage])
  const isUploading = useMemo(() => {
    return (
      ['pending', 'uploading'].includes(currentUploadProgress?.status ?? '') ||
      isUploadingMutation
    )
  }, [currentUploadProgress, isUploadingMutation])
  const uploadMessage = useMemo(() => {
    if (isUploadingMutation) {
      return t('material:uploadMaterials.message.uploadingMaterials')
    }
    if (currentUploadProgress?.status === 'completed') {
      return t('material:uploadMaterials.message.uploadingCompleted')
    }
    if (currentUploadProgress?.status === 'failed') {
      return t('material:uploadMaterials.message.uploadingFailed')
    }
    if (currentUploadProgress?.status === 'pending') {
      return t('material:uploadMaterials.message.preparingUploadMaterial')
    }
    return t('material:uploadMaterials.message.uploadingToGoogleDrive')
  }, [isUploadingMutation, currentUploadProgress?.status])
  const uploadErrorMessage = useMemo(() => {
    return (uploadError as Error)?.message || currentUploadProgress?.message
  }, [currentUploadProgress, uploadError])
  const isCompleted = useMemo(() => {
    return currentUploadProgress?.status === 'completed'
  }, [currentUploadProgress?.status])

  const isFailed = useMemo(() => {
    return currentUploadProgress?.status === 'failed'
  }, [currentUploadProgress])

  const handleFiles = (files: FileList | File[]) => {
    const fileArray = Array.isArray(files) ? files : Array.from(files)
    setSelectedFiles(prev => {
      const newFiles = fileArray
        .map(item => {
          const isExist = prev.some(sf => sf.fileName === item.name)
          if (isExist) return null
          return {
            file: item,
            fileName: item.name,
            fileSize: item.size,
          } as FileDetail
        })
        .filter(item => item !== null)
      return newFiles.concat(prev) as FileDetail[]
    })
  }

  const onFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target
    if (files) {
      handleFiles(files)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const { files } = e.dataTransfer
    if (files && files.length > 0) {
      handleFiles(files)
    }
  }

  const removeFile = (fileIndex: number) => {
    setSelectedFiles(prev => {
      const copy = [...prev]
      copy.splice(fileIndex, 1)
      return copy
    })
  }
  const onCloseDialog = () => {
    setOpen(false)
  }
  const onUpload = () => {
    uploadTeacherFeedback({
      studentLessonId: studentSubmission.studentLessonId,
      files: selectedFiles.map(file => file.file),
    })
  }
  useEffect(() => {
    if (isCompleted) {
      setOpen(false)
      setSelectedFiles([])
    }
  }, [isCompleted, setOpen])
  return (
    <Dialog open={isOpen} onOpenChange={onCloseDialog}>
      <DialogContent className="w-full lg:w-[700px]">
        <DialogHeader className="flex flex-col bg-white items-start justify-center sticky top-0 z-50">
          <DialogTitle>{t('uploadFile.title')}</DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-3 pb-4 min-h-[400px]">
          {!isUploading && uploadErrorMessage && isFailed && (
            <div className="text-sm text-red-500">{uploadErrorMessage}</div>
          )}
          {isUploading ? (
            <div className="mt-4 flex flex-col items-center justify-center space-y-4">
              <LuLoader2 className="h-8 w-8 animate-spin text-blue-500" />
              <div>
                {t('uploadFile.uploadProgress', {
                  percentage: uploadProgressPercentage,
                })}
              </div>
              <div
                style={{
                  width: '100%',
                  backgroundColor: '#f0f0f0',
                  borderRadius: '4px',
                }}
              >
                <div
                  style={{
                    width: `${uploadProgressPercentage}%`,
                    height: '20px',
                    backgroundColor: '#4CAF50',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
              <div className="text-center text-sm">{uploadMessage}</div>
            </div>
          ) : (
            <>
              <div className="font-medium">
                {t('uploadFile.uploadResponseTo')}
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <div className="flex items-center gap-2">
                  <LuBook />
                  {studentSubmission?.studentLesson?.course?.name}
                </div>
                <div className="flex items-center gap-2">
                  <LuDot />
                  {studentSubmission?.studentLesson?.class?.name}
                </div>
                <div className="flex items-center gap-2">
                  <LuDot />
                  <div>
                    {/* {submissionItem.lesson.name}{' '} */}
                    {dayjs(studentSubmission.studentLesson?.startTime).format(
                      'YYYY-MM-DD'
                    )}{' '}
                    (
                    {dayjs(studentSubmission.studentLesson?.startTime).format(
                      'HH:mm A'
                    )}{' '}
                    -{' '}
                    {dayjs(studentSubmission.studentLesson?.endTime).format(
                      'HH:mm A'
                    )}
                    )
                  </div>
                </div>
              </div>
              <div className="text-sm font-medium">
                <div className="text-blue-700">
                  {studentSubmission?.studentAlias?.name}
                </div>
                <div className="text-blue-500 flex items-center gap-1">
                  {studentSubmission.studentAlias?.email}
                  <LuDot />
                  {formatPhoneNumber(studentSubmission.student?.phone ?? '')}
                </div>
              </div>
              <div>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`p-4 rounded-lg border-2 border-dashed flex flex-col items-center space-y-2 transition-colors ${
                    isDragging
                      ? 'border-blue-500 bg-blue-50 border-solid'
                      : 'border-gray-300'
                  }`}
                >
                  <LuUploadCloud
                    size={34}
                    className={isDragging ? 'text-blue-500' : 'text-gray-700'}
                  />
                  <div
                    className={`font-medium ${
                      isDragging ? 'text-blue-700' : 'text-gray-700'
                    }`}
                  >
                    {t('uploadFile.selectFilesUpload')}
                    {isDragging && ' - Drop files here'}
                  </div>
                  <div className="text-gray-500 text-sm">
                    {t('uploadFile.supportForPDFDOCXJPGPNG')}
                  </div>
                  <Button onClick={() => fileUploadRef.current?.click()}>
                    {t('uploadFile.selectFilesUpload')}
                  </Button>
                </div>
                <input
                  type="file"
                  multiple
                  ref={fileUploadRef}
                  onChange={onFileSelected}
                  hidden
                />
              </div>
              <div>
                <div className="text-sm font-medium mb-2">
                  {t('uploadFile.selectedFiles', {
                    count: selectedFiles.length,
                  })}
                </div>
                {selectedFiles.map((fileItem, fileIndex) => (
                  <div
                    key={fileItem.fileName}
                    className="p-3 rounded-lg bg-gray-100 mb-2 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-gray-700">
                        {fileItem.fileName}
                      </div>
                      <Badge>{formatFileSize(fileItem.fileSize)}</Badge>
                    </div>
                    <LuX
                      size={20}
                      className="cursor-pointer text-gray-700"
                      onClick={() => removeFile(fileIndex)}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </DialogBody>
        {!isUploading && (
          <div className="flex items-center justify-end border-t border-gray-300 px-6 gap-2 py-3 sticky bottom-0 z-10 bg-white">
            <Button variant="outline" onClick={() => onCloseDialog()}>
              {t('common:action.cancel')}
            </Button>
            <Button onClick={onUpload}>{t('common:action.upload')}</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default UploadFile
