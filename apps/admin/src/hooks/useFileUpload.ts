import { useTranslation } from 'react-i18next'
import { useMutation, UseMutationResult } from 'react-query'
import { useRecoilValue } from 'recoil'
import { toast } from 'sonner'

import ApiError, { handleApiError } from '../api/errors/apiError'
import {
  deleteInstitutionGalleryImage,
  updateInstitutionGalleryImage,
  uploadImage,
  uploadImagePublic,
  uploadInstitutionGalleryImage,
} from '../api/uploadFile'
import { MediaFileDirectory } from '../constants/MediaFileDirectory'
import { schoolState } from '../stores/schoolData'
import { siteState } from '../stores/siteData'
import {
  InstitutionMediaUpdateData,
  InstitutionMediaUploadData,
  InstitutionMediaUploadResponse,
  MediaUploadResponse,
} from '../types/apiResponse'

const useFileUpload = () => {
  const { t } = useTranslation()
  const schoolData = useRecoilValue(schoolState)
  const siteData = useRecoilValue(siteState)
  const currentSchoolId = schoolData.currentSchool?.id || 0
  const currentSiteId = siteData.currentSite?.id || 0

  const useImageUpload = (
    directory: MediaFileDirectory,
    successfulCallback: (data: MediaUploadResponse) => void
  ): UseMutationResult<MediaUploadResponse, ApiError, File, unknown> => {
    const mutation = useMutation({
      mutationFn: (file: File) =>
        uploadImage(directory, currentSchoolId, currentSiteId, file),
      onSuccess: (data: MediaUploadResponse) => {
        toast.success(t('component:ImageUpload.uploadSuccess'))
        successfulCallback?.(data)
      },
      onError: (error: ApiError) => {
        toast.error(error.message)
      },
    })
    return mutation
  }

  const useImageUploadPublic = (
    directory: MediaFileDirectory,
    successfulCallback: (data: MediaUploadResponse) => void
  ): UseMutationResult<MediaUploadResponse, ApiError, File, unknown> => {
    const mutation = useMutation({
      mutationFn: (file: File) => uploadImagePublic(directory, file),
      onSuccess: (data: MediaUploadResponse) => {
        toast.success(t('component:ImageUpload.uploadSuccess'))
        successfulCallback?.(data)
      },
      onError: (error: ApiError) => {
        toast.error(error.message)
      },
    })
    return mutation
  }

  const useInstitutionGalleryImageUpload = (
    successfulCallback: (data: InstitutionMediaUploadResponse) => void
  ): UseMutationResult<
    InstitutionMediaUploadResponse,
    ApiError,
    InstitutionMediaUploadData,
    unknown
  > => {
    const mutation = useMutation({
      mutationFn: (data: InstitutionMediaUploadData) =>
        uploadInstitutionGalleryImage(data),
      onSuccess: (data: InstitutionMediaUploadResponse) => {
        toast.success(t('component:ImageUpload.uploadSuccess'))
        successfulCallback?.(data)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return mutation
  }

  const useInstitutionGalleryImageUpdate = (
    successfulCallback: (data: InstitutionMediaUploadResponse) => void
  ): UseMutationResult<
    InstitutionMediaUploadResponse,
    ApiError,
    InstitutionMediaUpdateData,
    unknown
  > => {
    const mutation = useMutation({
      mutationFn: (data: InstitutionMediaUpdateData) =>
        updateInstitutionGalleryImage(data),
      onSuccess: (data: InstitutionMediaUploadResponse) => {
        toast.success(t('component:ImageUpload.updateSuccess'))
        successfulCallback?.(data)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return mutation
  }

  const useDeleteInstitutionGalleryImage = (
    successfulCallback?: (data: InstitutionMediaUploadResponse) => void
  ): UseMutationResult<
    InstitutionMediaUploadResponse,
    ApiError,
    {
      siteId: number
      institutionId: number
      galleryId: number
    },
    unknown
  > => {
    const mutation = useMutation({
      mutationFn: (data: {
        siteId: number
        institutionId: number
        galleryId: number
      }) => deleteInstitutionGalleryImage(data),
      onSuccess: (data: InstitutionMediaUploadResponse) => {
        successfulCallback?.(data)
        toast.success(t('school:gallery.deleteImageSuccess'))
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
    return mutation
  }

  return {
    useImageUpload,
    useImageUploadPublic,
    useInstitutionGalleryImageUpload,
    useInstitutionGalleryImageUpdate,
    useDeleteInstitutionGalleryImage,
  }
}

export default useFileUpload
