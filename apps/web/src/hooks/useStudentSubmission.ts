import { useRecoilState } from 'recoil'

import { useMutation } from 'react-query'
import { toast } from 'sonner'

import {
  deleteStudentMaterial,
  UploadProgressResponse,
  uploadStudentSubmission,
  UploadStudentSubmissionDto,
} from '@/api/student-submission'
import { API_BASE_URL } from '@/lib/config'
import { currentUploadProgressState, uploadProgressState } from '@/stores/student-submission'

const useStudentSubmission = () => {
  const [uploadProgress, setUploadProgress] = useRecoilState(uploadProgressState)
  const [currentUploadProgress, setCurrentUploadProgress] = useRecoilState(
    currentUploadProgressState
  )

  const startEvent = (uploadProgress: UploadProgressResponse): void => {
    const eventSource = new EventSource(`${API_BASE_URL}/stream/${uploadProgress.uploadId}`)
    eventSource.onerror = () => {
      eventSource.close()
    }
    eventSource.onmessage = event => {
      const { data: dataJsonStr } = JSON.parse(event.data)
      const data = JSON.parse(dataJsonStr)
      setUploadProgress(currentUploadProgress => ({
        ...currentUploadProgress,
        [uploadProgress.uploadId]: data,
      }))
      setCurrentUploadProgress(currentUploadProgress => ({
        ...currentUploadProgress,
        ...data,
      }))
      // Handle progress data from server
    }
  }
  const useUploadStudentSubmission = (
    onUploadProgress?: (progressEvent: ProgressEvent) => void
  ) => {
    return useMutation({
      mutationFn: ({
        institutionId,
        payload,
      }: {
        institutionId: number
        payload: UploadStudentSubmissionDto
      }) => uploadStudentSubmission(institutionId, payload, onUploadProgress),
      onSuccess: (data: UploadProgressResponse) => {
        setUploadProgress({
          [data.uploadId]: data,
        })
        setCurrentUploadProgress(data)
        startEvent(data)
      },
      onError: (error: Error) => {
        toast.error(error.message)
      },
    })
  }
  const useDeleteStudentMaterial = (schoolId?: number) => {
    return useMutation({
      mutationFn: (materialId: number) => deleteStudentMaterial(materialId, schoolId),
      onError: (error: Error) => {
        toast.error(error.message)
      },
    })
  }
  return {
    useUploadStudentSubmission,
    uploadProgress,
    currentUploadProgress,
    useDeleteStudentMaterial,
  }
}

export default useStudentSubmission
