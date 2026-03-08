import {
  CustomSiteUpdateProps,
  RegisterSiteResponse,
  Site,
} from '../stores/siteData'

import apiClient from './index'

export const getSites = async (): Promise<Site[]> => {
  const res = await apiClient.get({
    url: '/admin/sites',
    needAuth: true,
  })

  if (res) {
    return res.data.data.content
  }
  throw new Error('Unexpected response status')
}

export const createSite = async ({
  url,
  name,
}: {
  url: string
  name: string
}): Promise<RegisterSiteResponse> => {
  const res = await apiClient.post({
    url: '/admin/sites/register',
    needAuth: true,
    data: {
      url,
      name,
    },
  })
  if (res) {
    return res.data.data
  }
  throw new Error('Unexpected response status')
}

export const joinSite = async (token: string): Promise<Site[]> => {
  const res = await apiClient.post({
    url: '/admin/users/accept-invite',
    needAuth: true,
    data: {
      token,
      agree: true,
    },
  })
  if (res) {
    return res.data.data.content
  }

  throw new Error('Unexpected response status')
}

export const setSiteIntlSettings = async ({
  language,
  timeZone,
  currency,
  country,
  siteId,
  countryCode,
}: {
  language: string
  timeZone: string
  currency: string
  country: string
  siteId: number
  countryCode: string
}): Promise<Site> => {
  const res = await apiClient.post({
    url: '/admin/setting-site/create',
    needAuth: true,
    data: {
      language,
      timeZone,
      currency,
      country,
      siteId,
      countryCode,
    },
  })
  if (res) {
    return res.data.data.content
  }
  throw new Error('Unexpected response status')
}

export const updateCustomSite = async (
  siteId: number,
  site: Partial<CustomSiteUpdateProps>
): Promise<Site> => {
  const res = await apiClient.patch({
    url: '/admin/sites/update',
    needAuth: true,
    params: { siteId },
    data: {
      ...site,
    },
  })
  if (res) {
    return res.data.data
  }
  throw new Error('Unexpected response status')
}

export const checkDomainAvailability = async (
  domain: string
): Promise<Site | null> => {
  const res = await apiClient.get({
    url: '/student/sites/detail',
    needAuth: true,
    params: { domain },
  })

  if (res && res.data && res.data.data) {
    return res.data.data
  }

  return null
}
