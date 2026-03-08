import { LocalStorageKeys } from '../constants/localStorageKeys'
import { MediaFileDirectory } from '../constants/MediaFileDirectory'
import {
  InstitutionMediaUpdateData,
  InstitutionMediaUploadData,
  InstitutionMediaUploadResponse,
  MediaUploadResponse,
} from '../types/apiResponse'

import apiClient from './index'

export const uploadImage = async (
  directory: MediaFileDirectory,
  currentSchoolId: number,
  currentSiteId: number,
  file: File
): Promise<MediaUploadResponse> => {
  const formData = new FormData()
  formData.append('file', file)

  const res = await apiClient.post({
    needAuth: true,
    url: '/admin/media/upload',
    params: {
      directory,
      institutionId: currentSchoolId,
      siteId: currentSiteId,
    },
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return res.data.data
}

export const uploadImagePublic = async (
  directory: MediaFileDirectory,

  file: File
): Promise<MediaUploadResponse> => {
  const formData = new FormData()
  formData.append('file', file)

  const res = await apiClient.post({
    url: '/student/media/upload-ai',
    params: {
      directory,
      // Set this as the default institution for all public uploads
      userId: localStorage.getItem(LocalStorageKeys.FfBrowserId),
    },
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return res.data.data
}

export const uploadInstitutionGalleryImage = async ({
  siteId,
  institutionId,
  caption,
  tags,
  file,
  index,
}: InstitutionMediaUploadData): Promise<InstitutionMediaUploadResponse> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('caption', caption)
  formData.append('tags', tags)
  if (index) {
    formData.append('index', index.toString())
  }

  const res = await apiClient.post({
    needAuth: true,
    url: '/admin/institutions/galleries',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    params: {
      siteId,
      institutionId,
    },
  })

  return res.data.data
}

export const updateInstitutionGalleryImage = async ({
  id,
  institutionId,
  caption,
  tags,
}: InstitutionMediaUpdateData): Promise<InstitutionMediaUploadResponse> => {
  const res = await apiClient.post({
    needAuth: true,
    url: '/admin/institutions/galleries/update',
    data: {
      caption,
      tags,
      id,
      institutionId,
    },
    params: {
      institutionId,
    },
  })

  return res.data.data
}

// wait backend fix the success response type
export const deleteInstitutionGalleryImage = async ({
  siteId,
  institutionId,
  galleryId,
}: {
  siteId: number
  institutionId: number
  galleryId: number
}): Promise<InstitutionMediaUploadResponse> => {
  const res = await apiClient.delete({
    needAuth: true,
    url: '/admin/institutions/galleries/delete',
    data: {
      siteId,
      institutionId,
      galleryId,
    },
  })

  return res.data.data
}

export const getPrivateFileAccessUrl = async (key: string): Promise<string> => {
  const res = await apiClient.get({
    needAuth: true,
    url: '/admin/media/object-access-url',
    params: {
      key,
    },
  })

  return res.data.data
}
