import {
  ClassMaterialsType,
  CreateClassMaterialsData,
  ListParams,
  NotifyStudentClassMaterialsDto,
  UpdateExpiryData,
  UpdateExpiryDataForStudent,
  UploadProgress,
} from '@/types/class-material'

import apiClient from '.'

export const getListClassMaterials = async (
  params: ListParams
): Promise<{
  data: ClassMaterialsType[]
  total: number
}> => {
  const res = await apiClient.get({
    url: '/admin/class-materials/list',
    needAuth: true,
    params: {
      ...params,
      classIds: params.classIds?.join(','),
      lessonIds: params.lessonIds?.join(','),
    },
  })

  return res.data.data
}

export const createClassMaterials = async (
  data: CreateClassMaterialsData,
  institutionId?: number,
  onUploadProgress?: (progressEvent: ProgressEvent) => void
): Promise<UploadProgress> => {
  const formData = new FormData()

  formData.append('classLessonId', data.classLessonId.toString())
  formData.append('classId', data.classId.toString())
  formData.append('courseId', data.courseId.toString())
  formData.append('mediaMaterials', JSON.stringify(data.mediaMaterials))

  // Append files as array - backend expects { files?: Express.Multer.File[] }
  data.files.forEach(file => {
    formData.append('files', file)
  })
  const res = await apiClient.post({
    url: '/admin/class-materials/create-sync',
    needAuth: true,
    data: formData,
    params: {
      institutionId,
    },
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  })

  return res.data.data
}

export const notifyStudentClassMaterials = async (
  classMaterialsId: number,
  data: NotifyStudentClassMaterialsDto,
  institutionId?: number
) => {
  const res = await apiClient.post({
    url: `/admin/class-materials/${classMaterialsId}/send-notification`,
    needAuth: true,
    data,
    params: {
      institutionId,
    },
  })
  return res.data.data
}

export const updateClassMaterialExpiry = async (
  classMaterialsId: number,
  mediaMaterialId: number,
  data: UpdateExpiryData,
  institutionId: number
) => {
  const res = await apiClient.put({
    url: `/admin/class-materials/${classMaterialsId}/${mediaMaterialId}/expiry`,
    needAuth: true,
    data,
    params: {
      institutionId,
    },
  })
  return res.data.data
}

export const updateClassMaterialExpiryForStudent = async (
  classMaterialsId: number,
  data: UpdateExpiryDataForStudent,
  institutionId: number
) => {
  const res = await apiClient.put({
    url: `/admin/class-materials/${classMaterialsId}/student/expiry-date`,
    needAuth: true,
    data,
    params: {
      institutionId,
    },
  })
  return res.data.data
}

export const deleteClassMaterialMedia = async (
  classMaterialsId: number,
  mediaMaterialId: number,
  institutionId: number
) => {
  const res = await apiClient.delete({
    url: `/admin/class-materials/${classMaterialsId}/${mediaMaterialId}`,
    needAuth: true,
    params: {
      institutionId,
    },
  })
  return res.data.data
}
