import { Course } from '../types/course'
import {
  CreateSEOSettingsResponse,
  CreateSEOSettingsTypes,
  UpdateCourseSEOSettingsTypes,
} from '../types/seoSettings.type'

import apiClient from './index'

export const createSEOSettings = async ({
  metaTitle,
  metaDescription,
  institutionId,
}: CreateSEOSettingsTypes): Promise<CreateSEOSettingsResponse> => {
  const res = await apiClient.post({
    url: '/admin/seo-settings/create',
    needAuth: true,
    data: {
      institutionId,
      seoContent: {
        metaTitle,
        metaDescription,
      },
    },
  })

  return res.data.data
}

export const updateCourseSEOSettings = async ({
  courseId,
  metaTitle,
  metaDescription,
}: UpdateCourseSEOSettingsTypes): Promise<Course> => {
  const res = await apiClient.patch({
    url: `/admin/seo-settings/update-course/?courseId=${courseId}`,
    needAuth: true,
    data: {
      metaTitle,
      metaDescription,
    },
  })

  return res.data.data
}
