import customFetch from './baseClient'

export type UploadStudentSubmissionDto = {
  studentLessonId: number
  studentId: number
  files: File[]
}

export interface UploadProgressResponse {
  uploadId: string
  userId: number
  totalFiles: number
  completedFiles: number
  currentFile?: string
  percentage: number
  status: 'pending' | 'uploading' | 'completed' | 'failed'
  results?: any[]
  message?: string
  startedAt: Date
  updatedAt: Date
}

export const uploadStudentSubmission = async (
  institutionId: number,
  payload: UploadStudentSubmissionDto,
  onUploadProgress?: (progressEvent: ProgressEvent) => void
): Promise<UploadProgressResponse> => {
  const formData = new FormData()
  formData.append('studentLessonId', payload.studentLessonId.toString())
  formData.append('studentId', payload.studentId.toString())
  payload.files.forEach(file => {
    formData.append('files', file)
  })
  const { data: result } = await customFetch<UploadProgressResponse>(
    `/student/submission/create-submission`,
    {
      method: 'POST',
      query: { institutionId: institutionId.toString() },
      body: formData,
      onUploadProgress,
      needAuth: true,
    }
  )
  return result
}

export const deleteStudentMaterial = async (
  materialId: number,
  institutionId?: number
): Promise<void> => {
  await customFetch<void>(`/student/submission/${materialId}/delete`, {
    method: 'DELETE',
    needAuth: true,
    query: { institutionId: institutionId?.toString() ?? '' },
  })
}
