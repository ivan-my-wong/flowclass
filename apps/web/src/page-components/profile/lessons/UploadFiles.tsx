import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useSetRecoilState } from 'recoil'

import { LucideTrash, LucideUpload, LucideUploadCloud } from 'lucide-react'
import useTranslation from 'next-translate/useTranslation'
import { useQueryClient } from 'react-query'
import { toast } from 'sonner'

import { Badge } from '@/components/Badge/Badge'
import Button from '@/components/Buttons/Button'
import Spinner from '@/components/Loaders/Spinner'
import Modal from '@/components/Popups/Modal'
import { QUERY_KEY } from '@/constants/queryKey'
import useStudentSubmission from '@/hooks/useStudentSubmission'
import { currentUploadProgressState } from '@/stores/student-submission'
import { formatFileSize } from '@/utils/format'

export const ALLOWED_MIME_TYPES = [
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',

  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',

  // Archives
  'application/zip',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
]

type UploadFilesProps = {
  schoolId: number
  studentLessonId: number
  studentId: number
}
const UploadFiles: FC<UploadFilesProps> = ({
  schoolId,
  studentLessonId: classLessonId,
  studentId,
}): JSX.Element => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const fileUploadRef = useRef<HTMLInputElement>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const queryClient = useQueryClient()
  const setCurrentUploadProgress = useSetRecoilState(currentUploadProgressState)
  const { useUploadStudentSubmission, currentUploadProgress } = useStudentSubmission()
  const [uploadingMessage, setUploadingMessage] = useState<string | null>(null)
  const [uploadProgressPercentage, setUploadProgressPercentage] = useState(0)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const {
    mutate: uploadStudentSubmission,
    isLoading: isUploadingMutation,
    error: uploadError,
  } = useUploadStudentSubmission(progressEvent => {
    if (progressEvent.lengthComputable) {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      setUploadProgressPercentage(percentCompleted)
      setUploadingMessage(t('profile:lessons.processingFiles'))
      // Stop simulated progress when real progress starts
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
    }
  })

  const isUploading = useMemo(() => {
    return (
      ['pending', 'uploading'].includes(currentUploadProgress?.status ?? '') || isUploadingMutation
    )
  }, [currentUploadProgress, isUploadingMutation])
  const uploadErrorMessage = useMemo(() => {
    return (uploadError as Error)?.message || currentUploadProgress?.message
  }, [currentUploadProgress, uploadError])
  const isCompleted = useMemo(() => {
    return currentUploadProgress?.status === 'completed'
  }, [currentUploadProgress])
  const isFailed = useMemo(() => {
    return currentUploadProgress?.status === 'failed'
  }, [currentUploadProgress])
  useEffect(() => {
    if (currentUploadProgress?.percentage) {
      setUploadingMessage(t('profile:lessons.uploadingToGoogleDrive'))
      setUploadProgressPercentage(currentUploadProgress.percentage)
      // Stop simulated progress when real progress comes in
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
    }
  }, [currentUploadProgress?.percentage, t])

  // Start simulated progress when uploading starts but no real progress yet
  useEffect(() => {
    if (isUploading && uploadProgressPercentage === 0 && !progressIntervalRef.current) {
      progressIntervalRef.current = setInterval(() => {
        setUploadProgressPercentage(prev => {
          // Slowly increment up to 30% max, then hold
          if (prev < 30) {
            return Math.min(prev + 0.5, 30)
          }
          return prev
        })
      }, 200) // Update every 200ms
    }

    // Cleanup on unmount or when upload stops
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
    }
  }, [isUploading, uploadProgressPercentage])
  const onFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target
    const fileArr = Array.from(files ?? [])
    if (files) {
      setSelectedFiles(prev => {
        const copy = [...prev]
        copy.push(...fileArr)
        // Find duplicate files
        const duplicateFiles = copy.filter(
          (file, index, self) => self.findIndex(t => t.name === file.name) !== index
        )
        return copy.filter(file => !duplicateFiles.includes(file))
      })
    }
  }

  const removeFile = (fileIndex: number) => {
    if (selectedFiles) {
      setSelectedFiles(prev => {
        const copy = [...prev]
        copy.splice(fileIndex, 1)
        return copy
      })
    }
  }

  const handleClose = useCallback(() => {
    if (!isUploading) {
      setIsOpen(false)
      setSelectedFiles([])
      setCurrentUploadProgress(null)
      setUploadProgressPercentage(0)
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
    }
  }, [isUploading, setCurrentUploadProgress])

  useEffect(() => {
    if (isCompleted && currentUploadProgress) {
      toast.success(currentUploadProgress?.message ?? t('profile:lessons.filesUploadedSuccess'))
      queryClient.invalidateQueries([QUERY_KEY.getDetailStudentLesson, schoolId, classLessonId])
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
      handleClose()
    }
  }, [isCompleted, currentUploadProgress, queryClient, schoolId, classLessonId, t, handleClose])

  useEffect(() => {
    if (isFailed) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
    }
  }, [isFailed])

  const onSubmit = () => {
    uploadStudentSubmission(
      {
        institutionId: schoolId,
        payload: {
          studentLessonId: classLessonId,
          studentId,
          files: selectedFiles,
        },
      },
      {
        onSuccess: () => {
          // Close dialog and reset form on success
          setUploadProgressPercentage(0)
        },
      }
    )
  }

  return (
    <>
      <Button
        className="w-full"
        iconBefore={<LucideUpload size={18} />}
        onClick={() => setIsOpen(true)}
      >
        {t('profile:lessons.addFiles')}
      </Button>
      <Modal
        title={t('profile:lessons.uploadFiles')}
        show={isOpen}
        onOpenChange={() => handleClose()}
      >
        <div className="space-y-6 pt-4">
          {!isUploading && uploadErrorMessage && isFailed && (
            <div className="text-sm text-red-500">{uploadErrorMessage}</div>
          )}
          {isUploading ? (
            <div className="space-y-4">
              <div>
                <div className="mb-2">
                  {t('profile:lessons.uploadProgress', {
                    percentage: Math.round(uploadProgressPercentage),
                  })}
                </div>
                <div
                  className="overflow-hidden"
                  style={{
                    width: '100%',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '4px',
                    height: '20px',
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
              </div>
              <div className="text-center text-sm">{uploadingMessage}</div>
            </div>
          ) : (
            <>
              <div
                className="border-gray-30 flex cursor-pointer flex-col items-center rounded-lg border-2 border-dashed p-8"
                onClick={() => fileUploadRef.current?.click()}
              >
                <LucideUploadCloud />
                <div>{t('profile:lessons.clickToAddFiles')}</div>
              </div>
              <input
                type="file"
                accept={ALLOWED_MIME_TYPES.join(',')}
                multiple
                hidden
                ref={fileUploadRef}
                onChange={onFileSelected}
              />
              <div className="box-row-full gap-2">
                {selectedFiles &&
                  selectedFiles?.map((fileItem, fileIndex) => (
                    <div
                      key={fileItem.name}
                      className="border-primary flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-2">
                        <div className="font-medium">{fileItem.name}</div>
                        <Badge>{formatFileSize(fileItem.size)}</Badge>
                      </div>
                      <LucideTrash
                        size={18}
                        className="text-secondary shrink-0 cursor-pointer"
                        onClick={() => removeFile(fileIndex)}
                      />
                    </div>
                  ))}
              </div>
              <div className="flex justify-end">
                <Button className="min-w-32" disabled={!selectedFiles?.length} onClick={onSubmit}>
                  {t('profile:lessons.submit')}
                </Button>
              </div>
            </>
          )}
          {isUploading && uploadProgressPercentage === 0 && (
            <div className="flex items-center justify-center">
              <Spinner />
            </div>
          )}
        </div>
      </Modal>
    </>
  )
}

export default UploadFiles
