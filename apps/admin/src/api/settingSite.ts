import {
  RegionLanguageSettingProps,
  RegionLanguageSettingResponse,
  WebpageInstitutionSettingProps,
} from '../types/settingWebpageInstitution'

import ApiError from './errors/apiError'
import apiClient from './index'

export const getWebpageStyle = async (
  institutionId: number
): Promise<WebpageInstitutionSettingProps> => {
  const res = await apiClient.get({
    url: '/admin/setting-webpage-institution/detail',
    params: {
      institutionId,
    },
    needAuth: true,
  })

  if (res.status === 201 || res.status === 200) {
    return res.data.data
  }

  if (res instanceof ApiError) {
    throw new ApiError(res.message, res.statusCode)
  }
  throw new Error('Unexpected response status')
}

export const updateWebpageStyle = async (
  settingWebpageInstitutionId: number,
  webpageSetting: Partial<WebpageInstitutionSettingProps>
): Promise<WebpageInstitutionSettingProps> => {
  const res = await apiClient.patch({
    url: '/admin/setting-webpage-institution/update',
    params: {
      settingWebpageInstitutionId,
    },
    needAuth: true,
    data: { ...webpageSetting },
  })

  if (res.status === 201 || res.status === 200) {
    return res.data.data
  }

  if (res instanceof ApiError) {
    throw new ApiError(res.message, res.statusCode)
  }
  throw new Error('Unexpected response status')
}

export const createWebpageStyle = async (
  institutionId: number,
  webpageSetting: Partial<WebpageInstitutionSettingProps>
): Promise<WebpageInstitutionSettingProps> => {
  const res = await apiClient.post({
    url: '/admin/setting-webpage-institution/create',
    needAuth: true,
    data: { institutionId, ...webpageSetting },
  })

  if (res.status === 201 || res.status === 200) {
    return res.data.data
  }

  if (res instanceof ApiError) {
    throw new ApiError(res.message, res.statusCode)
  }
  throw new Error('Unexpected response status')
}

export const getWebpageSetting = async (
  siteId: number
): Promise<RegionLanguageSettingResponse> => {
  const res = await apiClient.get({
    url: '/admin/setting-site/detail',
    params: {
      siteId,
    },
    needAuth: true,
  })

  if (res.status === 201 || res.status === 200) {
    return res.data.data
  }

  if (res instanceof ApiError) {
    throw new ApiError(res.message, res.statusCode)
  }
  throw new Error('Unexpected response status')
}

export const createWebpageSetting = async (
  webpageSetting: Partial<RegionLanguageSettingProps>
): Promise<RegionLanguageSettingResponse> => {
  const res = await apiClient.post({
    url: '/admin/setting-site/create',
    needAuth: true,
    params: { siteId: webpageSetting.siteId },
    data: { ...webpageSetting },
  })

  if (res.status === 201 || res.status === 200) {
    return res.data.data
  }

  if (res instanceof ApiError) {
    throw new ApiError(res.message, res.statusCode)
  }
  throw new Error('Unexpected response status')
}

export const updateWebpageSetting = async (
  settingSiteId: number,
  webpageSetting: Partial<RegionLanguageSettingProps>,
  siteId: number
): Promise<RegionLanguageSettingResponse> => {
  const res = await apiClient.patch({
    url: '/admin/setting-site/update',
    params: {
      settingSiteId,
      siteId,
    },
    needAuth: true,
    data: { ...webpageSetting },
  })

  if (res.status === 201 || res.status === 200) {
    return res.data.data
  }

  if (res instanceof ApiError) {
    throw new ApiError(res.message, res.statusCode)
  }
  throw new Error('Unexpected response status')
}
