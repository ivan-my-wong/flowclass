/* eslint-disable prettier/prettier */
import { useState } from 'react'

import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { useRecoilState } from 'recoil'
import { toast } from 'sonner'

import ApiError, { handleApiError } from '@/api/errors/apiError'
import {
  bulkUploadTeacherFeedback,
  deleteStudentSubmissionMaterials,
  downloadStudentSubmissionMaterial,
  downloadStudentSubmissionMaterialByLesson,
  getListStudentSubmission,
  getListStudentSubmissionByLesson,
  uploadTeacherFeedback,
} from '@/api/student-submission'
import { QUERY_KEY } from '@/constants/queryKey'
import { API_BASE_URL } from '@/lib/config'
import {
  currentUploadProgressState,
  uploadProgressState,
} from '@/stores/uploadProgress'
import { ListParams, UploadProgress } from '@/types/class-material'
import { StudentSubmissionNotificationSetting } from '@/types/student-submission'

import useSchoolData from './useSchoolData'

const useStudentSubmissionData = () => {
  const { t } = useTranslation(['material'])
  const { currentSchool } = useSchoolData()
  const queryClient = useQueryClient()
  const institutionId = currentSchool?.id || 0
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [isDownloading, setIsDownloading] = useState(false)

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
          QUERY_KEY.studentSubmission.getListStudentSubmissionKey,
          institutionId,
        ])
        setTimeout(() => {
          setCurrentUploadProgress(null)
        }, 1000)
      }
      // Handle progress data from server
    }
  }
  const useGetListStudentSubmission = (params?: ListParams) => {
    return useQuery({
      queryKey: [
        QUERY_KEY.studentSubmission.getListStudentSubmissionKey,
        institutionId,
      ],
      queryFn: () =>
        getListStudentSubmission({
          ...params,
          institutionId,
        }),
      enabled: !!institutionId,
    })
  }

  const useGetListStudentSubmissionByLesson = (params?: ListParams) => {
    return useQuery({
      queryKey: [
        QUERY_KEY.studentSubmission.getListStudentSubmissionByLessonKey,
        institutionId,
      ],
      queryFn: () =>
        getListStudentSubmissionByLesson({
          ...params,
          institutionId,
        }),
      enabled: !!institutionId,
    })
  }

  const useDeleteStudentSubmissionMaterial = (
    isByLesson?: boolean,
    onSuccessCallback?: () => void
  ) => {
    return useMutation({
      mutationFn: (params: {
        studentSubmissionId?: number
        teacherFeedbackId?: number
        materialId: number
      }) => deleteStudentSubmissionMaterials({ ...params, institutionId }),
      onSuccess: () => {
        toast.success(t('deleteMaterialSuccess'))
        onSuccessCallback?.()
        queryClient.invalidateQueries([
          isByLesson
            ? QUERY_KEY.studentSubmission.getListStudentSubmissionByLessonKey
            : QUERY_KEY.studentSubmission.getListStudentSubmissionKey,
          institutionId,
        ])
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }

  const useDownloadStudentSubmissionMaterial = (
    onDownloadProgress?: (progressEvent: ProgressEvent) => void
  ) => {
    return useMutation({
      mutationFn: (params: { studentSubmissionId: number }) => {
        setIsDownloading(true)
        setDownloadProgress(0)
        return downloadStudentSubmissionMaterial(
          { ...params, institutionId },
          progressEvent => {
            const percentage = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            )
            setDownloadProgress(percentage)
            onDownloadProgress?.(progressEvent)
          }
        )
      },
      onSuccess: () => {
        toast.success(t('downloadMaterialSuccess'))
        setIsDownloading(false)
        setDownloadProgress(0)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
        setIsDownloading(false)
        setDownloadProgress(0)
      },
    })
  }

  const useDownloadStudentSubmissionMaterialByLesson = (
    onDownloadProgress?: (progressEvent: ProgressEvent) => void
  ) => {
    return useMutation({
      mutationFn: (params: { classLessonId: number }) => {
        setIsDownloading(true)
        setDownloadProgress(0)
        return downloadStudentSubmissionMaterialByLesson(
          { ...params, institutionId },
          progressEvent => {
            const percentage = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            )
            setDownloadProgress(percentage)
            onDownloadProgress?.(progressEvent)
          }
        )
      },
      onSuccess: () => {
        toast.success(t('downloadMaterialSuccess'))
        setIsDownloading(false)
        setDownloadProgress(0)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
        setIsDownloading(false)
        setDownloadProgress(0)
      },
    })
  }

  const useUploadTeacherFeedback = (
    onUploadProgress?: (progressEvent: ProgressEvent) => void
  ) => {
    return useMutation({
      mutationFn: (params: { studentLessonId: number; files: File[] }) =>
        uploadTeacherFeedback({ ...params, institutionId }, onUploadProgress),
      onSuccess: (data: UploadProgress) => {
        setUploadProgress(prev => ({
          ...prev,
          [data.uploadId]: data,
        }))
        setCurrentUploadProgress(data)
        startEvent(data)
      },
    })
  }

  const useBulkUploadTeacherFeedback = (
    onUploadProgress?: (progressEvent: ProgressEvent) => void
  ) => {
    return useMutation({
      mutationFn: (params: {
        classLessonId: number
        files: File[]
        fileStudentMap: Record<string, string[]>
        notificationSetting: StudentSubmissionNotificationSetting
      }) =>
        bulkUploadTeacherFeedback(
          { ...params, institutionId },
          onUploadProgress
        ),
      onSuccess: (data: UploadProgress) => {
        setUploadProgress(prev => ({
          ...prev,
          [data.uploadId]: data,
        }))
        setCurrentUploadProgress(data)
        startEvent(data)
      },
      onError: (error: ApiError) => {
        handleApiError({ error, t })
      },
    })
  }
  return {
    useGetListStudentSubmission,
    useGetListStudentSubmissionByLesson,
    useDeleteStudentSubmissionMaterial,
    useDownloadStudentSubmissionMaterial,
    useDownloadStudentSubmissionMaterialByLesson,
    useUploadTeacherFeedback,
    downloadProgress,
    isDownloading,
    uploadProgress,
    currentUploadProgress,
    useBulkUploadTeacherFeedback,
  }
}

export default useStudentSubmissionData
