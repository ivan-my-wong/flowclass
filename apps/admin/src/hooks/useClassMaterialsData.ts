import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { useRecoilState } from 'recoil'
import { toast } from 'sonner'

import {
  createClassMaterials,
  deleteClassMaterialMedia,
  getListClassMaterials,
  notifyStudentClassMaterials,
  updateClassMaterialExpiry,
  updateClassMaterialExpiryForStudent,
} from '@/api/class-materials'
import ApiError, { handleApiError } from '@/api/errors/apiError'
import { QUERY_KEY } from '@/constants/queryKey'
import { API_BASE_URL } from '@/lib/config'
import {
  currentUploadProgressState,
  uploadProgressState,
} from '@/stores/uploadProgress'
import {
  CreateClassMaterialsData,
  ListParams,
  NotifyStudentClassMaterialsDto,
  UpdateExpiryData,
  UpdateExpiryDataForStudent,
  UploadProgress,
} from '@/types/class-material'

import useSchoolData from './useSchoolData'

export const useClassMaterialsData = () => {
  const { currentSchool } = useSchoolData()
  const { t } = useTranslation(['material'])
  const queryClient = useQueryClient()
  const institutionId = currentSchool?.id || 0
  const [uploadProgress, setUploadProgress] =
    useRecoilState(uploadProgressState)
  const [currentUploadProgress, setCurrentUploadProgress] = useRecoilState(
    currentUploadProgressState
  )
  const startEvent = (uploadProgress: UploadProgress): void => {
    const eventSource = new EventSource(
      `${API_BASE_URL}/stream/${uploadProgress.uploadId}`
    )
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
      if (data.status === 'completed') {
        toast.success(
          data.message ?? t('uploadMaterials.message.uploadingCompleted')
        )
        queryClient.invalidateQueries([
          QUERY_KEY.classMaterials.getListClassMaterialsKey,
          institutionId,
        ])
        setTimeout(() => {
          setCurrentUploadProgress(null)
        }, 1000)
      }
      // Handle progress data from server
    }
  }
  const useGetListClassMaterials = (params: ListParams) => {
    return useQuery({
      queryKey: [
        QUERY_KEY.classMaterials.getListClassMaterialsKey,
        institutionId,
        params,
      ],
      queryFn: () =>
        getListClassMaterials({
          ...params,
          institutionId,
        }),
      enabled: !!institutionId,
    })
  }
  const useCreateClassMaterials = () => {
    return useMutation({
      mutationFn: (data: CreateClassMaterialsData) =>
        createClassMaterials(data, institutionId),
      onSuccess: data => {
        setUploadProgress({
          [data.uploadId]: data,
        })
        setCurrentUploadProgress(data)
        startEvent(data)
      },
    })
  }

  const useCreateClassMaterialsWithProgress = (
    onProgress?: (progressEvent: ProgressEvent) => void
  ) => {
    return useMutation({
      mutationFn: (data: CreateClassMaterialsData) =>
        createClassMaterials(data, institutionId, onProgress),
      onSuccess: data => {
        setUploadProgress(prev => ({
          ...prev,
          [data.uploadId]: data,
        }))
        setCurrentUploadProgress(data)
        startEvent(data)
      },
    })
  }
  const useNotifyStudentClassMaterials = (
    classMaterialsId: number,
    onSuccessCallback?: () => void
  ) => {
    return useMutation({
      mutationFn: (data: NotifyStudentClassMaterialsDto) =>
        notifyStudentClassMaterials(classMaterialsId, data, institutionId),
      onSuccess: () => {
        toast.success(t('material:notifyStudentSuccess'))
        onSuccessCallback?.()
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }
  const useUpdateClassMaterialExpiry = (
    classMaterialsId: number,
    mediaMaterialId: number,
    onSuccessCallback?: () => void
  ) => {
    return useMutation({
      mutationFn: (data: UpdateExpiryData) =>
        updateClassMaterialExpiry(
          classMaterialsId,
          mediaMaterialId,
          data,
          institutionId
        ),
      onSuccess: () => {
        toast.success(t('material:updateExpirySuccess'))
        queryClient.invalidateQueries([
          QUERY_KEY.classMaterials.getListClassMaterialsKey,
          institutionId,
        ])
        onSuccessCallback?.()
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  const useUpdateClassMaterialExpiryForStudent = (
    classMaterialsId: number,
    onSuccessCallback?: () => void
  ) => {
    return useMutation({
      mutationFn: (data: UpdateExpiryDataForStudent) =>
        updateClassMaterialExpiryForStudent(
          classMaterialsId,
          data,
          institutionId
        ),
      onSuccess: () => {
        toast.success(t('material:updateExpirySuccess'))
        queryClient.invalidateQueries([
          QUERY_KEY.classMaterials.getListClassMaterialsKey,
          institutionId,
        ])
        onSuccessCallback?.()
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }
  const useDeleteClassMaterialMedia = (
    classMaterialsId: number,
    mediaMaterialId: number,
    onSuccessCallback?: () => void
  ) => {
    return useMutation({
      mutationFn: () =>
        deleteClassMaterialMedia(
          classMaterialsId,
          mediaMaterialId,
          institutionId
        ),
      onSuccess: () => {
        toast.success(t('material:deleteMediaMaterialSuccess'))
        // Invalidate queries to refresh the data
        queryClient.invalidateQueries([
          QUERY_KEY.classMaterials.getListClassMaterialsKey,
          institutionId,
        ])
        onSuccessCallback?.()
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  return {
    useGetListClassMaterials,
    useCreateClassMaterials,
    useCreateClassMaterialsWithProgress,
    uploadProgress,
    currentUploadProgress,
    useNotifyStudentClassMaterials,
    useUpdateClassMaterialExpiry,
    useDeleteClassMaterialMedia,
    useUpdateClassMaterialExpiryForStudent,
  }
}
