import { AxiosResponse } from 'axios'

import { ListParams, UploadProgress } from '@/types/class-material'
import { ClassLesson } from '@/types/student'
import {
  StudentSubmissionNotificationSetting,
  StudentSubmissionType,
} from '@/types/student-submission'

import apiClient from '.'

export const getListStudentSubmission = async (
  params: ListParams
): Promise<{
  data: StudentSubmissionType[]
  total: number
}> => {
  const res = await apiClient.get({
    url: '/admin/student-submission/list',
    needAuth: true,
    params: {
      ...params,
      classIds: params.classIds?.join(','),
      lessonIds: params.lessonIds?.join(','),
    },
  })

  return res.data.data
}

export const getListStudentSubmissionByLesson = async (
  params: ListParams
): Promise<{
  data: ClassLesson[]
  total: number
}> => {
  const res = await apiClient.get({
    url: '/admin/student-submission/list-by-lesson',
    needAuth: true,
    params: {
      ...params,
      classIds: params.classIds?.join(','),
      lessonIds: params.lessonIds?.join(','),
    },
  })

  return res.data.data
}

export const deleteStudentSubmissionMaterials = async (params: {
  studentSubmissionId?: number
  teacherFeedbackId?: number
  materialId: number
  institutionId: number
}): Promise<void> => {
  await apiClient.delete({
    url: `/admin/student-submission/material/${params.materialId}`,
    params: {
      institutionId: params.institutionId,
      studentSubmissionId: params.studentSubmissionId,
      teacherFeedbackId: params.teacherFeedbackId,
    },
    needAuth: true,
  })
}

const convertResponseToBlobAndDownload = (
  res: AxiosResponse,
  identifier: string
) => {
  const contentDisposition = res.headers['content-disposition']
  let filename = `submission_${identifier}.zip`

  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(
      /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
    )
    if (filenameMatch && filenameMatch[1]) {
      filename = filenameMatch[1].replace(/['"]/g, '')
    }
  }

  // Create blob URL and trigger download
  const blob = new Blob([res.data])
  const url = window.URL.createObjectURL(blob)

  // Create temporary link element and trigger download
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()

  // Cleanup
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

export const downloadStudentSubmissionMaterial = async (
  params: {
    studentSubmissionId: number
    institutionId: number
  },
  onDownloadProgress?: (progressEvent: ProgressEvent) => void
): Promise<void> => {
  const res = await apiClient.get({
    url: `/admin/student-submission/${params.studentSubmissionId}/bulk-download`,
    params: {
      institutionId: params.institutionId,
      studentSubmissionId: params.studentSubmissionId,
    },
    onDownloadProgress,
    needAuth: true,
    responseType: 'blob', // Important: Set response type to blob for binary data
  })

  // Extract filename from Content-Disposition header
  convertResponseToBlobAndDownload(res, params.studentSubmissionId.toString())
}

export const downloadStudentSubmissionMaterialByLesson = async (
  params: {
    classLessonId: number
    institutionId: number
  },
  onDownloadProgress?: (progressEvent: ProgressEvent) => void
): Promise<void> => {
  const res = await apiClient.get({
    url: `/admin/student-submission/${params.classLessonId}/bulk-download-by-lesson`,
    params: {
      institutionId: params.institutionId,
    },
    onDownloadProgress,
    needAuth: true,
    responseType: 'blob',
  })
  convertResponseToBlobAndDownload(res, params.classLessonId.toString())
}

export const uploadTeacherFeedback = async (
  params: {
    studentLessonId: number
    institutionId: number
    files: File[]
  },
  onUploadProgress?: (progressEvent: ProgressEvent) => void
): Promise<UploadProgress> => {
  const formData = new FormData()
  params.files.forEach(file => {
    formData.append('files', file)
  })
  const res = await apiClient.post({
    url: `/admin/student-submission/${params.studentLessonId}/upload-feedback`,
    params: {
      institutionId: params.institutionId,
    },
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    needAuth: true,
    onUploadProgress,
  })
  return res.data.data
}
/**
 * Bulk upload teacher feedback files mapped to students.
 * @param params - { classLessonId, institutionId, files, notificationSetting, fileStudentMap }
 * @param onUploadProgress - Optional progress callback.
 * @returns UploadProgress
 */
export const bulkUploadTeacherFeedback = async (
  params: {
    classLessonId: number
    institutionId: number
    files: File[]
    notificationSetting: StudentSubmissionNotificationSetting
    fileStudentMap: Record<string, string[]>
  },
  onUploadProgress?: (progressEvent: ProgressEvent) => void
): Promise<UploadProgress> => {
  const formData = new FormData()
  params.files.forEach(file => {
    formData.append('files', file)
  })
  formData.append('fileStudentMap', JSON.stringify(params.fileStudentMap))
  formData.append(
    'notificationSetting',
    JSON.stringify(params.notificationSetting)
  )
  const res = await apiClient.post({
    url: `/admin/student-submission/${params.classLessonId}/bulk-upload-feedback`,
    params: {
      institutionId: params.institutionId,
    },
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    needAuth: true,
    onUploadProgress,
  })
  return res.data.data
}
