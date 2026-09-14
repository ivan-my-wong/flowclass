import customFetch from '@/api/baseClient'

import { MediaUploadResponse } from '../types'

export const uploadImage = async (
  file: File,
  onUploadProgress?: (progressEvent: ProgressEvent<EventTarget>) => void
): Promise<MediaUploadResponse> => {
  const formData = new FormData()
  formData.append('file', file)

  const { data: result } = await customFetch<MediaUploadResponse>('/student/media/upload', {
    method: 'POST',
    body: formData,
    onUploadProgress,
  })
  return result
}

export const getS3PrivateFileUrl = async (key: string): Promise<string> => {
  const { data: result } = await customFetch<string>('/admin/media/s3-presigned-url', {
    method: 'GET',
    query: { key },
  })
  return result
}
