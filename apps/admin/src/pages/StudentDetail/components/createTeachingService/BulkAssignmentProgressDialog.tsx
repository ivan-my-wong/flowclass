import { useEffect, useState } from 'react'

import { useTranslation } from 'react-i18next'

import Text from '@/components/Texts/Text'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Progress } from '@/components/ui/Progress'
import { API_BASE_URL } from '@/lib/config'

export type ProgressEvent = {
  status: 'processing' | 'completed' | 'error'
  current: number
  total: number
  percentage: number
  currentStudent?: string
  error?: string
  results?: Array<{
    userAliasId: number
    success: boolean
    error?: string
  }>
}

type BulkAssignmentProgressDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  jobId: string
  institutionId: number
  onComplete?: () => void
  onError?: (error: string) => void
}

const BulkAssignmentProgressDialog = ({
  open,
  onOpenChange,
  jobId,
  institutionId,
  onComplete,
  onError,
}: BulkAssignmentProgressDialogProps): React.ReactElement => {
  const { t } = useTranslation()
  const [progress, setProgress] = useState<ProgressEvent>({
    status: 'processing',
    current: 0,
    total: 0,
    percentage: 0,
  })

  useEffect(() => {
    if (!open || !jobId) {
      return undefined
    }

    // Reset progress when dialog opens
    setProgress({
      status: 'processing',
      current: 0,
      total: 0,
      percentage: 0,
    })

    const baseURL = API_BASE_URL

    // For SSE, EventSource doesn't support custom headers
    // The backend should handle authentication via cookies or session
    // Include institutionId as a query parameter to avoid 401 unauthorized
    // Note: withCredentials is not set to avoid CORS issues when server returns Access-Control-Allow-Origin: *
    // Cookies will still be sent automatically if they're for the same domain
    const streamUrl = `${baseURL}/admin/student-onboard/stream/${jobId}?institutionId=${institutionId}`

    // Create EventSource for SSE
    const eventSource = new EventSource(streamUrl)

    eventSource.onmessage = event => {
      try {
        // Parse the outer JSON object
        const outerData = JSON.parse(event.data)
        // The actual progress data is nested in a 'data' property as a JSON string
        const progressData: ProgressEvent = JSON.parse(outerData.data)
        setProgress(progressData)

        if (progressData.status === 'completed') {
          eventSource.close()
          setTimeout(() => {
            onComplete?.()
            onOpenChange(false)
          }, 1000)
        } else if (progressData.status === 'error') {
          eventSource.close()
          onError?.(progressData.error || 'Unknown error occurred')
          onOpenChange(false)
        }
      } catch {
        // Silently handle parsing errors
      }
    }

    eventSource.onerror = () => {
      eventSource.close()
      onError?.('Connection error occurred')
      onOpenChange(false)
    }

    // Cleanup on unmount or when dialog closes
    return () => {
      eventSource.close()
    }
  }, [open, jobId, institutionId, onComplete, onError, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t('student:teachingService.bulkAssignmentProgress')}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4 px-6">
          {progress.status === 'processing' && (
            <>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <Text>
                    {progress.currentStudent
                      ? t('student:teachingService.processingStudent', {
                          name: progress.currentStudent,
                        })
                      : t('student:teachingService.processing')}
                  </Text>
                  <Text>
                    {progress.current} / {progress.total}
                  </Text>
                </div>
                <Progress value={progress.percentage} className="w-full" />
                <div className="text-center text-sm text-text-disabled">
                  {progress.percentage}%
                </div>
              </div>
            </>
          )}

          {progress.status === 'completed' && (
            <div className="text-center space-y-2">
              <Text className="text-green-600">
                {t('student:teachingService.bulkAssignmentCompleted')}
              </Text>
              <Text className="text-sm text-text-disabled">
                {t('student:teachingService.processedStudents', {
                  count: progress.total,
                })}
              </Text>
            </div>
          )}

          {progress.status === 'error' && (
            <div className="text-center space-y-2">
              <Text className="text-red-600">
                {t('student:teachingService.bulkAssignmentError')}
              </Text>
              {progress.error && (
                <Text className="text-sm text-text-disabled">
                  {progress.error}
                </Text>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default BulkAssignmentProgressDialog
