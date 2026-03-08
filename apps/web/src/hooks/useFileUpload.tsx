import useTranslation from 'next-translate/useTranslation'
import { useMutation, UseMutationResult } from 'react-query'
import { toast } from 'sonner'

// import FlowApiError from '../api/errors/flowApiError'
import { uploadImage } from '../api/uploadFile'
import { MediaUploadResponse } from '../types'

const useFileUpload = () => {
  const { t } = useTranslation()
  const useImageUpload = (
    successfulCallback: (data: MediaUploadResponse) => void,
    onUploadProgress?: (progressEvent: ProgressEvent) => void
  ): UseMutationResult<MediaUploadResponse, Error, File, unknown> => {
    const mutation = useMutation({
      mutationFn: (file: File) => uploadImage(file),
      onSuccess: (data: MediaUploadResponse) => {
        toast.success(t('component:ImageUpload.uploadSuccess') as string)
        successfulCallback?.(data)
      },
      onError: (error: Error) => {
        toast.error(error.message)
      },
    })
    return mutation
  }

  return {
    useImageUpload,
  }
}

export default useFileUpload
